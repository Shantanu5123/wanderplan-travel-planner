from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from app.schemas.itinerary import ItineraryData


class TripCreateRequest(BaseModel):
    destination: str = Field(..., min_length=2, example="Kyoto, Japan")
    start_date: date = Field(..., example="2026-12-01")
    end_date: date = Field(..., example="2026-12-05")
    budget: str = Field(..., example="moderate", description="budget, moderate, or luxury")
    interests: List[str] = Field(..., example=["temples", "food", "nature", "photography"])
    travel_style: str = Field(..., example="relaxed", description="relaxed, fast-paced, balanced, adventure")


class TripResponse(BaseModel):
    id: Optional[str] = None
    destination: str
    start_date: date
    end_date: date
    budget: str
    interests: List[str]
    travel_style: str
    itinerary_data: ItineraryData
    is_public: bool = False
    share_token: Optional[str] = None
