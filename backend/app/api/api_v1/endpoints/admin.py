from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.product import Product
from app.models.order import Order
from app.models.user import User

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    """Get admin dashboard statistics"""
    
    # Calculate date ranges
    today = datetime.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    # Get basic counts
    products_count = await db.scalar(select(func.count(Product.id)))
    orders_count = await db.scalar(select(func.count(Order.id)))
    customers_count = await db.scalar(select(func.count(User.id)))
    
    # Calculate revenue (this would be more complex with real data)
    total_revenue = 15420.50  # Simulated
    
    # Recent activity
    recent_orders_query = select(Order).order_by(Order.created_at.desc()).limit(5)
    recent_orders_result = await db.execute(recent_orders_query)
    recent_orders = recent_orders_result.scalars().all()

    return {
        "overview": {
            "total_revenue": total_revenue,
            "total_orders": orders_count or 0,
            "total_products": products_count or 0,
            "total_customers": customers_count or 0
        },
        "recent_orders": [
            {
                "id": order.id,
                "order_number": order.order_number,
                "customer_name": f"{order.customer_first_name} {order.customer_last_name}",
                "total": order.total_amount,
                "status": order.status,
                "created_at": order.created_at
            } for order in recent_orders
        ],
        "trends": {
            "orders_this_week": 12,  # Simulated
            "orders_last_week": 8,
            "revenue_this_month": 3420.50,
            "revenue_last_month": 2890.30
        }
    }

@router.get("/orders/recent")
async def get_recent_orders(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get recent orders for admin"""
    query = select(Order).order_by(Order.created_at.desc()).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return {
        "orders": [
            {
                "id": order.id,
                "order_number": order.order_number,
                "customer_name": f"{order.customer_first_name} {order.customer_last_name}",
                "customer_email": order.customer_email,
                "total_amount": order.total_amount,
                "status": order.status,
                "created_at": order.created_at,
                "items_count": len(order.items) if order.items else 0
            } for order in orders
        ]
    }

@router.get("/customers")
async def get_customers(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get customers list for admin"""
    query = select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
    result = await db.execute(query)
    customers = result.scalars().all()
    
    # Get total count
    count_result = await db.execute(select(func.count(User.id)))
    total = count_result.scalar()
    
    return {
        "customers": [
            {
                "id": customer.id,
                "email": customer.email,
                "first_name": customer.first_name,
                "last_name": customer.last_name,
                "created_at": customer.created_at,
                "is_active": customer.is_active,
                "newsletter_subscribed": customer.newsletter_subscribed
            } for customer in customers
        ],
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/analytics")
async def get_analytics(
    range: str = "month",
    db: AsyncSession = Depends(get_db)
):
    """Get analytics data"""
    
    # Calculate date range
    end_date = datetime.now()
    if range == "week":
        start_date = end_date - timedelta(days=7)
    elif range == "month":
        start_date = end_date - timedelta(days=30)
    elif range == "quarter":
        start_date = end_date - timedelta(days=90)
    else:  # year
        start_date = end_date - timedelta(days=365)

    # In a real implementation, these would be calculated from actual data
    return {
        "revenue": {
            "total": 15420.50,
            "change_percentage": 12.5,
            "trend": "up"
        },
        "orders": {
            "total": 89,
            "change_percentage": 8.3,
            "trend": "up"
        },
        "customers": {
            "total": 156,
            "change_percentage": 15.2,
            "trend": "up"
        },
        "conversion_rate": {
            "rate": 3.2,
            "change_percentage": 0.8,
            "trend": "up"
        },
        "top_products": [
            {"name": "KORSIKA - Boho Kette", "sales": 23, "revenue": 1147.70},
            {"name": "SICILIA Kleid", "sales": 15, "revenue": 2235.00},
            {"name": "TIBET Armband", "sales": 18, "revenue": 592.20}
        ],
        "sales_by_category": [
            {"category": "ketten", "percentage": 45},
            {"category": "armbaender", "percentage": 30},
            {"category": "kleider", "percentage": 20},
            {"category": "oberteile", "percentage": 5}
        ]
    }

@router.put("/products/{product_id}/featured")
async def toggle_product_featured(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Toggle product featured status"""
    query = select(Product).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_featured = not product.is_featured
    await db.commit()
    
    return {
        "message": "Product featured status updated",
        "product_id": product_id,
        "is_featured": product.is_featured
    }

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    query = select(Order).where(Order.id == order_id)
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status_data.get("status")
    await db.commit()
    
    return {
        "message": "Order status updated",
        "order_id": order_id,
        "new_status": order.status
    }
