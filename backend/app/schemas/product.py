from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    image_url: str
    alt_text: Optional[str] = None
    sort_order: int
    is_primary: bool


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    sort_order: int


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None
    inventory_quantity: int
    material: Optional[str] = None
    care_instructions: Optional[str] = None
    is_featured: bool
    is_bestseller: bool
    is_new_arrival: bool
    is_sale: bool
    is_handmade: bool
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    created_at: datetime


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    skip: int
    limit: int


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    compare_at_price: Optional[float] = None
    inventory_quantity: int = 0
    material: Optional[str] = None
    care_instructions: Optional[str] = None
    category_id: Optional[int] = None
    is_featured: bool = False
    is_bestseller: bool = False
    is_new_arrival: bool = False
    is_sale: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    inventory_quantity: Optional[int] = None
    material: Optional[str] = None
    care_instructions: Optional[str] = None
    category_id: Optional[int] = None
    is_featured: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_sale: Optional[bool] = None
    is_active: Optional[bool] = None
