from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderItemCreate
from app.api.api_v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new order"""
    try:
        # Create order
        order = Order(
            order_number=f"CP{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:6].upper()}",
            user_id=current_user.id,
            status="pending",
            total_amount=order_data.total_amount,
            shipping_address=order_data.shipping_address,
            billing_address=order_data.billing_address,
            payment_method=order_data.payment_method,
            notes=order_data.notes
        )
        
        db.add(order)
        await db.flush()  # Get the order ID
        
        # Create order items
        for item_data in order_data.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                price=item_data.price
            )
            db.add(order_item)
        
        await db.commit()
        await db.refresh(order)
        
        return order
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get orders for the current user"""
    try:
        query = select(Order).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
        result = await db.execute(query)
        orders = result.scalars().all()
        
        return orders
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific order by ID"""
    try:
        query = select(Order).where(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch order: {str(e)}"
        )
