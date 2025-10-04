from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class ProductCategoryEnum(str, enum.Enum):
    ARMBAENDER = "armbaender"  # Bracelets
    KETTEN = "ketten"  # Necklaces
    FUSSkettchen = "fussketchen"  # Anklets
    MODESCHMUCK = "modeschmuck"  # Fashion jewelry
    KLEIDER = "kleider"  # Dresses
    OBERTEILE = "oberteile"  # Tops
    ACCESSORIES = "accessories"
    TASCHEN = "taschen"  # Bags


class ProductSubCategoryEnum(str, enum.Enum):
    # Bracelet subcategories
    ALLE_ARMBAENDER = "alle_armbaender"
    EINFACH_ARMBAENDER = "einfach_armbaender"
    WICKEL_ARMBAENDER = "wickel_armbaender"
    
    # Necklace subcategories
    ALLE_KETTEN = "alle_ketten"
    KURZE_KETTEN = "kurze_ketten"
    WECHSEL_KETTEN = "wechsel_ketten"
    ANHAENGER = "anhaenger"
    
    # Fashion subcategories
    ALLE_FASHION = "alle_fashion"


class ProductCategory(Base):
    __tablename__ = "product_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    parent_id = Column(Integer, ForeignKey("product_categories.id"))
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Self-referential relationship for subcategories
    parent = relationship("ProductCategory", remote_side=[id], back_populates="children")
    children = relationship("ProductCategory", back_populates="parent")
    
    # Products relationship
    products = relationship("Product", back_populates="category")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    short_description = Column(Text)
    
    # Pricing
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float)  # Original price for sales
    cost_price = Column(Float)  # For admin use
    
    # Inventory
    sku = Column(String(100), unique=True)
    inventory_quantity = Column(Integer, default=0)
    track_inventory = Column(Boolean, default=True)
    allow_backorder = Column(Boolean, default=False)
    
    # Product details
    weight = Column(Float)  # in grams
    material = Column(String(255))  # e.g., "Halbedelsteine, Glasperlen"
    care_instructions = Column(Text)
    
    # SEO
    meta_title = Column(String(255))
    meta_description = Column(Text)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    is_new_arrival = Column(Boolean, default=False)
    is_sale = Column(Boolean, default=False)
    is_handmade = Column(Boolean, default=True)
    
    # Category relationship
    category_id = Column(Integer, ForeignKey("product_categories.id"))
    category = relationship("ProductCategory", back_populates="products")
    
    # Images relationship
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    
    # Reviews relationship
    reviews = relationship("Review", back_populates="product")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Product(name='{self.name}', price={self.price})>"


class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    alt_text = Column(String(255))
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    
    # Product relationship
    product = relationship("Product", back_populates="images")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<ProductImage(product_id={self.product_id}, url='{self.image_url}')>"
