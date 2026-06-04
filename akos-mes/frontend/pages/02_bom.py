import streamlit as st
import httpx
import pandas as pd
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="BOM", layout="wide")
st.title("Bill of Materials")

project_id = st.number_input("Project ID", min_value=1, value=1, step=1)

if st.button("Load BOM"):
    try:
        resp = httpx.get(f"{BACKEND_URL}/api/v1/bom/{project_id}", timeout=5)
        if resp.status_code == 200:
            items = resp.json()
            if items:
                df = pd.DataFrame(items)
                st.dataframe(df, use_container_width=True)
            else:
                st.info("No BOM items for this project.")
        else:
            st.error(f"API error: {resp.status_code}")
    except Exception as e:
        st.error(f"Connection error: {e}")

st.subheader("Add BOM Item")
with st.form("add_bom"):
    part_no = st.text_input("Part No")
    part_name = st.text_input("Part Name")
    quantity = st.number_input("Quantity", min_value=0.0001, value=1.0)
    unit = st.selectbox("Unit", ["EA", "KG", "M", "L", "SET", "PCS"])
    revision = st.text_input("Revision", value="A")
    submitted = st.form_submit_button("Add Item")
    if submitted and part_no and part_name:
        payload = {
            "project_id": int(project_id),
            "part_no": part_no,
            "part_name": part_name,
            "quantity": quantity,
            "unit": unit,
            "revision": revision,
        }
        try:
            resp = httpx.post(f"{BACKEND_URL}/api/v1/bom/", json=payload, timeout=5)
            if resp.status_code == 201:
                st.success("BOM item added.")
            else:
                st.error(f"Error: {resp.text}")
        except Exception as e:
            st.error(str(e))
