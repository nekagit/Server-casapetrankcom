from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from app.core.database import get_db
from app.models.product import Product, ProductCategory
from app.schemas.product import ProductResponse, ProductListResponse, CategoryResponse

router = APIRouter()


@router.get("/", response_model=ProductListResponse)
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    bestseller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get products with filtering and pagination"""
    query = select(Product).where(Product.is_active == True)
    
    # Apply filters
    if category:
        category_query = select(ProductCategory).where(ProductCategory.slug == category)
        category_result = await db.execute(category_query)
        category_obj = category_result.scalar_one_or_none()
        if category_obj:
            query = query.where(Product.category_id == category_obj.id)
    
    if featured is not None:
        query = query.where(Product.is_featured == featured)
    
    if bestseller is not None:
        query = query.where(Product.is_bestseller == bestseller)
        
    if new_arrival is not None:
        query = query.where(Product.is_new_arrival == new_arrival)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            Product.name.ilike(search_term) | 
            Product.description.ilike(search_term)
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    # Apply pagination and get results
    query = query.offset(skip).limit(limit).order_by(Product.created_at.desc())
    result = await db.execute(query)
    products = result.scalars().all()
    
    return ProductListResponse(
        products=products,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all product categories"""
    query = select(ProductCategory).where(ProductCategory.is_active == True).order_by(ProductCategory.sort_order)
    result = await db.execute(query)
    categories = result.scalars().all()
    return categories


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Get a specific product by ID"""
    query = select(Product).where(Product.id == product_id, Product.is_active == True)
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product


@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a specific product by slug"""
    query = select(Product).where(Product.slug == slug, Product.is_active == True)
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product
