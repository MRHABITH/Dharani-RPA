from typing import Optional
from pydantic import BaseModel, field_validator

class TaskRequest(BaseModel):
    name: str
    template_id: str = "automation"

    sender: str = ""
    password: str = ""

    receiver: str = ""
    subject: str = ""
    message: str = ""

    mode: str = "once"
    interval: int = 120
    scheduledDate: str = ""
    scheduledTime: str = ""

    # SMTP Settings (Added missing fields to prevent crash in main.py)
    smtpServer: str = "smtp.gmail.com"
    smtpPort: int = 587

    # IMAP Settings
    imapServer: str = "imap.gmail.com"
    imapPort: int = 993
    mailbox: str = "INBOX"
    extractionType: str = "all"
    filterQuery: str = ""

    @field_validator("interval", "imapPort", "smtpPort", mode="before")
    @classmethod
    def handle_empty_strings(cls, v, info):
        """Convert empty strings to defaults for integer fields."""
        if v == "" or v is None:
            defaults = {
                "interval": 120,
                "smtpPort": 587,
                "imapPort": 993
            }
            return defaults.get(info.field_name)
        return v