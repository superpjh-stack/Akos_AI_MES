import streamlit as st
import httpx
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="AI Agent", layout="wide")
st.title("AI Agent")

tab1, tab2 = st.tabs(["Defect Risk Prediction", "MES Chat Assistant"])

with tab1:
    st.subheader("Defect Risk Prediction")
    project_id = st.number_input("Project ID", min_value=1, value=1, step=1, key="pred_pid")
    if st.button("Predict Defect Risk"):
        try:
            resp = httpx.get(f"{BACKEND_URL}/api/v1/ai/predict/defect/{project_id}", timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                risk = data.get("risk_score")
                level = data.get("risk_level", "unknown")
                color = {"high": "red", "medium": "orange", "low": "green"}.get(level, "gray")
                st.markdown(f"**Risk Score:** `{risk}`")
                st.markdown(f"**Risk Level:** :{color}[{level.upper()}]")
                st.json(data)
            else:
                st.error(resp.text)
        except Exception as e:
            st.error(str(e))

with tab2:
    st.subheader("MES Chat Assistant")
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])

    question = st.chat_input("Ask the MES AI assistant...")
    if question:
        st.session_state.messages.append({"role": "user", "content": question})
        with st.chat_message("user"):
            st.write(question)
        try:
            resp = httpx.post(f"{BACKEND_URL}/api/v1/ai/chat", json={"question": question}, timeout=30)
            answer = resp.json().get("answer", "No response") if resp.status_code == 200 else resp.text
        except Exception as e:
            answer = str(e)
        st.session_state.messages.append({"role": "assistant", "content": answer})
        with st.chat_message("assistant"):
            st.write(answer)
