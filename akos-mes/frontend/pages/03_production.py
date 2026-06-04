import streamlit as st
import httpx
import pandas as pd
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="Production", layout="wide")
st.title("Production Orders")

project_id = st.number_input("Project ID", min_value=1, value=1, step=1)

if st.button("Load Orders"):
    try:
        resp = httpx.get(f"{BACKEND_URL}/api/v1/production/{project_id}", timeout=5)
        if resp.status_code == 200:
            orders = resp.json()
            if orders:
                df = pd.DataFrame(orders)
                st.dataframe(df, use_container_width=True)
            else:
                st.info("No production orders for this project.")
        else:
            st.error(f"API error: {resp.status_code}")
    except Exception as e:
        st.error(f"Connection error: {e}")
