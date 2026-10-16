import os
import base64
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.vision import explain_prescription

router = APIRouter(prefix="/vision", tags=["vision"])

# local folder to store uploaded prescription images [apne disk pr]
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class ExplainRequest(BaseModel):
    image_base64: Optional[str] = None
    mime_type: Optional[str] = "image/jpeg"
    file_name: Optional[str] = ""

# analyzes prescription from base64 json payload
@router.post("/explain")
def explain_image_json(req: ExplainRequest):
    result = explain_prescription(
        image_base64=req.image_base64,
        mime_type=req.mime_type,
        file_name=req.file_name or ""
    )
    return {"status": "success", "data": result}

# takes uploaded file, saves it, and sends it to explain route automatically
@router.post("/upload")
async def upload_prescription_file(file: UploadFile = File(...)):
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Only image files (.jpg, .jpeg, .png, .webp) are supported")

    # read uploaded file bytes
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # save copy to uploads folder with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_name = f"{timestamp}_{file.filename}"
    saved_path = UPLOAD_DIR / clean_name
    with open(saved_path, "wb") as f:
        f.write(contents)

    # convert bytes to base64 string
    b64_data = base64.b64encode(contents).decode("utf-8")

    # forward directly to explain endpoint handler
    explain_payload = ExplainRequest(
        image_base64=b64_data,
        mime_type=file.content_type or "image/jpeg",
        file_name=file.filename
    )
    explanation = explain_image_json(explain_payload)

    return {
        "status": "success",
        "message": "File uploaded and analyzed successfully",
        "file": {
            "original_name": file.filename,
            "saved_as": clean_name,
            "saved_path": str(saved_path),
            "size_bytes": len(contents),
            "mime_type": file.content_type
        },
        "data": explanation["data"]
    }
