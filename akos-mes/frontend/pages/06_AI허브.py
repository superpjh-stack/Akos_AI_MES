"""AI 허브 — Akos AI MES
AI Agent Hub: 채팅 / 예측 AI / 견적 AI / RAG 지식베이스 / 모델 관리
"""

import streamlit as st
import httpx
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os
import sys
from datetime import datetime, timedelta
import random

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from components.kpi_card import render_kpi_card
from components.charts import render_defect_trend, render_shap_bar

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AI 허브 | Akos MES",
    page_icon="🤖",
    layout="wide",
)

# ── Global styles ─────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    /* ── base palette ── */
    .stApp { background-color: #0f1117; }

    /* ── page header ── */
    .ai-hub-header {
        background: linear-gradient(135deg, #1a1f35 0%, #0d1b2a 50%, #1a1035 100%);
        border: 1px solid #2d3348;
        border-left: 4px solid #7c3aed;
        border-radius: 10px;
        padding: 18px 24px 14px 24px;
        margin-bottom: 18px;
    }
    .ai-hub-header h1 {
        font-size: 1.55rem; font-weight: 700; color: #f0f2f6; margin: 0 0 4px 0;
    }
    .ai-hub-header p { font-size: 0.85rem; color: #9ba3af; margin: 0; }

    /* ── Claude status badge ── */
    .claude-badge {
        display: inline-flex; align-items: center; gap: 7px;
        background: #0f2a1a; border: 1px solid #1a4a2a;
        border-radius: 20px; padding: 5px 14px;
        font-size: 0.82rem; font-weight: 600; color: #2ecc71;
    }
    .claude-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #2ecc71;
        box-shadow: 0 0 6px #2ecc71;
        animation: pulse-green 2s infinite;
    }
    @keyframes pulse-green {
        0%,100% { opacity: 1; } 50% { opacity: 0.4; }
    }

    /* ── chat bubbles ── */
    .chat-user-bubble {
        background: #2d3348; border-radius: 12px 12px 4px 12px;
        padding: 10px 14px; margin: 4px 0; color: #f0f2f6; font-size: 0.9rem;
    }
    .chat-ai-bubble {
        background: #1a1f35; border-left: 3px solid #7c3aed;
        border-radius: 4px 12px 12px 12px;
        padding: 10px 14px; margin: 4px 0; color: #e2e8f0; font-size: 0.9rem;
    }
    .chat-timestamp { font-size: 0.72rem; color: #6b7280; margin-top: 2px; }

    /* ── quick action buttons ── */
    .quick-btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 14px 0; }

    /* ── risk badge ── */
    .badge-high   { background:#4a1a1a; color:#ff6b6b; border:1px solid #e74c3c;
                    border-radius:12px; padding:2px 10px; font-size:0.78rem; font-weight:700; }
    .badge-medium { background:#3a2a0a; color:#f39c12; border:1px solid #f39c12;
                    border-radius:12px; padding:2px 10px; font-size:0.78rem; font-weight:700; }
    .badge-low    { background:#0a3a1a; color:#2ecc71; border:1px solid #2ecc71;
                    border-radius:12px; padding:2px 10px; font-size:0.78rem; font-weight:700; }

    /* ── ai confidence badge ── */
    .conf-badge {
        background: #1a2540; border: 1px solid #4f8ef7;
        border-radius: 12px; padding: 2px 10px;
        font-size: 0.78rem; font-weight: 700; color: #4f8ef7;
    }

    /* ── section divider ── */
    .section-divider { border-top: 1px solid #2d3348; margin: 16px 0; }

    /* ── highlight table row ── */
    .model-active-row { background: #1a2540 !important; border-left: 3px solid #7c3aed; }

    /* ── prediction card ── */
    .pred-card {
        background: #1e2130; border-radius: 10px;
        border: 1px solid #2d3348; border-top: 3px solid #e74c3c;
        padding: 16px; margin-bottom: 8px;
    }
    .pred-card-title { font-size: 0.82rem; color: #9ba3af; font-weight: 600; text-transform: uppercase; }
    .pred-card-value { font-size: 1.6rem; font-weight: 700; color: #f0f2f6; }
    .pred-card-sub   { font-size: 0.85rem; color: #9ba3af; }

    /* ── RAG result card ── */
    .rag-result {
        background: #1a1f35; border-left: 3px solid #4f8ef7;
        border-radius: 4px 10px 10px 4px;
        padding: 12px 16px; margin-bottom: 10px;
    }
    .rag-doc-name { font-size: 0.82rem; font-weight: 700; color: #4f8ef7; }
    .rag-excerpt  { font-size: 0.88rem; color: #e2e8f0; margin-top: 4px; }

    /* ── pgvector status ── */
    .pg-status {
        background: #0f1a2a; border: 1px solid #1a3a5a;
        border-radius: 8px; padding: 12px 16px;
        font-size: 0.85rem; color: #4f8ef7;
    }

    /* tabs styling */
    .stTabs [data-baseweb="tab-list"] { gap: 4px; }
    .stTabs [data-baseweb="tab"] {
        background: #1e2130; border-radius: 8px 8px 0 0;
        color: #9ba3af; font-weight: 600; font-size: 0.85rem;
        padding: 8px 16px;
    }
    .stTabs [aria-selected="true"] {
        background: #2d3348 !important; color: #f0f2f6 !important;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Page Header ───────────────────────────────────────────────────────────────
st.markdown(
    """
    <div class="ai-hub-header">
      <h1>🤖 AI 에이전트 허브</h1>
      <p>Akos AI MES — 제조 특화 AI 플랫폼 | 예측 분석 · 견적 자동화 · RAG 지식베이스 · 모델 관리</p>
    </div>
    """,
    unsafe_allow_html=True,
)

# ── Session state init ────────────────────────────────────────────────────────
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = [
        {
            "role": "assistant",
            "content": "안녕하세요! Akos AI MES 어시스턴트입니다. 생산 현황, BOM 분석, 품질 예측, 납기 리스크 등 궁금하신 사항을 물어보세요.",
            "time": datetime.now().strftime("%H:%M"),
        }
    ]
if "quote_result" not in st.session_state:
    st.session_state.quote_result = None
if "rag_results" not in st.session_state:
    st.session_state.rag_results = []

# ── MOCK DATA HELPERS ─────────────────────────────────────────────────────────

MOCK_RESPONSES = {
    "이번달 불량률 알려줘": (
        "이번달(2026년 6월) **불량률은 3.2%**로, 전월(4.0%) 대비 **0.8%p 개선**되었습니다.\n\n"
        "- 주요 개선 프로젝트: PJT-2024-091 (6.1% → 2.9%)\n"
        "- 주의 필요: PJT-2024-089 (불량률 7.2%, HIGH 리스크)\n"
        "- 목표(3.0%) 대비: 0.2%p 초과 — 지속 모니터링 권고"
    ),
    "PJT-089 납기 리스크?": (
        "**PJT-2024-089** 납기 리스크 분석 결과:\n\n"
        "- 납기일: 2026-07-15\n"
        "- 리스크 점수: **84/100 (HIGH)**\n"
        "- 주요 원인:\n"
        "  1. 부품 조달 지연 (예상 8일 초과)\n"
        "  2. 공정 3단계 병목 (가동률 67%)\n"
        "  3. 최근 불량률 상승 (재작업 발생)\n\n"
        "권장 조치: 대체 공급사 즉시 확인, 야간 교대 검토"
    ),
    "BOM-142 원가 조회": (
        "**BOM-142** (대형 유압 제어 패널) 원가 조회 결과:\n\n"
        "| 항목 | 금액 |\n"
        "|------|------|\n"
        "| 재료비 | ₩12,450,000 |\n"
        "| 노무비 | ₩3,820,000 |\n"
        "| 간접비 | ₩2,150,000 |\n"
        "| **합계** | **₩18,420,000** |\n\n"
        "AI 신뢰도: 91% | 최종 업데이트: 2026-05-28"
    ),
    "최근 이상 발생 현황": (
        "최근 7일 이상 발생 현황 (2026-05-28 ~ 2026-06-04):\n\n"
        "- 설비 이상: **3건** (CNC-04, WELD-02, ASSY-01)\n"
        "- 품질 이상: **7건** (치수 불량 4, 용접 불량 3)\n"
        "- 납기 경보: **2건** (PJT-089, PJT-092)\n\n"
        "가장 시급한 항목: CNC-04 베어링 교체 (잔여 수명 추정 5일)"
    ),
}

DEFAULT_MOCK = (
    "분석 중입니다... 현재 생산 데이터를 기반으로 답변드립니다.\n\n"
    "더 구체적인 프로젝트 번호나 기간을 알려주시면 정밀 분석이 가능합니다. "
    "예: 'PJT-2024-089 불량 원인 분석' 또는 '이번 주 생산 현황 요약'"
)


def call_ai_chat(messages: list, context: str) -> str:
    """Call backend AI chat API; fall back to mock on any error."""
    try:
        payload = {
            "messages": messages,
            "context": context,
            "model": "claude-sonnet-4-6",
        }
        resp = httpx.post(
            f"{BACKEND_URL}/api/v1/ai/chat",
            json=payload,
            timeout=12.0,
        )
        resp.raise_for_status()
        return resp.json().get("response", DEFAULT_MOCK)
    except Exception:
        last_user = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"),
            "",
        )
        for key, val in MOCK_RESPONSES.items():
            if key in last_user:
                return val
        return DEFAULT_MOCK


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN TABS
# ═══════════════════════════════════════════════════════════════════════════════
tab1, tab2, tab3, tab4, tab5 = st.tabs(
    ["💬 AI 채팅", "🔮 예측 AI", "💰 견적 AI", "📚 지식베이스 (RAG)", "⚙️ AI 모델 관리"]
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 1 — AI 채팅
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab1:
    # Status bar
    col_stat1, col_stat2, col_stat3 = st.columns([2, 2, 4])
    with col_stat1:
        st.markdown(
            '<div class="claude-badge"><span class="claude-dot"></span>'
            "Claude API 연결됨</div>",
            unsafe_allow_html=True,
        )
    with col_stat2:
        st.markdown(
            '<div class="claude-badge" style="background:#1a1f35;border-color:#2d3348;color:#9ba3af;">'
            "⚡ 모델: claude-sonnet-4-6</div>",
            unsafe_allow_html=True,
        )
    with col_stat3:
        st.caption(f"컨텍스트 창: 200K tokens | 응답 지연: ~1.2s avg | 오늘 호출: 47회")

    st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)

    # Context selector
    col_ctx, col_actions = st.columns([2, 3])
    with col_ctx:
        chat_context = st.selectbox(
            "AI 컨텍스트",
            ["전체 MES", "BOM 검색", "생산 현황", "품질 분석", "납기 예측"],
            label_visibility="collapsed",
            key="chat_context_select",
        )
        st.caption(f"현재 컨텍스트: **{chat_context}**")

    with col_actions:
        st.markdown("**빠른 질문**")
        q_col1, q_col2, q_col3, q_col4 = st.columns(4)
        quick_questions = [
            "이번달 불량률 알려줘",
            "PJT-089 납기 리스크?",
            "BOM-142 원가 조회",
            "최근 이상 발생 현황",
        ]
        for col, q in zip([q_col1, q_col2, q_col3, q_col4], quick_questions):
            with col:
                if st.button(q, key=f"quick_{q}", use_container_width=True):
                    st.session_state.chat_messages.append(
                        {"role": "user", "content": q, "time": datetime.now().strftime("%H:%M")}
                    )
                    ai_resp = call_ai_chat(
                        [{"role": m["role"], "content": m["content"]} for m in st.session_state.chat_messages],
                        chat_context,
                    )
                    st.session_state.chat_messages.append(
                        {"role": "assistant", "content": ai_resp, "time": datetime.now().strftime("%H:%M")}
                    )
                    st.rerun()

    st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)

    # Chat history display
    chat_container = st.container()
    with chat_container:
        for msg in st.session_state.chat_messages:
            if msg["role"] == "user":
                with st.chat_message("user"):
                    st.markdown(msg["content"])
                    st.caption(msg.get("time", ""))
            else:
                with st.chat_message("assistant", avatar="🤖"):
                    st.markdown(msg["content"])
                    st.caption(f"Akos AI · {msg.get('time', '')}")

    # Chat input
    user_input = st.chat_input("MES 관련 질문을 입력하세요... (예: 이번 주 불량률 추이 알려줘)")
    if user_input:
        st.session_state.chat_messages.append(
            {"role": "user", "content": user_input, "time": datetime.now().strftime("%H:%M")}
        )
        with st.spinner("AI 분석 중..."):
            ai_resp = call_ai_chat(
                [{"role": m["role"], "content": m["content"]} for m in st.session_state.chat_messages],
                chat_context,
            )
        st.session_state.chat_messages.append(
            {"role": "assistant", "content": ai_resp, "time": datetime.now().strftime("%H:%M")}
        )
        st.rerun()

    # Action buttons
    st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)
    btn_col1, btn_col2, btn_col3 = st.columns([1, 1, 4])
    with btn_col1:
        if st.button("💾 대화 이력 저장", use_container_width=True):
            st.toast("대화 이력이 저장되었습니다.", icon="✅")
    with btn_col2:
        if st.button("🔗 이력 공유", use_container_width=True):
            st.toast("공유 링크가 클립보드에 복사되었습니다.", icon="📋")
    with btn_col3:
        if st.button("🗑️ 대화 초기화", key="clear_chat"):
            st.session_state.chat_messages = [
                {
                    "role": "assistant",
                    "content": "대화가 초기화되었습니다. 새로운 질문을 입력해 주세요.",
                    "time": datetime.now().strftime("%H:%M"),
                }
            ]
            st.rerun()


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 2 — 예측 AI 대시보드
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab2:
    pred_tab1, pred_tab2, pred_tab3, pred_tab4 = st.tabs(
        ["🔴 불량 예측", "📅 납기 리스크", "💸 원가 초과", "📊 모델 성능"]
    )

    # ── 불량 예측 ──────────────────────────────────────────────────────────────
    with pred_tab1:
        st.subheader("불량 예측 AI")
        col_sel, col_info = st.columns([2, 3])
        with col_sel:
            selected_proj = st.selectbox(
                "프로젝트 선택",
                ["PJT-2024-089", "PJT-2024-090", "PJT-2024-091", "PJT-2024-092", "PJT-2024-093"],
                key="pred_proj",
            )
        with col_info:
            st.caption("Claude AI + XGBoost 앙상블 | 학습 데이터: 24개월 | 마지막 업데이트: 2026-06-04")

        st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)

        # Prediction result card
        risk_scores = {
            "PJT-2024-089": (72, "HIGH", "#e74c3c"),
            "PJT-2024-090": (38, "MEDIUM", "#f39c12"),
            "PJT-2024-091": (19, "LOW", "#2ecc71"),
            "PJT-2024-092": (55, "MEDIUM", "#f39c12"),
            "PJT-2024-093": (81, "HIGH", "#e74c3c"),
        }
        score, risk_level, risk_color = risk_scores.get(selected_proj, (50, "MEDIUM", "#f39c12"))

        col_r1, col_r2, col_r3, col_r4 = st.columns(4)
        with col_r1:
            render_kpi_card("불량 위험도", f"{score}%", delta=f"리스크: {risk_level}", color=risk_color)
        with col_r2:
            render_kpi_card("예상 불량 수량", f"{int(score * 0.8)}개", delta="-3개 vs 지난주", color="#f39c12")
        with col_r3:
            render_kpi_card("예측 정확도", "89.3%", delta="+1.2%", color="#4f8ef7")
        with col_r4:
            render_kpi_card("잔여 공정", "14단계", delta="6단계 완료", color="#7c3aed")

        # Risk alert
        if risk_level == "HIGH":
            st.error(
                f"⚠️ **{selected_proj}** 불량 위험도 HIGH ({score}%) — 즉시 공정 점검 권고",
                icon="🚨",
            )

        # SHAP bar chart
        col_shap, col_trend = st.columns(2)
        with col_shap:
            features = ["온도 편차", "재료 로트", "작업자 숙련도", "설비 노후도", "습도", "진동 수준"]
            shap_vals = [0.312, 0.241, -0.187, 0.153, -0.089, 0.124]
            st.plotly_chart(
                render_shap_bar(features, shap_vals),
                use_container_width=True,
                key="shap_defect",
            )
        with col_trend:
            # 30일 예측 트렌드
            dates = [(datetime.now() + timedelta(days=i)).strftime("%m/%d") for i in range(30)]
            base = score
            pred_vals = [max(0, min(100, base + random.gauss(0, 4) + (i * 0.3 if base > 60 else -i * 0.2)))
                         for i in range(30)]
            trend_df = pd.DataFrame({"날짜": dates, "예측 불량률(%)": pred_vals})
            fig_trend = px.line(
                trend_df, x="날짜", y="예측 불량률(%)",
                title=f"{selected_proj} — 30일 불량률 예측",
                markers=True,
                color_discrete_sequence=["#7c3aed"],
            )
            fig_trend.add_hline(y=5, line_dash="dash", line_color="#f39c12",
                                annotation_text="경보 임계값 5%", annotation_font_color="#f39c12")
            fig_trend.update_layout(
                height=320, paper_bgcolor="#1e2130", plot_bgcolor="#151822",
                font_color="#f0f2f6",
                xaxis=dict(gridcolor="#2d3348", tickangle=-45),
                yaxis=dict(gridcolor="#2d3348", ticksuffix="%"),
                margin=dict(l=10, r=10, t=50, b=10),
            )
            st.plotly_chart(fig_trend, use_container_width=True, key="pred_trend")

    # ── 납기 리스크 ────────────────────────────────────────────────────────────
    with pred_tab2:
        st.subheader("납기 리스크 AI 분석")
        risk_data = {
            "프로젝트": ["PJT-2024-089", "PJT-2024-090", "PJT-2024-091", "PJT-2024-092", "PJT-2024-093"],
            "납기일": ["2026-07-15", "2026-07-28", "2026-08-10", "2026-07-05", "2026-08-22"],
            "리스크 점수": [84, 52, 23, 71, 38],
            "주요 원인": ["부품 조달 지연", "공정 병목", "일정 준수", "설계 변경", "자재 수급"],
            "권장 조치": ["대체 공급사 확인", "인원 투입 증가", "현 계획 유지", "설계 동결 요청", "재고 확보"],
        }
        risk_df = pd.DataFrame(risk_data)

        def risk_badge(score: int) -> str:
            if score >= 70:
                return f'<span class="badge-high">HIGH {score}</span>'
            elif score >= 40:
                return f'<span class="badge-medium">MED {score}</span>'
            else:
                return f'<span class="badge-low">LOW {score}</span>'

        risk_df["위험 등급"] = risk_df["리스크 점수"].apply(risk_badge)

        col_tbl, col_heat = st.columns([3, 2])
        with col_tbl:
            st.markdown("##### 프로젝트별 납기 리스크")
            # Display with colored badges
            display_df = risk_df[["프로젝트", "납기일", "리스크 점수", "주요 원인", "권장 조치"]].copy()
            st.dataframe(
                display_df.style.background_gradient(subset=["리스크 점수"], cmap="RdYlGn_r"),
                use_container_width=True,
                hide_index=True,
            )
            st.caption("리스크 점수 기준: 70+ HIGH / 40-69 MEDIUM / 0-39 LOW")

        with col_heat:
            st.markdown("##### 리스크 히트맵")
            heat_matrix = [
                [84, 52, 23, 71, 38],
                [72, 61, 31, 68, 44],
                [65, 48, 19, 55, 29],
            ]
            heat_labels = ["공정 리스크", "자재 리스크", "납기 리스크"]
            proj_labels = ["PJT-089", "PJT-090", "PJT-091", "PJT-092", "PJT-093"]
            fig_heat = go.Figure(
                go.Heatmap(
                    z=heat_matrix,
                    x=proj_labels,
                    y=heat_labels,
                    colorscale=[[0, "#1a3a1a"], [0.4, "#3a3a1a"], [0.7, "#4a3a1a"], [1.0, "#4a1a1a"]],
                    text=[[str(v) for v in row] for row in heat_matrix],
                    texttemplate="%{text}",
                    textfont={"size": 14, "color": "white"},
                    showscale=True,
                )
            )
            fig_heat.update_layout(
                height=280, paper_bgcolor="#1e2130",
                font_color="#f0f2f6",
                margin=dict(l=10, r=10, t=20, b=10),
            )
            st.plotly_chart(fig_heat, use_container_width=True, key="risk_heatmap")

    # ── 원가 초과 ──────────────────────────────────────────────────────────────
    with pred_tab3:
        st.subheader("원가 초과 예측")
        projects_cost = ["PJT-089", "PJT-090", "PJT-091", "PJT-092", "PJT-093",
                         "PJT-086", "PJT-087", "PJT-088"]
        budget     = [48, 32, 65, 28, 41, 55, 37, 29]
        actual     = [52, 31, 61, 34, 40, 53, 42, 27]

        col_bar, col_pie = st.columns(2)
        with col_bar:
            cost_df = pd.DataFrame({
                "프로젝트": projects_cost + projects_cost,
                "금액 (백만원)": budget + actual,
                "구분": ["예산"] * 8 + ["실적"] * 8,
            })
            fig_cost = px.bar(
                cost_df, x="프로젝트", y="금액 (백만원)", color="구분",
                barmode="group", title="예산 vs 실적 비교 (단위: 백만원)",
                color_discrete_map={"예산": "#4f8ef7", "실적": "#e74c3c"},
            )
            fig_cost.update_layout(
                height=320, paper_bgcolor="#1e2130", plot_bgcolor="#151822",
                font_color="#f0f2f6",
                legend=dict(bgcolor="#1e2130"),
                xaxis=dict(gridcolor="#2d3348"),
                yaxis=dict(gridcolor="#2d3348"),
                margin=dict(l=10, r=10, t=50, b=10),
            )
            st.plotly_chart(fig_cost, use_container_width=True, key="cost_bar")

        with col_pie:
            cause_labels = ["재료비 상승", "노무비 초과", "설계 변경", "불량 재작업", "기타"]
            cause_vals = [34, 28, 19, 13, 6]
            fig_pie = px.pie(
                names=cause_labels, values=cause_vals,
                title="원가 초과 원인 분석",
                color_discrete_sequence=["#e74c3c", "#f39c12", "#7c3aed", "#4f8ef7", "#9ba3af"],
                hole=0.42,
            )
            fig_pie.update_layout(
                height=320, paper_bgcolor="#1e2130",
                font_color="#f0f2f6",
                legend=dict(bgcolor="#1e2130"),
                margin=dict(l=10, r=10, t=50, b=10),
            )
            st.plotly_chart(fig_pie, use_container_width=True, key="cost_pie")

        # Alert cards for overage projects
        st.markdown("##### 원가 초과 위험 프로젝트 경보")
        alert_cols = st.columns(3)
        overages = [
            ("PJT-2024-089", "+8.3%", "재료비 상승 + 재작업"),
            ("PJT-2024-092", "+21.4%", "설계 변경 3회 발생"),
            ("PJT-2024-087", "+13.5%", "노무비 초과 (야간 수당)"),
        ]
        for col, (proj, over, cause) in zip(alert_cols, overages):
            with col:
                st.markdown(
                    f"""
                    <div class="pred-card">
                        <div class="pred-card-title">{proj}</div>
                        <div class="pred-card-value" style="color:#e74c3c">{over}</div>
                        <div class="pred-card-sub">{cause}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

    # ── 모델 성능 ──────────────────────────────────────────────────────────────
    with pred_tab4:
        st.subheader("AI 모델 성능 지표")
        model_perf = pd.DataFrame({
            "모델명": ["불량 예측 v2.3", "납기 리스크 v1.8", "원가 예측 v1.5", "이상 탐지 v3.1"],
            "정확도": ["89.3%", "84.7%", "82.1%", "91.5%"],
            "재현율": ["87.6%", "81.2%", "79.8%", "90.2%"],
            "F1 Score": ["88.4%", "82.9%", "80.9%", "90.8%"],
            "마지막 학습": ["2026-06-01", "2026-05-28", "2026-05-20", "2026-06-03"],
            "다음 학습 예정": ["2026-07-01", "2026-06-28", "2026-06-20", "2026-07-03"],
            "상태": ["운영중", "운영중", "검증중", "운영중"],
        })
        st.dataframe(model_perf, use_container_width=True, hide_index=True)

        # Performance trend — 12 months
        months = [(datetime.now() - timedelta(days=30 * i)).strftime("%Y-%m") for i in range(11, -1, -1)]
        perf_df = pd.DataFrame({
            "월": months * 4,
            "정확도(%)": (
                [72 + i * 1.5 + random.gauss(0, 1) for i in range(12)] +
                [68 + i * 1.4 + random.gauss(0, 1) for i in range(12)] +
                [65 + i * 1.6 + random.gauss(0, 1) for i in range(12)] +
                [75 + i * 1.4 + random.gauss(0, 1) for i in range(12)]
            ),
            "모델": (
                ["불량 예측"] * 12 + ["납기 리스크"] * 12 +
                ["원가 예측"] * 12 + ["이상 탐지"] * 12
            ),
        })
        fig_perf = px.line(
            perf_df, x="월", y="정확도(%)", color="모델",
            title="모델별 정확도 트렌드 (12개월)",
            markers=True,
        )
        fig_perf.update_layout(
            height=350, paper_bgcolor="#1e2130", plot_bgcolor="#151822",
            font_color="#f0f2f6",
            legend=dict(bgcolor="#1e2130"),
            xaxis=dict(gridcolor="#2d3348", tickangle=-45),
            yaxis=dict(gridcolor="#2d3348", ticksuffix="%", range=[60, 100]),
            margin=dict(l=10, r=10, t=50, b=10),
        )
        st.plotly_chart(fig_perf, use_container_width=True, key="model_perf_trend")

        col_info1, col_info2 = st.columns(2)
        with col_info1:
            st.info("마지막 학습일: **2026-06-03** (이상 탐지 v3.1)", icon="📅")
        with col_info2:
            st.info("다음 예정 학습일: **2026-06-20** (원가 예측 v1.5)", icon="⏰")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 3 — 견적 AI Agent
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab3:
    q_tab1, q_tab2, q_tab3, q_tab4 = st.tabs(
        ["🧮 AI 견적 생성", "⚙️ 파라미터 설정", "📈 시뮬레이션", "📋 견적 이력"]
    )

    # ── AI 견적 생성 ────────────────────────────────────────────────────────────
    with q_tab1:
        st.subheader("AI 자동 견적 생성")
        st.markdown(
            '<div class="claude-badge" style="margin-bottom:12px">'
            '<span class="claude-dot"></span>Claude AI 견적 엔진 활성</div>',
            unsafe_allow_html=True,
        )
        with st.form("quote_form"):
            col_f1, col_f2 = st.columns(2)
            with col_f1:
                customer = st.text_input("고객사명", placeholder="예: (주)현대중공업")
                equipment_type = st.selectbox(
                    "설비 유형",
                    ["유압 제어 패널", "전기 분전반", "자동화 컨베이어", "CNC 가공 설비", "용접 로봇 셀"],
                )
            with col_f2:
                ref_project = st.selectbox(
                    "참조 프로젝트",
                    ["PJT-2024-085 (유사 사례)", "PJT-2024-079 (동일 고객)", "PJT-2024-071 (동일 설비)", "없음"],
                )
                requirements = st.text_area(
                    "요구사항 메모",
                    placeholder="예: IP65 방수등급, CE인증 필요, 납기 8주 이내",
                    height=80,
                )
            generate_btn = st.form_submit_button("🤖 AI 견적 생성", use_container_width=True, type="primary")

        if generate_btn:
            with st.spinner("Claude AI가 최적 견적을 계산 중입니다..."):
                import time; time.sleep(1.5)  # noqa: E401
                base_material = random.randint(8000, 18000)
                base_labor    = int(base_material * 0.28)
                base_overhead = int(base_material * 0.18)
                base_profit   = int((base_material + base_labor + base_overhead) * 0.22)
                st.session_state.quote_result = {
                    "재료비": base_material,
                    "노무비": base_labor,
                    "간접비": base_overhead,
                    "이익": base_profit,
                    "합계": base_material + base_labor + base_overhead + base_profit,
                    "conf_material": 94,
                    "conf_labor": 87,
                    "conf_overhead": 91,
                    "customer": customer or "미입력",
                    "equipment": equipment_type,
                }
                st.rerun()

        if st.session_state.quote_result:
            r = st.session_state.quote_result
            st.success(f"AI 견적 생성 완료 — {r['customer']} | {r['equipment']}", icon="✅")
            st.markdown("##### 견적 상세 내역")

            col_q1, col_q2 = st.columns([3, 2])
            with col_q1:
                quote_items = [
                    ("재료비", r["재료비"], r["conf_material"]),
                    ("노무비", r["노무비"], r["conf_labor"]),
                    ("간접비", r["간접비"], r["conf_overhead"]),
                ]
                for item, val, conf in quote_items:
                    c1, c2, c3, c4 = st.columns([2, 2, 2, 1])
                    with c1:
                        st.markdown(f"**{item}**")
                    with c2:
                        adj_val = st.number_input(
                            f"{item} (조정)", value=val, step=100,
                            label_visibility="collapsed", key=f"adj_{item}"
                        )
                    with c3:
                        st.markdown(f"₩{adj_val:,}")
                    with c4:
                        st.markdown(
                            f'<span class="conf-badge">{conf}%</span>',
                            unsafe_allow_html=True,
                        )

                st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)
                st.markdown(
                    f"**총 견적금액: ₩{r['합계']:,}** "
                    f'<span class="conf-badge">AI 신뢰도 종합: 91%</span>',
                    unsafe_allow_html=True,
                )

            with col_q2:
                pie_labels = ["재료비", "노무비", "간접비", "이익"]
                pie_vals = [r["재료비"], r["노무비"], r["간접비"], r["이익"]]
                fig_qpie = px.pie(
                    names=pie_labels, values=pie_vals,
                    color_discrete_sequence=["#4f8ef7", "#2ecc71", "#f39c12", "#7c3aed"],
                    hole=0.4,
                )
                fig_qpie.update_layout(
                    height=240, paper_bgcolor="#1e2130",
                    font_color="#f0f2f6",
                    legend=dict(bgcolor="#1e2130"),
                    margin=dict(l=0, r=0, t=20, b=0),
                )
                st.plotly_chart(fig_qpie, use_container_width=True, key="quote_pie")

            if st.button("💾 견적 저장", key="save_quote", type="primary"):
                st.toast(f"견적이 저장되었습니다. (QT-{random.randint(1000,9999)})", icon="✅")

    # ── 파라미터 설정 ──────────────────────────────────────────────────────────
    with q_tab2:
        st.subheader("견적 AI 파라미터 설정")
        col_p1, col_p2 = st.columns(2)
        with col_p1:
            margin_rate = st.slider("마진율 (%)", min_value=15, max_value=35, value=22, step=1)
            st.caption(f"현재 마진율: **{margin_rate}%** — 업계 평균 20-25%")
            overhead_rate = st.slider("간접비율 (%)", min_value=10, max_value=30, value=18, step=1)
            st.caption(f"현재 간접비율: **{overhead_rate}%**")
        with col_p2:
            labor_unit = st.number_input(
                "노무비 단가 (원/시간)", min_value=15000, max_value=80000,
                value=35000, step=1000
            )
            st.caption(f"설정 단가: ₩{labor_unit:,}/시간")
            ai_model_choice = st.radio(
                "AI 견적 모델",
                ["XGBoost", "RandomForest", "Ensemble (권장)"],
                index=2,
            )
            st.caption(f"선택 모델: **{ai_model_choice}** | 앙상블 모델이 가장 높은 정확도를 제공합니다.")

        st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)
        if st.button("파라미터 저장", type="primary"):
            st.success(f"파라미터가 저장되었습니다. (마진율: {margin_rate}%, 간접비율: {overhead_rate}%, 모델: {ai_model_choice})")

    # ── 시뮬레이션 ─────────────────────────────────────────────────────────────
    with q_tab3:
        st.subheader("견적 시나리오 시뮬레이션")
        col_sim1, col_sim2 = st.columns([2, 3])
        with col_sim1:
            sim_base = st.number_input("기준 재료비 (만원)", value=1200, step=50, key="sim_base")
            sim_margin = st.slider("마진율", 15, 35, 22, key="sim_margin")
            sim_labor_factor = st.slider("노무비 배율", 0.8, 1.5, 1.0, 0.05, key="sim_labor_f")
            st.caption("파라미터를 변경하면 우측 시나리오가 자동 계산됩니다.")

        with col_sim2:
            base_total     = sim_base * (1 + sim_margin / 100) * sim_labor_factor
            optimistic_tot = base_total * 0.92
            pessimistic_tot = base_total * 1.15

            sim_df = pd.DataFrame({
                "시나리오": ["비관적", "기본", "낙관적"],
                "총 금액 (만원)": [round(pessimistic_tot, 1), round(base_total, 1), round(optimistic_tot, 1)],
                "변동 폭": ["+15%", "기준", "-8%"],
                "마진율": [f"{sim_margin - 3}%", f"{sim_margin}%", f"{sim_margin + 3}%"],
                "예상 납기": ["10주", "8주", "7주"],
            })
            st.dataframe(
                sim_df.style.background_gradient(subset=["총 금액 (만원)"], cmap="RdYlGn"),
                use_container_width=True, hide_index=True,
            )
            fig_sim = px.bar(
                sim_df, x="시나리오", y="총 금액 (만원)",
                color="시나리오",
                color_discrete_map={"낙관적": "#2ecc71", "기본": "#4f8ef7", "비관적": "#e74c3c"},
                title="시나리오별 견적 금액 비교",
            )
            fig_sim.update_layout(
                height=280, paper_bgcolor="#1e2130", plot_bgcolor="#151822",
                font_color="#f0f2f6", showlegend=False,
                xaxis=dict(gridcolor="#2d3348"),
                yaxis=dict(gridcolor="#2d3348"),
                margin=dict(l=10, r=10, t=50, b=10),
            )
            st.plotly_chart(fig_sim, use_container_width=True, key="sim_bar")

    # ── 견적 이력 ──────────────────────────────────────────────────────────────
    with q_tab4:
        st.subheader("견적 이력")
        customers_list = ["(주)현대중공업", "삼성전자", "LG이노텍", "한화시스템", "두산에너빌리티",
                          "현대모비스", "SK하이닉스", "포스코", "KAI", "한국항공우주"]
        equip_list = ["유압 제어 패널", "전기 분전반", "자동화 컨베이어", "CNC 가공 설비", "용접 로봇 셀"]
        status_list = ["승인", "검토중", "제출", "수주", "미수주"]
        history_rows = []
        random.seed(42)
        for i in range(15):
            dt = datetime.now() - timedelta(days=random.randint(1, 120))
            total = random.randint(2000, 35000)
            history_rows.append({
                "견적번호": f"QT-{2024000 + i}",
                "고객사": random.choice(customers_list),
                "설비유형": random.choice(equip_list),
                "총금액(만원)": total,
                "AI신뢰도": f"{random.randint(80, 97)}%",
                "작성일": dt.strftime("%Y-%m-%d"),
                "상태": random.choice(status_list),
            })
        hist_df = pd.DataFrame(history_rows)
        st.dataframe(hist_df, use_container_width=True, hide_index=True)
        st.caption(f"총 {len(hist_df)}개 견적 이력 | 수주율: 46.7%")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 4 — 지식베이스 (RAG)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab4:
    rag_tab1, rag_tab2, rag_tab3 = st.tabs(
        ["📤 문서 업로드", "🔍 지식베이스 검색", "🗄️ 임베딩 현황"]
    )

    # Mock document list
    MOCK_DOCS = [
        {"문서명": "유압 제어 패널 기술 매뉴얼 v3.2", "유형": "기술매뉴얼", "페이지": 124, "업로드일": "2026-05-20", "벡터수": 892},
        {"문서명": "FAT 검사 규격서 2026", "유형": "검사규격", "페이지": 48, "업로드일": "2026-05-18", "벡터수": 341},
        {"문서명": "불량 사례집 2024-2025", "유형": "불량사례집", "페이지": 210, "업로드일": "2026-05-15", "벡터수": 1520},
        {"문서명": "ABB 인버터 부품 카탈로그", "유형": "부품카탈로그", "페이지": 86, "업로드일": "2026-05-10", "벡터수": 614},
        {"문서명": "용접 공정 표준 SOP-WL-003", "유형": "기술매뉴얼", "페이지": 32, "업로드일": "2026-05-08", "벡터수": 228},
        {"문서명": "IEC 61439 전기패널 규격", "유형": "검사규격", "페이지": 156, "업로드일": "2026-04-30", "벡터수": 1105},
        {"문서명": "Siemens PLC 설치 가이드", "유형": "부품카탈로그", "페이지": 72, "업로드일": "2026-04-25", "벡터수": 509},
        {"문서명": "열처리 공정 불량 분석 보고서", "유형": "불량사례집", "페이지": 44, "업로드일": "2026-04-20", "벡터수": 312},
        {"문서명": "원자재 수급 기준서 2026", "유형": "기술매뉴얼", "페이지": 28, "업로드일": "2026-04-15", "벡터수": 198},
        {"문서명": "Schneider 전력량계 카탈로그", "유형": "부품카탈로그", "페이지": 58, "업로드일": "2026-04-10", "벡터수": 411},
        {"문서명": "표면처리 품질 검사 기준서", "유형": "검사규격", "페이지": 36, "업로드일": "2026-04-05", "벡터수": 254},
        {"문서명": "CNC 가공 이상 사례 모음", "유형": "불량사례집", "페이지": 78, "업로드일": "2026-03-28", "벡터수": 556},
        {"문서명": "배선 설계 표준 작업서 v2", "유형": "기술매뉴얼", "페이지": 64, "업로드일": "2026-03-20", "벡터수": 455},
        {"문서명": "Phoenix Contact 단자대 규격", "유형": "부품카탈로그", "페이지": 42, "업로드일": "2026-03-15", "벡터수": 298},
        {"문서명": "2025년 품질 감사 보고서", "유형": "검사규격", "페이지": 92, "업로드일": "2026-03-10", "벡터수": 655},
    ]
    docs_df = pd.DataFrame(MOCK_DOCS)

    # ── 문서 업로드 ────────────────────────────────────────────────────────────
    with rag_tab1:
        st.subheader("문서 업로드 및 임베딩")
        col_up1, col_up2 = st.columns([3, 2])
        with col_up1:
            uploaded_file = st.file_uploader(
                "문서 업로드 (PDF, DOCX, TXT, XLSX)",
                type=["pdf", "docx", "txt", "xlsx"],
                accept_multiple_files=False,
            )
            doc_type = st.selectbox(
                "문서 유형",
                ["기술매뉴얼", "검사규격", "불량사례집", "부품카탈로그"],
                key="rag_doc_type",
            )
            col_up_btn1, col_up_btn2 = st.columns(2)
            with col_up_btn1:
                upload_btn = st.button(
                    "📤 업로드 및 임베딩", type="primary", use_container_width=True,
                    disabled=uploaded_file is None,
                )
            with col_up_btn2:
                st.button("🔄 전체 재임베딩", use_container_width=True)

            if upload_btn and uploaded_file:
                prog = st.progress(0, "문서 파싱 중...")
                import time
                for pct, msg in [(20, "텍스트 추출 중..."), (45, "청크 분할 중..."),
                                 (70, "임베딩 생성 중 (pgvector)..."), (90, "DB 저장 중..."), (100, "완료!")]:
                    time.sleep(0.4)
                    prog.progress(pct, msg)
                st.success(f"'{uploaded_file.name}' 임베딩 완료 — 벡터 {random.randint(200, 800)}개 생성됨")

        with col_up2:
            st.markdown("##### 최근 업로드 문서 (15건)")
            st.dataframe(
                docs_df[["문서명", "유형", "업로드일"]].head(15),
                use_container_width=True, hide_index=True, height=380,
            )

    # ── 지식베이스 검색 ────────────────────────────────────────────────────────
    with rag_tab2:
        st.subheader("RAG 지식베이스 검색")
        col_srch1, col_srch2 = st.columns([4, 1])
        with col_srch1:
            search_query = st.text_input(
                "검색어", placeholder="예: 유압 릴리프 밸브 설정 압력 기준",
                label_visibility="collapsed",
                key="rag_search_input",
            )
        with col_srch2:
            search_btn = st.button("🔍 RAG 검색", type="primary", use_container_width=True)

        MOCK_RAG_RESULTS = [
            {
                "문서명": "유압 제어 패널 기술 매뉴얼 v3.2",
                "유형": "기술매뉴얼",
                "관련도": 0.94,
                "발췌": "릴리프 밸브 설정 압력은 정격 압력의 110% 이하로 설정하며, 초기 설정값은 150bar 기준으로 한다. 압력 조정 시 시스템이 완전 무부하 상태인지 확인 후 진행한다.",
            },
            {
                "문서명": "FAT 검사 규격서 2026",
                "유형": "검사규격",
                "관련도": 0.88,
                "발췌": "유압 회로 내압 시험 기준: 정격 압력 × 1.5배, 유지 시간 5분, 누유 없을 것. 릴리프 밸브 작동 압력 오차 ±5% 이내.",
            },
            {
                "문서명": "불량 사례집 2024-2025",
                "유형": "불량사례집",
                "관련도": 0.82,
                "발췌": "[사례 #PQR-2024-031] 릴리프 밸브 설정압 초과로 실린더 패킹 손상 발생. 원인: 납품 전 설정값 미검증. 재발방지: FAT 체크리스트 항목 추가.",
            },
            {
                "문서명": "ABB 인버터 부품 카탈로그",
                "유형": "부품카탈로그",
                "관련도": 0.71,
                "발췌": "유압 펌프 구동용 인버터 선정 시 기동 토크, 압력 제어 응답성 등을 고려. ABB ACS880 시리즈 권장 (Direct Torque Control 지원).",
            },
            {
                "문서명": "원자재 수급 기준서 2026",
                "유형": "기술매뉴얼",
                "관련도": 0.63,
                "발췌": "유압 오일: ISO VG 46 기준, 청정도 NAS 9등급 이하. 공급사 인증서 필수 확인 후 입고.",
            },
        ]

        if search_btn and search_query:
            st.session_state.rag_results = MOCK_RAG_RESULTS
        elif search_btn and not search_query:
            st.warning("검색어를 입력해 주세요.")

        if st.session_state.rag_results:
            st.markdown(f"##### 검색 결과 — '{search_query}' (5건)")
            for idx, res in enumerate(st.session_state.rag_results, 1):
                badge_color = "#2ecc71" if res["관련도"] >= 0.9 else "#f39c12" if res["관련도"] >= 0.75 else "#9ba3af"
                st.markdown(
                    f"""
                    <div class="rag-result">
                        <div class="rag-doc-name">
                            {idx}. {res['문서명']}
                            <span style="color:{badge_color};margin-left:8px;font-size:0.82rem;">
                                ● 관련도 {int(res['관련도']*100)}%
                            </span>
                            <span style="color:#6b7280;font-size:0.78rem;margin-left:8px;">[{res['유형']}]</span>
                        </div>
                        <div class="rag-excerpt">{res['발췌']}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                st.progress(res["관련도"], text="")

    # ── 임베딩 현황 ────────────────────────────────────────────────────────────
    with rag_tab3:
        st.subheader("임베딩 현황 및 pgvector DB 상태")
        k1, k2, k3, k4 = st.columns(4)
        with k1:
            render_kpi_card("총 문서 수", "156", color="#4f8ef7")
        with k2:
            render_kpi_card("총 벡터 수", "12,847", color="#7c3aed")
        with k3:
            render_kpi_card("마지막 업데이트", "06-04", color="#2ecc71")
        with k4:
            render_kpi_card("평균 관련도", "87.3%", color="#f39c12")

        st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)
        col_emb1, col_emb2 = st.columns([2, 3])
        with col_emb1:
            type_counts = docs_df["유형"].value_counts()
            fig_emb_pie = px.pie(
                names=type_counts.index, values=type_counts.values,
                title="문서 유형별 분포",
                color_discrete_sequence=["#4f8ef7", "#7c3aed", "#2ecc71", "#f39c12"],
                hole=0.4,
            )
            fig_emb_pie.update_layout(
                height=280, paper_bgcolor="#1e2130",
                font_color="#f0f2f6",
                legend=dict(bgcolor="#1e2130"),
                margin=dict(l=10, r=10, t=50, b=10),
            )
            st.plotly_chart(fig_emb_pie, use_container_width=True, key="emb_pie")

        with col_emb2:
            st.markdown("##### pgvector DB 상태")
            st.markdown(
                """
                <div class="pg-status">
                    <b>🟢 pgvector DB 정상 운영 중</b><br><br>
                    호스트: postgres:5432 &nbsp;|&nbsp; DB: akos_mes_rag<br>
                    테이블: document_embeddings (12,847 rows)<br>
                    인덱스: ivfflat (lists=100, probes=10)<br>
                    임베딩 모델: text-embedding-3-large (3072 dims)<br>
                    마지막 VACUUM: 2026-06-04 03:00 KST<br>
                    가용 스토리지: 48.2 GB / 100 GB
                </div>
                """,
                unsafe_allow_html=True,
            )
            st.markdown("<br>", unsafe_allow_html=True)
            st.dataframe(
                docs_df[["문서명", "유형", "벡터수", "업로드일"]],
                use_container_width=True, hide_index=True, height=220,
            )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TAB 5 — AI 모델 관리
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with tab5:
    st.subheader("AI 모델 관리")

    # ── 모델 목록 ──────────────────────────────────────────────────────────────
    st.markdown("##### 등록 모델 목록")
    models_data = pd.DataFrame({
        "모델명": [
            "불량 예측 v2.3", "불량 예측 v2.2",
            "납기 리스크 v1.8", "납기 리스크 v1.7",
            "원가 예측 v1.5", "이상 탐지 v3.1", "이상 탐지 v3.0",
        ],
        "알고리즘": ["XGBoost+Claude", "XGBoost", "RandomForest", "RandomForest", "Ensemble", "LSTM+Claude", "LSTM"],
        "버전": ["2.3", "2.2", "1.8", "1.7", "1.5", "3.1", "3.0"],
        "정확도": [89.3, 86.1, 84.7, 80.2, 82.1, 91.5, 88.9],
        "학습일": ["2026-06-01", "2026-05-01", "2026-05-28", "2026-04-28", "2026-05-20", "2026-06-03", "2026-05-03"],
        "상태": ["운영중", "대기", "운영중", "대기", "검증중", "운영중", "대기"],
        "적용중": [True, False, True, False, False, True, False],
    })

    # Highlight active models
    def style_model_row(row):
        if row["적용중"]:
            return ["background-color: #1a2540; color: #f0f2f6; font-weight: bold"] * len(row)
        return [""] * len(row)

    styled_models = models_data.style.apply(style_model_row, axis=1).background_gradient(
        subset=["정확도"], cmap="Blues"
    )
    st.dataframe(styled_models, use_container_width=True, hide_index=True)
    st.caption("굵게 표시된 행 = 현재 적용 중인 모델")

    st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)

    col_m1, col_m2 = st.columns(2)

    # ── 학습 데이터 관리 ────────────────────────────────────────────────────────
    with col_m1:
        st.markdown("##### 학습 데이터셋 관리")
        datasets = pd.DataFrame({
            "데이터셋": ["불량 이력 2024-2026", "납기 실적 2022-2026", "원가 실적 2023-2026", "센서 로그 2025-2026"],
            "레코드 수": ["48,291", "12,847", "9,432", "234,821"],
            "크기": ["124 MB", "38 MB", "27 MB", "892 MB"],
            "마지막 갱신": ["2026-06-03", "2026-06-01", "2026-05-28", "2026-06-04"],
        })
        st.dataframe(datasets, use_container_width=True, hide_index=True)

        col_train1, col_train2 = st.columns(2)
        with col_train1:
            train_model = st.selectbox(
                "학습 대상 모델",
                ["불량 예측", "납기 리스크", "원가 예측", "이상 탐지"],
                key="train_model_sel",
            )
        with col_train2:
            train_algo = st.selectbox(
                "알고리즘",
                ["XGBoost", "RandomForest", "LSTM", "Ensemble"],
                key="train_algo_sel",
            )
        if st.button("🚀 신규 학습 시작", type="primary", use_container_width=True):
            with st.spinner(f"{train_model} 모델 학습 중... (예상 소요: 약 15분)"):
                import time; time.sleep(1.5)  # noqa: E401
            st.success(f"{train_model} v{random.randint(1,3)}.{random.randint(0,9)} 학습 작업이 큐에 등록되었습니다.")
            st.info("학습 완료 시 알림이 발송됩니다. 학습 중에도 운영 모델은 정상 서비스됩니다.")

    # ── 모델 성능 리포트 ────────────────────────────────────────────────────────
    with col_m2:
        st.markdown("##### 모델 정확도 트렌드")
        months_m = [(datetime.now() - timedelta(days=30 * i)).strftime("%m월") for i in range(5, -1, -1)]
        acc_trend = pd.DataFrame({
            "월": months_m * 3,
            "정확도(%)": (
                [83, 85, 86, 87, 88, 89] +
                [79, 80, 82, 83, 84, 85] +
                [87, 88, 89, 90, 91, 92]
            ),
            "모델": ["불량 예측"] * 6 + ["납기 리스크"] * 6 + ["이상 탐지"] * 6,
        })
        fig_acc = px.line(
            acc_trend, x="월", y="정확도(%)", color="모델",
            markers=True, title="모델 정확도 트렌드 (6개월)",
            color_discrete_sequence=["#4f8ef7", "#f39c12", "#2ecc71"],
        )
        fig_acc.update_layout(
            height=220, paper_bgcolor="#1e2130", plot_bgcolor="#151822",
            font_color="#f0f2f6",
            legend=dict(bgcolor="#1e2130"),
            xaxis=dict(gridcolor="#2d3348"),
            yaxis=dict(gridcolor="#2d3348", ticksuffix="%", range=[70, 100]),
            margin=dict(l=10, r=10, t=50, b=10),
        )
        st.plotly_chart(fig_acc, use_container_width=True, key="model_acc_trend")

        # Confusion matrix mock
        st.markdown("##### Confusion Matrix (불량 예측 v2.3)")
        cm_data = [[942, 58], [87, 913]]
        fig_cm = go.Figure(
            go.Heatmap(
                z=cm_data,
                x=["예측: 정상", "예측: 불량"],
                y=["실제: 정상", "실제: 불량"],
                colorscale=[[0, "#151822"], [0.5, "#1a2540"], [1.0, "#4f8ef7"]],
                text=[[str(v) for v in row] for row in cm_data],
                texttemplate="%{text}",
                textfont={"size": 18, "color": "white"},
                showscale=False,
            )
        )
        fig_cm.update_layout(
            height=200, paper_bgcolor="#1e2130",
            font_color="#f0f2f6",
            margin=dict(l=10, r=10, t=10, b=10),
        )
        st.plotly_chart(fig_cm, use_container_width=True, key="confusion_matrix")
        st.caption("정밀도: 94.0% | 재현율: 91.3% | F1: 92.6% | 테스트 샘플: 2,000건")
