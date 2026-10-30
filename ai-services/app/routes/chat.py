import re
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.safety import check_red_flag, get_first_aid
from app.services.llm import response


router = APIRouter(prefix="/user", tags=["chat"])

class ChatRequest(BaseModel):
    message: str

def is_hindi_text(text: str) -> bool:
    return bool(re.search(r"[\u0900-\u097F]", text))

@router.post("/chat")
def triage_chat(req: ChatRequest):
    flag = check_red_flag(req.message)
    hindi = is_hindi_text(req.message) or any(w in req.message.lower() for w in ["dard", "bukhar", "saans", "khoon", "saanp", "hai"])

    if flag:
        return {
            "mode": "sos",
            "category": flag,
            "result": get_first_aid(flag, is_hindi=hindi),
            "sources": ["Emergency Medicine Clinical Protocol", "National Health Mission 108 SOP"]
        }

    # non-emergency symptom inquiry processed by rag
    result, sources = response(req.message)
    return {
        "mode": "normal",
        "result": result,
        "sources": sources
    }
