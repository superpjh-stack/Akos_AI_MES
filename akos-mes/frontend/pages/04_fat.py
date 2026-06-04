import streamlit as st
import httpx
import pandas as pd
import plotly.express as px
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="FAT", layout="wide")
st.title("Factory Acceptance Testing")

project_id = st.number_input("Project ID", min_value=1, value=1, step=1)

col1, col2 = st.columns(2)

with col1:
    if st.button("Load FAT Records"):
        try:
            resp = httpx.get(f"{BACKEND_URL}/api/v1/fat/{project_id}", timeout=5)
            if resp.status_code == 200:
                records = resp.json()
                if records:
                    df = pd.DataFrame(records)
                    st.dataframe(df, use_container_width=True)
                else:
                    st.info("No FAT records.")
        except Exception as e:
            st.error(str(e))

with col2:
    if st.button("Show Summary"):
        try:
            resp = httpx.get(f"{BACKEND_URL}/api/v1/fat/{project_id}/summary", timeout=5)
            if resp.status_code == 200:
                summary = resp.json()
                if summary:
                    fig = px.pie(
                        names=list(summary.keys()),
                        values=list(summary.values()),
                        title="FAT Results",
                        color_discrete_map={"pass": "#2ecc71", "fail": "#e74c3c", "pending": "#f39c12", "waived": "#95a5a6"},
                    )
                    st.plotly_chart(fig, use_container_width=True)
        except Exception as e:
            st.error(str(e))

st.subheader("Add FAT Record")
with st.form("add_fat"):
    test_item = st.text_input("Test Item")
    result = st.selectbox("Result", ["pending", "pass", "fail", "waived"])
    measured = st.number_input("Measured Value", value=0.0)
    spec_min = st.number_input("Spec Min", value=0.0)
    spec_max = st.number_input("Spec Max", value=0.0)
    submitted = st.form_submit_button("Submit")
    if submitted and test_item:
        payload = {
            "project_id": int(project_id),
            "test_item": test_item,
            "result": result,
            "measured_value": measured,
            "spec_min": spec_min,
            "spec_max": spec_max,
        }
        try:
            resp = httpx.post(f"{BACKEND_URL}/api/v1/fat/", json=payload, timeout=5)
            st.success("Record saved.") if resp.status_code == 201 else st.error(resp.text)
        except Exception as e:
            st.error(str(e))
