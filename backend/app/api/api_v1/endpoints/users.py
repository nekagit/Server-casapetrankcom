from fastapi import APIRouter

router = APIRouter()

@router.get("/profile")
async def get_profile():
    return {"message": "User profile endpoint - to be implemented"}

@router.put("/profile")
async def update_profile():
    return {"message": "Update profile endpoint - to be implemented"}
