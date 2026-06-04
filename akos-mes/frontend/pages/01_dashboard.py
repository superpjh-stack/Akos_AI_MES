import streamlit as st
import httpx
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="Dashboard", layout="wide")
st.title("Dashboard")

try:
    resp = httpx.get(f"{BACKEND_URL}/api/v1/projects/", timeout=5)
    projects = resp.json() if resp.status_code == 200 else []
except Exception:
    projects = []

col1, col2, col3, col4 = st.columns(4)
active = [p for p in projects if p.get("status") == "active"]
completed = [p for p in projects if p.get("status") == "completed"]

col1.metric("Total Projects", len(projects))
col2.metric("Active", len(active))
col3.metric("Completed", len(completed))
col4.metric("On Hold", len([p for p in projects if p.get("status") == "on_hold"]))

st.subheader("Projects")
if projects:
    import pandas as pd
    df = pd.DataFrame(projects)
    st.dataframe(df[["id", "name", "customer", "status", "start_date", "end_date", "budget"]], use_container_width=True)
else:
    st.info("No projects found. Create one via the API or add data to the database.")
