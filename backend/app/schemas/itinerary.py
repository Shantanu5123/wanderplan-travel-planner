from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class Activity(BaseModel):
    time_slot: str = Field(..., description="e.g. Morning, Afternoon, Evening")
    title: str = Field(..., description="Short activity name")
    description: str = Field(..., description="Detailed description of the activity")
    location: str = Field(..., description="Place, attraction, or neighbourhood")
    cost_estimate: Optional[str] = Field(None, description="e.g. Free, $15, $30-50")
    travel_tips: Optional[str] = Field(None, description="Helpful tips, e.g. booking in advance")


class DayPlan(BaseModel):
    day_number: int
    date: Optional[str] = None
    theme: str = Field(..., description="Theme for the day, e.g. Historic Sights, Local Food Crawl")
    activities: List[Activity] = Field(default_factory=list)


class ItineraryData(BaseModel):
    summary: str
    destination: str
    estimated_total_cost: Optional[str] = None
    days: List[DayPlan] = Field(default_factory=list)
