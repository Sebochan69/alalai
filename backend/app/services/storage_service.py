from pathlib import Path
from uuid import uuid4

import requests

from app.core.config import settings


def supabase_storage_is_configured() -> bool:
    return bool(
        settings.SUPABASE_URL
        and settings.SUPABASE_ANON_KEY
        and settings.SUPABASE_STORAGE_BUCKET
    )


def upload_complaint_photo(
    file_bytes: bytes,
    filename: str | None,
    content_type: str | None,
) -> str:
    if not supabase_storage_is_configured():
        raise RuntimeError("Supabase storage is not configured")

    extension = Path(filename or "").suffix.lower()
    if not extension:
        extension = ".jpg"

    object_path = f"complaints/{uuid4().hex}{extension}"
    base_url = settings.SUPABASE_URL.rstrip("/")
    bucket = settings.SUPABASE_STORAGE_BUCKET
    upload_url = f"{base_url}/storage/v1/object/{bucket}/{object_path}"

    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
        "Content-Type": content_type or "application/octet-stream",
        "x-upsert": "false",
    }

    response = requests.post(upload_url, headers=headers, data=file_bytes, timeout=30)
    response.raise_for_status()

    return f"{base_url}/storage/v1/object/public/{bucket}/{object_path}"
