#!/usr/bin/env python3
"""
Create admin user script
"""

import asyncio
import sys
import os
from sqlalchemy import select

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash


async def create_admin():
    """Create admin user"""
    async with AsyncSessionLocal() as session:
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
            print("✅ Created admin user: admin@casa-petrada.de (password: admin)")
        else:
            print("ℹ️ Admin user already exists")


if __name__ == "__main__":
    asyncio.run(create_admin())
