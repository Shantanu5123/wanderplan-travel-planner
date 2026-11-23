import os
import json
import streamlit as st
from datetime import date, timedelta
from groq import Groq
from dotenv import load_dotenv

# Load local environment variables if available
load_dotenv()
load_dotenv("backend/.env")

st.set_page_config(
    page_title="WanderPlan - AI Travel Itinerary Planner",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (Glassmorphism & Modern Dark Aesthetic)
st.markdown("""
<style>
    .main {
        background: radial-gradient(circle at 10% 20%, rgba(13, 27, 42, 0.95), rgba(4, 9, 20, 0.98));
        color: #f1f5f9;
    }
    .metric-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
    }
    .activity-card {
        background: rgba(255, 255, 255, 0.03);
        border-left: 4px solid #38bdf8;
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 12px;
    }
    .time-badge {
        display: inline-block;
        background: rgba(56, 189, 248, 0.2);
        color: #38bdf8;
        border-radius: 12px;
        padding: 2px 10px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 6px;
    }
    .cost-badge {
        display: inline-block;
        background: rgba(74, 222, 128, 0.2);
        color: #4ade80;
        border-radius: 12px;
        padding: 2px 10px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: 8px;
    }
</style>
""", unsafe_allow_html=True)

# API Key Resolution (Streamlit secrets -> os.environ -> UI input)
api_key = None
if "GROQ_API_KEY" in st.secrets:
    api_key = st.secrets["GROQ_API_KEY"]
elif os.getenv("GROQ_API_KEY"):
    api_key = os.getenv("GROQ_API_KEY")

# Sidebar Configuration
with st.sidebar:
    st.title("🌍 WanderPlan AI")
    st.caption("AI-Powered Personalized Itinerary Concierge")
    st.divider()

    if not api_key:
        api_key = st.text_input("Groq API Key", type="password", help="Enter your Groq Cloud API Key")
        if api_key:
            st.success("API Key detected!")
    else:
        st.success("✓ Groq API Key Configured")

    selected_model = st.selectbox(
        "Groq Model",
        ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
        index=0
    )

    currency = st.selectbox("Preferred Currency", ["USD ($)", "EUR (€)", "GBP (£)", "INR (₹)", "JPY (¥)"], index=0)
    
    st.divider()
    st.markdown("### About")
    st.info("Built with Streamlit, Groq LLaMA-3.3, and modern AI travel concierges. Ready for 1-click Streamlit Cloud deployment.")

# Main Interface Tabs
tab_plan, tab_chat = st.tabs(["🗺️ Plan Trip", "💬 WanderBot Concierge"])

# ----------------- TAB 1: TRIP PLANNER -----------------
with tab_plan:
    st.header("✈️ Create Your Perfect Journey")
    st.write("Provide your travel parameters and let LLaMA-3.3 create an optimized day-by-day plan.")

    col1, col2 = st.columns(2)
    with col1:
        destination = st.text_input("Destination", placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy")
        
        today = date.today()
        start_date = st.date_input("Start Date", today + timedelta(days=7))
        end_date = st.date_input("End Date", today + timedelta(days=12))

    with col2:
        budget = st.selectbox("Budget Tier", ["budget", "moderate", "luxury"], index=1)
        travel_style = st.selectbox(
            "Travel Pace & Style",
            ["relaxed", "balanced", "fast-paced", "adventure", "cultural immersion"],
            index=1
        )
        interests = st.multiselect(
            "Key Interests",
            ["Sightseeing", "Local Food & Dining", "Museums & History", "Nature & Parks", "Shopping", "Nightlife", "Photography", "Relaxation"],
            default=["Sightseeing", "Local Food & Dining", "Nature & Parks"]
        )

    submit_plan = st.button("✨ Generate AI Itinerary", type="primary", use_container_width=True)

    if submit_plan:
        if not api_key:
            st.error("Please provide a Groq API Key in the sidebar or via secrets.")
        elif not destination.strip():
            st.warning("Please enter a destination.")
        elif start_date > end_date:
            st.error("Start date must be before or equal to End date.")
        else:
            with st.spinner(f"WanderBot is designing your trip to {destination}..."):
                try:
                    client = Groq(api_key=api_key, timeout=35.0)

                    system_prompt = (
                        "You are an expert personalized travel planner and local concierge. "
                        "Generate a realistic, detailed day-by-day itinerary tailored to the traveler's preferences. "
                        "You MUST respond ONLY with valid JSON conforming to this schema:\n"
                        "{\n"
                        '  "destination": "string",\n'
                        '  "summary": "string (engaging 2-3 sentence overview)",\n'
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
                        '          "location": "string (neighborhood or landmark)",\n'
                        '          "cost_estimate": "string (e.g. Free, $15, $30)",\n'
                        '          "travel_tips": "string (practical advice, best timing)"\n'
                        "        }\n"
                        "      ]\n"
                        "    }\n"
                        "  ]\n"
                        "}\n"
                        "Do not include any markdown formatting, preamble, or notes outside the JSON."
                    )

                    user_content = (
                        f"Destination: {destination}\n"
                        f"Travel Dates: {start_date} to {end_date}\n"
                        f"Budget: {budget}\n"
                        f"Style: {travel_style}\n"
                        f"Interests: {', '.join(interests)}\n"
                        f"Currency: {currency}"
                    )

                    response = client.chat.completions.create(
                        model=selected_model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_content}
                        ],
                        temperature=0.7,
                        response_format={"type": "json_object"}
                    )

                    plan_data = json.loads(response.choices[0].message.content)
                    st.session_state["itinerary"] = plan_data
                    st.success(f"Trip to {plan_data.get('destination', destination)} successfully planned!")

                except Exception as e:
                    st.error(f"Failed to generate itinerary: {e}")

    # Display Itinerary if present in session
    if "itinerary" in st.session_state:
        plan = st.session_state["itinerary"]
        st.markdown("---")
        st.subheader(f"📍 {plan.get('destination', 'Your Trip')}")
        st.write(plan.get("summary", ""))

        cost_col, days_col, style_col = st.columns(3)
        with cost_col:
            st.metric("Estimated Cost", plan.get("estimated_total_cost", "N/A"))
        with days_col:
            st.metric("Total Days", len(plan.get("days", [])))
        with style_col:
            st.metric("Pace", travel_style.title())

        st.markdown("### 📅 Day-by-Day Schedule")
        for day in plan.get("days", []):
            with st.expander(f"Day {day.get('day_number')}: {day.get('theme', 'Exploration')} ({day.get('date', '')})", expanded=True):
                for act in day.get("activities", []):
                    st.markdown(f"""
                    <div class="activity-card">
                        <span class="time-badge">{act.get('time_slot', 'Day')}</span>
                        <span class="cost-badge">{act.get('cost_estimate', 'Free')}</span>
                        <h4 style="margin: 8px 0 4px 0;">{act.get('title')}</h4>
                        <p style="color: #cbd5e1; margin-bottom: 6px;">{act.get('description')}</p>
                        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;"><strong>📍 Location:</strong> {act.get('location')} | <strong>💡 Tip:</strong> {act.get('travel_tips')}</p>
                    </div>
                    """, unsafe_allow_html=True)

        # JSON Download Button
        json_str = json.dumps(plan, indent=2)
        st.download_button(
            label="📥 Download Itinerary JSON",
            data=json_str,
            file_name=f"{destination.replace(' ', '_')}_itinerary.json",
            mime="application/json"
        )

