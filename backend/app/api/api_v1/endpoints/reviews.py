from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.review import Review
from app.models.product import Product
from app.models.user import User
from app.api.api_v1.endpoints.auth import get_current_user

router = APIRouter()

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    reviewer_name: Optional[str] = None
    reviewer_email: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: Optional[int]
    rating: int
    title: Optional[str]
    comment: Optional[str]
    reviewer_name: Optional[str]
    reviewer_email: Optional[str]
    is_approved: bool
    is_verified_purchase: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class ReviewStats(BaseModel):
    average_rating: float
    total_reviews: int
    rating_distribution: dict

@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Create a new product review"""
    try:
        # Validate product exists
        product_result = await db.execute(
            select(Product).where(Product.id == review_data.product_id)
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        # Validate rating
        if review_data.rating < 1 or review_data.rating > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rating must be between 1 and 5"
            )

        # Check if user already reviewed this product
        if current_user:
            existing_review = await db.execute(
                select(Review).where(
                    Review.product_id == review_data.product_id,
                    Review.user_id == current_user.id
                )
            )
            if existing_review.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You have already reviewed this product"
                )

        # Create review
        review = Review(
            product_id=review_data.product_id,
            user_id=current_user.id if current_user else None,
            rating=review_data.rating,
            title=review_data.title,
            comment=review_data.comment,
            reviewer_name=review_data.reviewer_name,
            reviewer_email=review_data.reviewer_email,
            is_verified_purchase=current_user is not None,  # Assume verified if logged in
            is_approved=True  # Auto-approve for now
        )

        db.add(review)
        await db.commit()
        await db.refresh(review)

        return review

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create review: {str(e)}"
        )

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: int,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get reviews for a specific product"""
    try:
        result = await db.execute(
            select(Review)
            .where(Review.product_id == product_id, Review.is_approved == True)
            .offset(skip)
            .limit(limit)
            .order_by(Review.created_at.desc())
        )
        reviews = result.scalars().all()
        return reviews

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reviews: {str(e)}"
        )

@router.get("/product/{product_id}/stats", response_model=ReviewStats)
async def get_product_review_stats(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get review statistics for a product"""
    try:
        # Get all approved reviews for the product
        result = await db.execute(
            select(Review)
            .where(Review.product_id == product_id, Review.is_approved == True)
        )
        reviews = result.scalars().all()

        if not reviews:
            return ReviewStats(
                average_rating=0.0,
                total_reviews=0,
                rating_distribution={1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            )

        # Calculate statistics
        total_reviews = len(reviews)
        average_rating = sum(review.rating for review in reviews) / total_reviews

        # Calculate rating distribution
        rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for review in reviews:
            rating_distribution[review.rating] += 1

        return ReviewStats(
            average_rating=round(average_rating, 1),
            total_reviews=total_reviews,
            rating_distribution=rating_distribution
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch review stats: {str(e)}"
        )

@router.get("/user", response_model=List[ReviewResponse])
async def get_user_reviews(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get reviews by the current user"""
    try:
        result = await db.execute(
            select(Review)
            .where(Review.user_id == current_user.id)
            .offset(skip)
            .limit(limit)
            .order_by(Review.created_at.desc())
        )
        reviews = result.scalars().all()
        return reviews

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user reviews: {str(e)}"
        )

@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: int,
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a review (only by the author)"""
    try:
        result = await db.execute(
            select(Review).where(
                Review.id == review_id,
                Review.user_id == current_user.id
            )
        )
        review = result.scalar_one_or_none()

        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found or you don't have permission to edit it"
            )

        # Update review fields
        review.rating = review_data.rating
        review.title = review_data.title
        review.comment = review_data.comment
        review.updated_at = datetime.now()

        await db.commit()
        await db.refresh(review)

        return review

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update review: {str(e)}"
        )

@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a review (only by the author)"""
    try:
        result = await db.execute(
            select(Review).where(
                Review.id == review_id,
                Review.user_id == current_user.id
            )
        )
        review = result.scalar_one_or_none()

        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found or you don't have permission to delete it"
            )

        await db.delete(review)
        await db.commit()

        return {"message": "Review deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete review: {str(e)}"
        )