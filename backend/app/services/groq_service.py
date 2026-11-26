import json
import logging
from typing import Dict, Any, Optional
from groq import Groq
from app.config import settings
from app.schemas.itinerary import ItineraryData, DayPlan, Activity
from app.schemas.trip import TripCreateRequest

logger = logging.getLogger(__name__)


class GroqItineraryService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self._client = None

    @property
    def client(self) -> Groq:
        if not self._client:
            # Explicit 30s timeout configured to prevent thread starvation (Point 18: Timeouts)
            self._client = Groq(api_key=self.api_key, timeout=30.0, max_retries=2)
        return self._client

    def generate_itinerary(self, req: TripCreateRequest) -> ItineraryData:
        """
        Invokes Groq LLaMA 3.3 in JSON mode to generate a day-by-day travel plan.
        """
        system_prompt = (
            "You are an expert personalized travel planner and local concierge. "
            "Generate a realistic, detailed day-by-day itinerary tailored to the traveler's preferences. "
            "You MUST respond ONLY with valid JSON conforming to this schema:\n"
            "{\n"
            '  "destination": "string",\n'
            '  "summary": "string (engaging 2-3 sentence overview of this trip)",\n'
            '  "estimated_total_cost": "string (e.g. $800 - $1200)",\n'
            '  "days": [\n'
            "    {\n"
            '      "day_number": 1,\n'
            '      "date": "YYYY-MM-DD",\n'
            '      "theme": "string (theme or focus for the day)",\n'
            '      "activities": [\n'
            "        {\n"
            '          "time_slot": "Morning | Afternoon | Evening",\n'
            '          "title": "string",\n'
            '          "description": "string (informative, practical overview)",\n'
            '          "location": "string (specific area, neighborhood or landmark)",\n'
            '          "cost_estimate": "string (e.g. Free, $15, $30)",\n'
            '          "travel_tips": "string (practical advice, best timing, transit tip)",\n'
            '          "latitude": 35.6762,\n'
            '          "longitude": 139.6503\n'
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ],\n"
            '  "packing_list": {\n'
            '    "clothing": ["string", "string"],\n'
            '    "essentials": ["string", "string"],\n'
            '    "tech": ["string", "string"],\n'
            '    "documents": ["string", "string"]\n'
            "  }\n"
            "}\n"
            "Crucial: Provide realistic, accurate floating-point latitude and longitude coordinates for each attraction/stop so they map precisely. Tailor the packing list directly to destination weather, local customs, and travel style.\n"
            "Do not include any markdown formatting, preamble, or notes outside the JSON."
        )

        user_content = (
            f"Plan a trip with the following parameters:\n"
            f"- Destination: {req.destination}\n"
            f"- Travel Dates: {req.start_date} to {req.end_date}\n"
            f"- Budget Tier: {req.budget}\n"
            f"- Travel Pace & Style: {req.travel_style}\n"
            f"- Traveler Interests: {', '.join(req.interests)}\n"
            f"Ensure each day has 2-4 well-sequenced activities matching the travel pace."
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        raw_json_str = response.choices[0].message.content
        parsed = json.loads(raw_json_str)

        # Ensure destination is present
        if "destination" not in parsed or not parsed["destination"]:
            parsed["destination"] = req.destination

        # Validate through Pydantic
        return ItineraryData(**parsed)

    def regenerate_day(self, day_number: int, current_day: Dict[str, Any], feedback: str, trip_context: Dict[str, Any]) -> DayPlan:
        """
        Regenerate a single day's plan with custom user adjustment feedback.
        """
        system_prompt = (
            "You are an expert travel itinerary editor. "
            "Modify and regenerate a single day's plan based on the traveler's feedback. "
            "You MUST respond ONLY with valid JSON conforming to this schema:\n"
            "{\n"
            f'  "day_number": {day_number},\n'
            '  "theme": "string",\n'
            '  "activities": [\n'
            "    {\n"
            '      "time_slot": "Morning | Afternoon | Evening",\n'
            '      "title": "string",\n'
            '      "description": "string",\n'
            '      "location": "string",\n'
            '      "cost_estimate": "string",\n'
            '      "travel_tips": "string",\n'
            '      "latitude": 35.6762,\n'
            '      "longitude": 139.6503\n'
            "    }\n"
            "  ]\n"
            "}\n"
            "Crucial: Provide realistic, accurate floating-point latitude and longitude coordinates for each attraction/stop so they map precisely."
        )

        user_content = (
            f"Destination: {trip_context.get('destination', 'Destination')}\n"
            f"Budget: {trip_context.get('budget', 'moderate')}\n"
            f"Travel Style: {trip_context.get('travel_style', 'balanced')}\n"
            f"Current Day {day_number} Plan: {json.dumps(current_day)}\n"
            f"User adjustment request: {feedback}\n"
            f"Please regenerate Day {day_number} incorporating these adjustments."
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.7,
            response_format={"type": "json_object"},
        )

        parsed = json.loads(response.choices[0].message.content)
        parsed["day_number"] = day_number
        return DayPlan(**parsed)

    def swap_activity(self, destination: str, current_activity: Dict[str, Any], day_theme: str = "", budget: str = "moderate", interests: Optional[List[str]] = None) -> Activity:
        """
        Generates a single fresh alternative activity replacement stop matching the destination and time slot.
        """
        interests_str = ", ".join(interests) if interests else "Sightseeing, Local culture, Food"
        time_slot = current_activity.get("time_slot", "Afternoon")
        current_title = current_activity.get("title", "Current Attraction")

        system_prompt = (
            "You are an expert travel concierge. "
            "Suggest ONE fresh, distinct alternative activity stop to replace an existing stop. "
            "You MUST respond ONLY with valid JSON conforming to this schema:\n"
            "{\n"
            f'  "time_slot": "{time_slot}",\n'
            '  "title": "string (name of the fresh alternative attraction/stop)",\n'
            '  "description": "string (practical, engaging overview)",\n'
            '  "location": "string (neighborhood or landmark name)",\n'
            '  "cost_estimate": "string (e.g. Free, $15, $30)",\n'
            '  "travel_tips": "string (pro tip for visiting)",\n'
            '  "latitude": 35.6762,\n'
            '  "longitude": 139.6503\n'
            "}\n"
            "Crucial: Provide realistic, accurate floating-point latitude and longitude coordinates for this specific place. "
            "Ensure the replacement is exciting, realistically located in the destination, and different from the current stop.\n"
            "Do not include any markdown formatting, preamble, or notes outside the JSON."
        )

        user_content = (
            f"Destination: {destination}\n"
            f"Day Theme: {day_theme}\n"
            f"Time Slot: {time_slot}\n"
            f"Current Activity to Replace: {current_title} - {current_activity.get('location', '')}\n"
            f"Budget Tier: {budget}\n"
            f"Traveler Interests: {interests_str}\n"
            f"Please generate a unique, high-quality replacement stop."
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.8,
            response_format={"type": "json_object"},
        )

        parsed = json.loads(response.choices[0].message.content)
        parsed["time_slot"] = time_slot
        return Activity(**parsed)



groq_service = GroqItineraryService()
