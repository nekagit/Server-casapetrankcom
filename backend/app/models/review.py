from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(255))
    comment = Column(Text)
    
    # Reviewer information (for non-registered users)
    reviewer_name = Column(String(100))
    reviewer_email = Column(String(255))
    
    # Status
    is_approved = Column(Boolean, default=False)
    is_verified_purchase = Column(Boolean, default=False)
    
    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Review(product_id={self.product_id}, rating={self.rating})>"
