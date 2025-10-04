#!/usr/bin/env python3
"""
Seed data script for Casa Petrada database
This script populates the database with initial products and categories
"""

import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import AsyncSessionLocal
from app.models.product import Product, ProductCategory, ProductImage
from app.models.user import User
from app.core.security import get_password_hash


async def create_categories(session: AsyncSession):
    """Create product categories"""
    categories_data = [
        {
            "name": "Armbänder",
            "slug": "armbaender",
            "description": "Handgefertigte Boho-Armbänder in verschiedenen Stilen",
            "sort_order": 1
        },
        {
            "name": "Ketten",
            "slug": "ketten", 
            "description": "Elegante Ketten und Halsketten im Boho-Style",
            "sort_order": 2
        },
        {
            "name": "Fußkettchen",
            "slug": "fussketchen",
            "description": "Zarte Fußkettchen für den perfekten Boho-Look",
            "sort_order": 3
        },
        {
            "name": "Modeschmuck",
            "slug": "modeschmuck",
            "description": "Trendiger Modeschmuck für jeden Anlass",
            "sort_order": 4
        },
        {
            "name": "Kleider",
            "slug": "kleider",
            "description": "Luftige Boho-Kleider für den Sommer",
            "sort_order": 5
        },
        {
            "name": "Oberteile",
            "slug": "oberteile",
            "description": "Stylische Oberteile im Boho-Design",
            "sort_order": 6
        },
        {
            "name": "Taschen",
            "slug": "taschen",
            "description": "Praktische und schöne Taschen",
            "sort_order": 7
        }
    ]

    for cat_data in categories_data:
        # Check if category already exists
        result = await session.execute(
            select(ProductCategory).where(ProductCategory.slug == cat_data["slug"])
        )
        existing_category = result.scalar_one_or_none()
        
        if not existing_category:
            category = ProductCategory(**cat_data)
            session.add(category)
            print(f"Created category: {cat_data['name']}")
        else:
            print(f"Category already exists: {cat_data['name']}")

    await session.commit()


