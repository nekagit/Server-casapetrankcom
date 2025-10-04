from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.models.newsletter import NewsletterSubscription as NewsletterModel
from datetime import datetime

router = APIRouter()

class NewsletterSubscriptionRequest(BaseModel):
    email: EmailStr
    source: str = "website"

class NewsletterResponse(BaseModel):
    email: str
    subscribed_at: datetime
    is_active: bool

class NewsletterUnsubscribeRequest(BaseModel):
    email: EmailStr

@router.post("/subscribe", response_model=NewsletterResponse)
async def subscribe_newsletter(
    subscription: NewsletterSubscriptionRequest,
    db: AsyncSession = Depends(get_db)
):
    """Subscribe to newsletter"""
    try:
        # Check if email already exists
        result = await db.execute(
            select(NewsletterModel).where(NewsletterModel.email == subscription.email)
        )
        existing_subscription = result.scalar_one_or_none()
        
        if existing_subscription:
            if existing_subscription.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Diese E-Mail-Adresse ist bereits für den Newsletter angemeldet."
                )
            else:
                # Reactivate subscription
                existing_subscription.is_active = True
                existing_subscription.subscribed_at = datetime.now()
                existing_subscription.unsubscribed_at = None
                existing_subscription.source = subscription.source
                await db.commit()
                await db.refresh(existing_subscription)
                return existing_subscription
        else:
            # Create new subscription
            new_subscription = NewsletterModel(
                email=subscription.email,
                source=subscription.source,
                is_active=True
            )
            db.add(new_subscription)
            await db.commit()
            await db.refresh(new_subscription)
            return new_subscription
            
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Newsletter-Abonnement: {str(e)}"
        )

@router.post("/unsubscribe")
async def unsubscribe_newsletter(
    subscription: NewsletterUnsubscribeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Unsubscribe from newsletter"""
    try:
        result = await db.execute(
            select(NewsletterModel).where(NewsletterModel.email == subscription.email)
        )
        existing_subscription = result.scalar_one_or_none()
        
        if not existing_subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diese E-Mail-Adresse ist nicht für den Newsletter angemeldet."
            )
        
        if not existing_subscription.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Diese E-Mail-Adresse ist bereits vom Newsletter abgemeldet."
            )
        
        # Deactivate subscription
        existing_subscription.is_active = False
        existing_subscription.unsubscribed_at = datetime.now()
        await db.commit()
        
        return {
            "message": "Erfolgreich vom Newsletter abgemeldet.",
            "email": subscription.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Newsletter-Abmelden: {str(e)}"
        )

@router.get("/subscribers")
async def get_subscribers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get newsletter subscribers (admin only)"""
    try:
        # Get total count
        count_result = await db.execute(
            select(NewsletterModel).where(NewsletterModel.is_active == True)
        )
        total = len(count_result.scalars().all())
        
        # Get paginated results
        result = await db.execute(
            select(NewsletterModel)
            .where(NewsletterModel.is_active == True)
            .offset(skip)
            .limit(limit)
            .order_by(NewsletterModel.subscribed_at.desc())
        )
        subscribers = result.scalars().all()
        
        return {
            "subscribers": [
                {
                    "id": sub.id,
                    "email": sub.email,
                    "subscribed_at": sub.subscribed_at,
                    "source": sub.source
                }
                for sub in subscribers
            ],
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fehler beim Abrufen der Newsletter-Abonnenten: {str(e)}"
        )
