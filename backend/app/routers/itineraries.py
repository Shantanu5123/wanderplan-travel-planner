from fastapi import APIRouter, HTTPException
from app.schemas.trip import TripCreateRequest
from app.schemas.itinerary import ItineraryData, DayPlan
from app.services.groq_service import groq_service
from app.config import settings
from pydantic import BaseModel
from typing import Dict, Any, Optional

router = APIRouter(prefix="/api/v1/itineraries", tags=["Itineraries"])


class RegenerateDayRequest(BaseModel):
    day_number: int
    current_day: Dict[str, Any]
    feedback: str
    trip_context: Dict[str, Any]


@router.post("/generate", response_model=Dict[str, Any])
def generate_itinerary_endpoint(trip_request: TripCreateRequest):
    """
    Generate a personalized travel itinerary using Groq AI.
    """
    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured in backend/.env"
        )

    try:
        itinerary = groq_service.generate_itinerary(trip_request)
        return {
            "status": "success",
            "message": f"Generated personalized itinerary for {trip_request.destination}!",
            "data": {
                "destination": trip_request.destination,
                "start_date": str(trip_request.start_date),
                "end_date": str(trip_request.end_date),
                "budget": trip_request.budget,
                "travel_style": trip_request.travel_style,
                "interests": trip_request.interests,
                "itinerary": itinerary.dict()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Groq itinerary generation failed: {str(e)}"
        )


@router.post("/regenerate-day", response_model=Dict[str, Any])
def regenerate_day_endpoint(req: RegenerateDayRequest):
    """
    Regenerate a single day of an itinerary based on user tweak notes.
    """
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    try:
        new_day = groq_service.regenerate_day(
            day_number=req.day_number,
            current_day=req.current_day,
            feedback=req.feedback,
            trip_context=req.trip_context
        )
        return {
            "status": "success",
            "day": new_day.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(e)}")
