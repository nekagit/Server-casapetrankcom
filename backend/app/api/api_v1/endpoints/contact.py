from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter()

class ContactForm(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    subject: str
    message: str

@router.post("/")
async def submit_contact_form(contact_form: ContactForm):
    """Submit contact form"""
    # In a real implementation, this would:
    # 1. Save to database
    # 2. Send email notification to admin
    # 3. Send confirmation email to customer
    
    return {
        "message": "Ihre Nachricht wurde erfolgreich gesendet!",
        "contact_id": f"contact_{int(datetime.now().timestamp())}",
        "submitted_at": datetime.now()
    }

@router.get("/")
async def get_contact_messages(skip: int = 0, limit: int = 50):
    """Get contact messages (admin only)"""
    # This would require admin authentication in a real app
    return {
        "messages": [],
        "total": 0,
        "skip": skip,
        "limit": limit
    }