async def create_products(session: AsyncSession):
    """Create sample products"""
    # Get categories
    result = await session.execute(select(ProductCategory))
    categories = {cat.slug: cat for cat in result.scalars()}

    products_data = [
        {
            "name": "Maxi Kleid schwarz SICILIA mit Volants und broderie anglaise",
            "slug": "maxi-kleid-schwarz-sicilia",
            "description": "Elegantes schwarzes Maxikleid mit romantischen Volants und broderie anglaise Details.",
            "short_description": "Romantisches schwarzes Maxikleid mit Volants",
            "price": 149.00,
            "compare_at_price": 179.00,
            "sku": "CP-SICILIA-001",
            "inventory_quantity": 5,
            "weight": 300.0,
            "material": "Baumwolle, Spitze",
            "care_instructions": "Handwäsche empfohlen, nicht bleichen, liegend trocknen",
            "is_featured": True,
            "is_bestseller": True,
            "is_new_arrival": False,
            "is_sale": True,
            "is_handmade": True,
            "category_slug": "kleider"
        },
        {
            "name": "KORSIKA - Boho Kette mit Buddha Anhänger",
            "slug": "korsika-boho-kette-buddha",
            "description": "Spirituelle Boho-Kette mit handgearbeitetem Buddha-Anhänger.",
            "short_description": "Spirituelle Kette mit Buddha-Anhänger",
            "price": 49.90,
            "sku": "CP-KORSIKA-001",
            "inventory_quantity": 10,
            "weight": 25.0,
            "material": "Halbedelsteine, Messing versilbert",
            "care_instructions": "Mit weichem Tuch reinigen, nicht mit Wasser in Berührung bringen",
            "is_featured": True,
            "is_bestseller": True,
            "is_new_arrival": False,
            "is_sale": False,
            "is_handmade": True,
            "category_slug": "ketten"
        },
        {
            "name": "Kimono GOBI mit Fransen und Print",
            "slug": "kimono-gobi-fransen-print",
            "description": "Luftiger Kimono im Boho-Style mit verspielten Fransen.",
            "short_description": "Luftiger Kimono mit Fransen",
            "price": 54.90,
            "sku": "CP-GOBI-001",
            "inventory_quantity": 8,
            "weight": 200.0,
            "material": "Viskose",
            "care_instructions": "Maschinenwäsche 30°C, nicht schleudern",
            "is_featured": False,
            "is_bestseller": True,
            "is_new_arrival": False,
            "is_sale": False,
            "is_handmade": False,
            "category_slug": "oberteile"
        },
        {
            "name": "Boho Kleid in weiß mit Stickerei in schwarz von Piti Cuiti",
            "slug": "boho-kleid-weiss-stickerei-piti-cuiti",
            "description": "Traumhaftes weißes Kleid mit kontrastierenden schwarzen Stickereien.",
            "short_description": "Weißes Kleid mit schwarzer Stickerei",
            "price": 105.00,
            "sku": "CP-PITI-001",
            "inventory_quantity": 3,
            "weight": 250.0,
            "material": "Baumwolle, handgestickte Details",
            "care_instructions": "Schonwäsche 30°C, nicht bleichen",
            "is_featured": True,
            "is_bestseller": False,
            "is_new_arrival": True,
            "is_sale": False,
            "is_handmade": True,
            "category_slug": "kleider"
        },
        {
            "name": "MARIA Lange Boho Kette mit einem großen Kreuzanhänger",
            "slug": "maria-lange-boho-kette-kreuz",
            "description": "Statement-Kette mit imposantem Kreuzanhänger für besondere Anlässe.",
            "short_description": "Lange Kette mit Kreuzanhänger",
            "price": 69.90,
            "sku": "CP-MARIA-001",
            "inventory_quantity": 7,
            "weight": 35.0,
            "material": "Messing, Halbedelsteine",
            "care_instructions": "Trocken lagern, mit weichem Tuch reinigen",
            "is_featured": False,
            "is_bestseller": False,
            "is_new_arrival": False,
            "is_sale": False,
            "is_handmade": True,
            "category_slug": "ketten"
        },
        {
            "name": "Boho Schmuck Anhänger FLÜGEL SILVERSHINY der Firma SchauTime",
            "slug": "boho-anhaenger-fluegel-silvershiny",
            "description": "Zarter Flügel-Anhänger in silbernem Finish.",
            "short_description": "Silberner Flügel-Anhänger",
            "price": 9.90,
            "sku": "CP-FLUEGEL-001",
            "inventory_quantity": 15,
            "weight": 5.0,
            "material": "Versilbert",
            "care_instructions": "Nicht mit Wasser in Berührung bringen",
            "is_featured": False,
            "is_bestseller": False,
            "is_new_arrival": False,
            "is_sale": False,
            "is_handmade": False,
            "category_slug": "modeschmuck"
        },
        {
            "name": "TIBET - Armband aus Dzi Beads",
            "slug": "tibet-armband-dzi-beads",
            "description": "Authentisches Armband mit traditionellen Dzi-Perlen aus Tibet.",
            "short_description": "Armband mit Dzi-Perlen",
            "price": 32.90,
            "sku": "CP-TIBET-001",
            "inventory_quantity": 12,
            "weight": 15.0,
            "material": "Dzi-Perlen, Naturstein",
            "care_instructions": "Schonend behandeln, nicht fallen lassen",
            "is_featured": False,
            "is_bestseller": False,
            "is_new_arrival": False,
            "is_sale": False,
            "is_handmade": True,
            "category_slug": "armbaender"
        },
        {
            "name": "LOURDES - kurze Kette mit Madonna Anhänger",
            "slug": "lourdes-kurze-kette-madonna",
            "description": "Spirituelle Kette mit Madonna-Anhänger, perfekt für den Alltag.",
            "short_description": "Kurze Kette mit Madonna-Anhänger",
            "price": 59.90,
            "sku": "CP-LOURDES-001",
            "inventory_quantity": 9,
            "weight": 20.0,
            "material": "Messing, Emaille",
            "care_instructions": "Mit weichem Tuch pflegen",
            "is_featured": False,
            "is_bestseller": False,
            "is_new_arrival": False,
            "is_sale": False,
            "is_handmade": True,
            "category_slug": "ketten"
        }
    ]

    for prod_data in products_data:
        # Check if product already exists
        result = await session.execute(
            select(Product).where(Product.slug == prod_data["slug"])
        )
        existing_product = result.scalar_one_or_none()
        
        if not existing_product:
            # Get category
            category = categories.get(prod_data.pop("category_slug"))
            if category:
                product = Product(
                    **prod_data,
                    category_id=category.id
                )
                session.add(product)
                print(f"Created product: {prod_data['name']}")
            else:
                print(f"Category not found for product: {prod_data['name']}")
        else:
            print(f"Product already exists: {prod_data['name']}")

    await session.commit()


async def create_admin_user(session: AsyncSession):
    """Create admin user"""
    # Check if admin user already exists
    result = await session.execute(
        select(User).where(User.email == "admin@casa-petrada.de")
    )
    existing_admin = result.scalar_one_or_none()
    
    if not existing_admin:
        admin_user = User(
            email="admin@casa-petrada.de",
            hashed_password=get_password_hash("admin"),
            first_name="Petra",
            last_name="Admin",
            is_active=True,
            is_admin=True,
            newsletter_subscribed=True
        )
        session.add(admin_user)
        await session.commit()
        print("Created admin user: admin@casa-petrada.de (password: admin)")
    else:
        print("Admin user already exists")


async def main():
    """Main function to seed the database"""
    print("🌱 Starting database seeding...")
    
    async with AsyncSessionLocal() as session:
        try:
            await create_categories(session)
            await create_products(session)
            await create_admin_user(session)
            print("✅ Database seeding completed successfully!")
        except Exception as e:
            print(f"❌ Error seeding database: {e}")
            await session.rollback()


if __name__ == "__main__":
    asyncio.run(main())