# ----------------- TAB 2: WANDERBOT CHATBOT -----------------
with tab_chat:
    st.header("💬 Chat with WanderBot")
    st.write("Need quick recommendations, packing tips, or local hidden gems? Chat with WanderBot in real time.")

    if "chat_messages" not in st.session_state:
        st.session_state["chat_messages"] = [
            {"role": "assistant", "content": "Hello traveler! I am WanderBot. Where are you dreaming of traveling next?"}
        ]

    for msg in st.session_state["chat_messages"]:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])

    user_query = st.chat_input("Ask WanderBot anything about your upcoming travels...")
    if user_query:
        if not api_key:
            st.error("Please set your Groq API Key in the sidebar.")
        else:
            st.session_state["chat_messages"].append({"role": "user", "content": user_query})
            with st.chat_message("user"):
                st.write(user_query)

            with st.chat_message("assistant"):
                with st.spinner("WanderBot is thinking..."):
                    try:
                        client = Groq(api_key=api_key, timeout=30.0)
                        history = [
                            {"role": "system", "content": "You are WanderBot, a helpful, enthusiastic, and knowledgeable travel concierge. Provide concise, friendly recommendations and tips."}
                        ]
                        for m in st.session_state["chat_messages"][-8:]:
                            history.append({"role": m["role"], "content": m["content"]})

                        resp = client.chat.completions.create(
                            model=selected_model,
                            messages=history,
                            temperature=0.7,
                            max_tokens=1000
                        )
                        reply = resp.choices[0].message.content
                        st.write(reply)
                        st.session_state["chat_messages"].append({"role": "assistant", "content": reply})
                    except Exception as err:
                        st.error(f"Chatbot error: {err}")
