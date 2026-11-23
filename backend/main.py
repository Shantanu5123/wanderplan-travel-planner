# Streamlit entry point forwarder
import os
import sys

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Execute streamlit_app.py
with open("streamlit_app.py", "r", encoding="utf-8") as f:
    code = f.read()
exec(code)
