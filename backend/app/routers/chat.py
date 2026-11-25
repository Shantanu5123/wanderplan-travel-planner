from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.knowledge_service import knowledge_base
import json
import re
import logging
from groq import Groq

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["Travel Concierge Chatbot"])


class Message(BaseModel):
    role: str = Field(..., description="user or assistant or system")
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    current_trip_data: Optional[Dict[str, Any]] = None


SYSTEM_PROMPT = """
You are "WanderBot", an elite conversational AI travel concierge.

Your flow:
1. Ask for location/destination and surrounding areas of interest.
2. Inquire about travel duration/dates, budget tier, pace, and interests (nature, food, culture, adventure).
3. Offer quick, high-value surrounding area suggestions (e.g., nearby hills, lakes, sanctuaries within 1-2 hours).
4. When you have enough details to generate the plan:
   - Provide a clean, elegant, formatted summary (in 2-3 short paragraphs).
   - List the **Top 3 Highlights** and surrounding day-trip gems using clean bullet points.
   - DO NOT print raw markdown code blocks like "```itinerary_json { ... }" or raw JSON in your text conversation!
   - ALWAYS output the complete day-by-day itinerary enclosed strictly inside ```itinerary_json ... ``` at the very end of your response.

JSON Schema format inside ```itinerary_json:
```itinerary_json
{
  "destination": "Pune & Western Ghats (Lonavala, Rajmachi, Bhimashankar)",
  "start_date": "2026-11-24",
  "end_date": "2026-11-26",
  "budget": "budget",
  "travel_style": "relaxed",
  "interests": ["nature", "local cuisine", "light trekking"],
  "itinerary": {
    "destination": "Pune, Maharashtra, India",
    "summary": "Three relaxed days exploring misty hills, hidden waterfalls, and sacred forest sanctuaries with authentic local bites.",
    "estimated_total_cost": "₹9,200 (~$110 USD)",
    "days": [
      {
        "day_number": 1,
        "date": "2026-11-24",
        "theme": "Lonavala – Waterfalls & Viewpoints",
        "activities": [
          {
            "time_slot": "Morning",
            "title": "Drive to Lonavala & Tiger's Leap",
            "description": "Scenic morning drive up the Ghats to cliffside viewpoints.",
            "location": "Tiger's Leap, Lonavala",
            "cost_estimate": "Free",
            "travel_tips": "Early morning ensures quiet views without mist obstruction."
          }
        ]
      }
    ]
  }
}
```

CRITICAL RULE:
Never output raw JSON or code snippets in the chat text. Keep your chat response concise, warm, and readable. The application automatically detects the ```itinerary_json block and turns it into an interactive visual card!
"""


def extract_itinerary_json(text: str):
    """
    Extracts and parses JSON from ```itinerary_json ... ``` or standard ```json ... ``` or raw JSON objects.
    Returns (cleaned_text, parsed_json_dict)
    """
    parsed = None
    cleaned = text

    # 1. Match ```itinerary_json ... ```
    match = re.search(r"```itinerary_json\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        raw_json = match.group(1).strip()
        try:
            parsed = json.loads(raw_json)
            cleaned = text[:match.start()] + text[match.end():]
        except Exception as e:
            logger.warning(f"Error parsing itinerary_json: {e}")

    # 2. Match standard ```json ... ``` if it looks like an itinerary
    if not parsed:
        match_json = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
        if match_json:
            raw_candidate = match_json.group(1).strip()
            if '"days"' in raw_candidate or '"itinerary"' in raw_candidate or '"destination"' in raw_candidate:
                try:
                    parsed = json.loads(raw_candidate)
                    cleaned = text[:match_json.start()] + text[match_json.end():]
                except Exception:
                    pass

    # 3. Match unclosed or raw JSON block if model forgot trailing backticks
    if not parsed and "```itinerary_json" in text:
        parts = text.split("```itinerary_json")
        cleaned = parts[0]
        candidate = parts[1].replace("```", "").strip()
        try:
            parsed = json.loads(candidate)
        except Exception:
            pass

    # 4. Clean up any leftover code block markers or "Below is the complete day-by-day plan..." phrases
    cleaned = re.sub(r'```itinerary_json.*', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'```json.*', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'Below is the complete day[‑\-]by[‑\-]day plan.*', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'###\s*📋\s*Final Itinerary.*', '', cleaned, flags=re.DOTALL)

    return cleaned.strip(), parsed


@router.post("/message")
def chat_message(req: ChatRequest):
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    try:
        # Retrieve relevant contextual facts from FAQ knowledge base based on user's latest query
        latest_user_text = ""
        for m in reversed(req.messages):
            if m.role == "user":
                latest_user_text = m.content
                break

        kb_matches = knowledge_base.find_relevant(latest_user_text, limit=4)
        kb_context = ""
        if kb_matches:
            kb_context = "\n[VERIFIED KNOWLEDGE BASE INSIGHTS]:\n" + "\n".join(
                f"- Q: {item['question']}\n  A: {item['answer']}" for item in kb_matches
            ) + "\nIncorporate these verified facts accurately if relevant to the user query.\n"

        # Explicit 30s timeout on external LLM calls (Point 18: Timeouts)
        client = Groq(api_key=settings.GROQ_API_KEY, timeout=30.0, max_retries=2)

        conversation = [{"role": "system", "content": SYSTEM_PROMPT + ("\n" + kb_context if kb_context else "")}]
        for m in req.messages:
            conversation.append({"role": m.role, "content": m.content})

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=conversation,
            temperature=0.7,
            max_tokens=3500,
        )

        raw_reply = response.choices[0].message.content

        cleaned_text, parsed_itinerary = extract_itinerary_json(raw_reply)

        return {
            "status": "success",
            "message": {
                "role": "assistant",
                "content": cleaned_text,
            },
            "generated_itinerary": parsed_itinerary,
        }

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
