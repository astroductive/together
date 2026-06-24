from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    full_name: Optional[str] = None
    email: str
    password: str
    role: str = "Speaker"


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    """Editable profile fields. All optional — only provided fields are changed.

    To change the password, supply both ``current_password`` and ``new_password``.
    """
    full_name: Optional[str] = None
    role: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    full_name: Optional[str]
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenRefresh(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
