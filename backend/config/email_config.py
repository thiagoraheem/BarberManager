import os
from typing import Optional
from pydantic import EmailStr
from pydantic_settings import BaseSettings

class EmailSettings(BaseSettings):
    """
    Email configuration settings
    """
    # SMTP Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    
    # Email Settings
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = "BarberManager"
    
    # Template Settings
    EMAIL_TEMPLATES_DIR: str = "backend/templates/email"
    
    # Email Features
    EMAILS_ENABLED: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Enable emails only if SMTP credentials are provided
        if self.SMTP_USER and self.SMTP_PASSWORD and self.EMAILS_FROM_EMAIL:
            self.EMAILS_ENABLED = True

# Global email settings instance
email_settings = EmailSettings()