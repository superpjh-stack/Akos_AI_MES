"""01_대시보드.py — Akos AI MES 메인 대시보드 (5개 탭)"""

import streamlit as st
import httpx
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os
import sys
from datetime import datetime, timedelta
import random

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from components.kpi_card import render_kpi_card
from components.charts import render_oee_gauge, render_defect_trend, render_gantt, fat_pie_chart, render_defect_bar

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# ─────────────────────────────────────────────────────────
# 페이지 설정
# ─────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Akos AI MES — 대시보드",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────────────────
# 글로벌 스타일
# ─────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* 기본 배경 */
    .stApp { background-color: #1e2130; }
    .block-container { padding-top: 1.2rem; }

    /* 탭 스타일 */
    .stTabs [data-baseweb="tab-list"] {
        background-color: #252a3d;
        border-radius: 8px;
        padding: 4px;
        gap: 4px;
    }
    .stTabs [data-baseweb="tab"] {
        background-color: transparent;
        color: #9ba3af;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.85rem;
        padding: 6px 14px;
    }
    .stTabs [aria-selected="true"] {
        background-color: #4f8ef7 !important;
        color: #ffffff !important;
    }

    /* 섹션 헤더 */
    .section-header {
        font-size: 1.05rem;
        font-weight: 700;
        color: #f0f2f6;
        padding: 8px 0 4px 0;
        border-bottom: 2px solid #4f8ef7;
        margin-bottom: 12px;
    }

    /* 카드 공통 */
    .info-card {
        background: #252a3d;
        border-radius: 10px;
        padding: 14px 18px;
        margin-bottom: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }

    /* 경보 카드 */
    .alert-card-red {
        background: linear-gradient(135deg, #3a1a1a, #2d1515);
        border-left: 4px solid #e74c3c;
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 10px;
    }
    .alert-card-orange {
        background: linear-gradient(135deg, #3a2a1a, #2d2015);
        border-left: 4px solid #f39c12;
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 10px;
    }
    .alert-card-green {
        background: linear-gradient(135deg, #1a3a1a, #152d15);
        border-left: 4px solid #2ecc71;
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 10px;
    }
    .alert-card-blue {
        background: linear-gradient(135deg, #1a2a3a, #15202d);
        border-left: 4px solid #4f8ef7;
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 10px;
    }

    /* 상태 배지 */
    .badge-green { background:#1a3a1a; color:#2ecc71; border:1px solid #2ecc71;
        border-radius:12px; padding:2px 10px; font-size:0.78rem; font-weight:600; }
    .badge-red { background:#3a1a1a; color:#e74c3c; border:1px solid #e74c3c;
        border-radius:12px; padding:2px 10px; font-size:0.78rem; font-weight:600; }
    .badge-orange { background:#3a2a1a; color:#f39c12; border:1px solid #f39c12;
        border-radius:12px; padding:2px 10px; font-size:0.78rem; font-weight:600; }
    .badge-blue { background:#1a2a3a; color:#4f8ef7; border:1px solid #4f8ef7;
        border-radius:12px; padding:2px 10px; font-size:0.78rem; font-weight:600; }
    .badge-gray { background:#252a3d; color:#9ba3af; border:1px solid #9ba3af;
        border-radius:12px; padding:2px 10px; font-size:0.78rem; font-weight:600; }

    /* 설비 그리드 카드 */
    .equip-card {
        background: #252a3d;
        border-radius: 10px;
        padding: 14px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .equip-name { font-size:0.95rem; font-weight:700; color:#f0f2f6; margin-bottom:6px; }
    .equip-id { font-size:0.72rem; color:#9ba3af; margin-bottom:8px; }

    /* D-Day 카드 */
    .dday-card {
        background: #252a3d;
        border-radius: 10px;
        padding: 16px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .dday-value { font-size:2.2rem; font-weight:800; line-height:1.1; }
    .dday-project { font-size:0.8rem; color:#9ba3af; margin-top:4px; }
    .dday-date { font-size:0.75rem; color:#6b7280; margin-top:2px; }

    /* 할일 */
    .task-item {
        background: #252a3d;
        border-radius: 8px;
        padding: 10px 14px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    /* 진행률 바 */
    .progress-bar-outer {
        background: #1a1f30;
        border-radius: 6px;
        height: 8px;
        width: 100%;
        overflow: hidden;
    }
    .progress-bar-inner {
        height: 8px;
        border-radius: 6px;
        background: linear-gradient(90deg, #4f8ef7, #2ecc71);
    }

    /* 구분선 */
    .divider { border: none; border-top: 1px solid #2d3348; margin: 14px 0; }

    /* 테이블 */
    .stDataFrame { background: #252a3d !important; }
    thead tr th { background-color: #2d3348 !important; color: #f0f2f6 !important; }
    tbody tr td { background-color: #1e2130 !important; color: #c9cdd6 !important; }

    /* 타임스탬프 */
    .timestamp-text { font-size:0.72rem; color:#6b7280; text-align:right; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────
# 페이지 제목
# ─────────────────────────────────────────────────────────
st.markdown("""
<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
    <span style="font-size:2rem;">🏭</span>
    <div>
        <div style="font-size:1.5rem;font-weight:800;color:#f0f2f6;line-height:1.1;">Akos AI MES — 대시보드</div>
        <div style="font-size:0.82rem;color:#9ba3af;">AI 특화 스마트공장 제조실행시스템</div>
    </div>
    <div style="margin-left:auto;text-align:right;">
        <div style="font-size:0.78rem;color:#9ba3af;">마지막 갱신</div>
        <div style="font-size:0.88rem;color:#4f8ef7;font-weight:600;">""" + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</div>
    </div>
</div>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────
# 목업 데이터 생성 헬퍼
# ─────────────────────────────────────────────────────────
TODAY = datetime(2026, 6, 4)
random.seed(42)

def make_monthly_revenue():
    months = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]
    base = [8.2, 7.5, 9.1, 10.3, 9.8, 11.2, 10.7, 12.1, 11.5, 13.0, 12.4, 14.2]
    return pd.DataFrame({"월": months, "매출(억원)": base})

def make_projects():
    return pd.DataFrame([
        {"프로젝트명":"PJT-2024-089","고객사":"현대중공업","진행률":78,"납기":"2026-06-20","상태":"진행중"},
        {"프로젝트명":"PJT-2024-091","고객사":"삼성전자","진행률":45,"납기":"2026-07-15","상태":"진행중"},
        {"프로젝트명":"PJT-2024-095","고객사":"LG화학","진행률":92,"납기":"2026-06-10","상태":"완료임박"},
        {"프로젝트명":"PJT-2025-002","고객사":"포스코","진행률":30,"납기":"2026-08-30","상태":"진행중"},
        {"프로젝트명":"PJT-2025-005","고객사":"SK하이닉스","진행률":15,"납기":"2026-09-20","상태":"초기"},
        {"프로젝트명":"PJT-2025-008","고객사":"한화에어로","진행률":61,"납기":"2026-07-01","상태":"진행중"},
        {"프로젝트명":"PJT-2025-011","고객사":"두산에너빌","진행률":88,"납기":"2026-06-07","상태":"완료임박"},
        {"프로젝트명":"PJT-2025-014","고객사":"현대모비스","진행률":5,"납기":"2026-10-15","상태":"초기"},
    ])

def make_defect_trend():
    dates = [TODAY - timedelta(days=i) for i in range(29, -1, -1)]
    rates = [max(1.0, 3.2 + random.uniform(-1.2, 1.2) + (i * -0.02)) for i, _ in enumerate(dates)]
    return pd.DataFrame({"date": [d.strftime("%m-%d") for d in dates], "defect_rate": rates})

def make_defect_bar():
    return pd.DataFrame([
        {"category":"치수 불량","count":23},
        {"category":"외관 스크래치","count":17},
        {"category":"용접 불량","count":12},
        {"category":"조립 오류","count":9},
        {"category":"코팅 결함","count":7},
        {"category":"전기 불량","count":5},
    ])

def make_gantt():
    projects = [
        ("PJT-2024-089", "진행중", 0, 20),
        ("PJT-2024-091", "진행중", 5, 35),
        ("PJT-2024-095", "완료임박", -10, 6),
        ("PJT-2025-002", "진행중", 10, 60),
        ("PJT-2025-005", "pending", 20, 80),
        ("PJT-2025-008", "in_progress", 3, 27),
        ("PJT-2025-011", "completed", -5, 3),
        ("PJT-2025-014", "pending", 30, 100),
    ]
    rows = []
    for name, status, start_offset, end_offset in projects:
        rows.append({
            "task": name,
            "start": TODAY + timedelta(days=start_offset),
            "end": TODAY + timedelta(days=end_offset),
            "status": status,
        })
    return pd.DataFrame(rows)

# ─────────────────────────────────────────────────────────
# 탭 구성
# ─────────────────────────────────────────────────────────
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "🏢 경영진 대시보드",
    "🏭 생산 현황",
    "🔍 품질 대시보드",
    "📅 납기/일정",
    "👤 개인 대시보드",
])

# ═══════════════════════════════════════════════════════════
# TAB 1 — 경영진 대시보드
# ═══════════════════════════════════════════════════════════
with tab1:
    st.markdown('<div class="section-header">📊 핵심 경영 지표 (KPI)</div>', unsafe_allow_html=True)

    kpi_cols = st.columns(4, gap="small")
    with kpi_cols[0]:
        render_kpi_card("불량률", "3.2%", delta="-0.8%", color="#e74c3c",
                        help_text="전월 대비 불량률 변화")
    with kpi_cols[1]:
        render_kpi_card("납기준수율", "94.5%", delta="+2.1%", color="#2ecc71",
                        help_text="이번달 납기 준수 비율")
    with kpi_cols[2]:
        render_kpi_card("월 매출", "₩12.4억", delta="+15%", color="#4f8ef7",
                        help_text="전년 동월 대비 매출 증가율")
    with kpi_cols[3]:
        render_kpi_card("진행 프로젝트", "8개", delta=None, color="#f39c12",
                        help_text="현재 수주 및 진행 중인 프로젝트 수")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── 월별 매출 차트
    col_chart, col_ai = st.columns([2, 1], gap="medium")
    with col_chart:
        st.markdown('<div class="section-header">📈 월별 매출 현황 (2026년)</div>', unsafe_allow_html=True)
        rev_df = make_monthly_revenue()
        fig_rev = px.bar(
            rev_df, x="월", y="매출(억원)",
            color="매출(억원)",
            color_continuous_scale=["#1a2a3a", "#4f8ef7", "#2ecc71"],
            text="매출(억원)",
        )
        fig_rev.update_traces(texttemplate="%{text:.1f}억", textposition="outside")
        fig_rev.update_layout(
            height=320,
            paper_bgcolor="#1e2130",
            plot_bgcolor="#151822",
            font_color="#f0f2f6",
            showlegend=False,
            coloraxis_showscale=False,
            xaxis=dict(gridcolor="#2d3348"),
            yaxis=dict(gridcolor="#2d3348", ticksuffix="억"),
            margin=dict(l=10, r=10, t=20, b=10),
        )
        st.plotly_chart(fig_rev, use_container_width=True)

    with col_ai:
        st.markdown('<div class="section-header">🤖 AI 예측 경보</div>', unsafe_allow_html=True)
        st.markdown("""
        <div class="alert-card-red">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.2rem;">🚨</span>
                <span style="font-weight:700;color:#e74c3c;font-size:0.9rem;">납기 지연 리스크</span>
            </div>
            <div style="font-weight:700;color:#f0f2f6;font-size:0.95rem;">PJT-2024-089</div>
            <div style="color:#9ba3af;font-size:0.8rem;margin-top:4px;">현대중공업 | 납기: 2026-06-20</div>
            <div style="color:#f39c12;font-size:0.82rem;margin-top:6px;">⚠ AI 예측 신뢰도: <b>87%</b></div>
            <div style="color:#9ba3af;font-size:0.75rem;margin-top:4px;">부품 조달 지연 + 검사 일정 과부하</div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown("""
        <div class="alert-card-orange">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.2rem;">⚡</span>
                <span style="font-weight:700;color:#f39c12;font-size:0.9rem;">품질 이상 예측</span>
            </div>
            <div style="font-weight:700;color:#f0f2f6;font-size:0.95rem;">설비 CNC-03</div>
            <div style="color:#9ba3af;font-size:0.8rem;margin-top:4px;">가공라인 3번 설비</div>
            <div style="color:#f39c12;font-size:0.82rem;margin-top:6px;">⚠ AI 예측 신뢰도: <b>72%</b></div>
            <div style="color:#9ba3af;font-size:0.75rem;margin-top:4px;">진동 이상 패턴 감지 — 예방정비 권고</div>
        </div>
        """, unsafe_allow_html=True)
        st.markdown("""
        <div class="alert-card-blue">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.2rem;">💡</span>
                <span style="font-weight:700;color:#4f8ef7;font-size:0.9rem;">수주 기회 포착</span>
            </div>
            <div style="font-weight:700;color:#f0f2f6;font-size:0.95rem;">신규 RFQ 접수</div>
            <div style="color:#9ba3af;font-size:0.8rem;margin-top:4px;">한국전력 | 예상 수주액 ₩3.2억</div>
            <div style="color:#4f8ef7;font-size:0.82rem;margin-top:6px;">▲ 수주 가능성: <b>91%</b></div>
        </div>
        """, unsafe_allow_html=True)

    # ── 프로젝트 현황 테이블
    st.markdown('<div class="section-header">📋 프로젝트 현황</div>', unsafe_allow_html=True)
    proj_df = make_projects()

    def style_status(val):
        colors = {
            "완료임박": "background-color:#1a3a1a;color:#2ecc71;font-weight:700;",
            "진행중": "background-color:#1a2a3a;color:#4f8ef7;font-weight:700;",
            "초기": "background-color:#252a3d;color:#9ba3af;font-weight:700;",
            "지연": "background-color:#3a1a1a;color:#e74c3c;font-weight:700;",
        }
        return colors.get(val, "")

    def style_progress(val):
        if val >= 80:
            return "color:#2ecc71;font-weight:700;"
        elif val >= 50:
            return "color:#4f8ef7;font-weight:700;"
        else:
            return "color:#f39c12;font-weight:700;"

    styled = (
        proj_df.style
        .applymap(style_status, subset=["상태"])
        .applymap(style_progress, subset=["진행률"])
        .format({"진행률": "{}%"})
        .set_properties(**{"background-color": "#252a3d", "color": "#c9cdd6", "border": "1px solid #2d3348"})
        .set_table_styles([
            {"selector": "thead th", "props": "background-color:#2d3348;color:#f0f2f6;font-weight:700;border:1px solid #3a4060;"},
            {"selector": "tbody tr:hover td", "props": "background-color:#2d3348;"},
        ])
    )
    st.dataframe(proj_df, use_container_width=True, height=280)


# ═══════════════════════════════════════════════════════════
# TAB 2 — 생산 현황
# ═══════════════════════════════════════════════════════════
with tab2:
    st.markdown('<div class="section-header">⚡ 실시간 생산 현황</div>', unsafe_allow_html=True)

    prod_cols = st.columns(4, gap="small")
    with prod_cols[0]:
        render_kpi_card("계획 대비 진행률", "83%", delta="+3%", color="#4f8ef7",
                        help_text="오늘 생산 계획 대비 실적")
    with prod_cols[1]:
        render_kpi_card("오늘 생산량", "247개", delta="+12개", color="#2ecc71",
                        help_text="금일 완성품 수량")
    with prod_cols[2]:
        render_kpi_card("설비 가동률", "87.3%", delta="-1.2%", color="#f39c12",
                        help_text="전체 설비 가동 비율")
    with prod_cols[3]:
        render_kpi_card("작업자 투입", "34명", delta=None, color="#9b59b6",
                        help_text="현재 현장 투입 인원")

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown(f'<div class="timestamp-text">🟢 MQTT/OPC-UA 실시간 연결 중 | 마지막 업데이트: {datetime.now().strftime("%H:%M:%S")}</div>', unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True)

    # ── OEE 게이지
    st.markdown('<div class="section-header">📊 설비별 OEE (종합 설비 효율)</div>', unsafe_allow_html=True)
    oee_cols = st.columns(3, gap="medium")
    with oee_cols[0]:
        fig_a = render_oee_gauge(82, "설비A — CNC 가공")
        st.plotly_chart(fig_a, use_container_width=True)
        st.markdown('<div style="text-align:center;color:#9ba3af;font-size:0.78rem;">가용성 91% | 성능 87% | 품질 95%</div>', unsafe_allow_html=True)
    with oee_cols[1]:
        fig_b = render_oee_gauge(76, "설비B — 용접 로봇")
        st.plotly_chart(fig_b, use_container_width=True)
        st.markdown('<div style="text-align:center;color:#f39c12;font-size:0.78rem;">가용성 85% | 성능 80% | 품질 98%</div>', unsafe_allow_html=True)
    with oee_cols[2]:
        fig_c = render_oee_gauge(91, "설비C — 조립 라인")
        st.plotly_chart(fig_c, use_container_width=True)
        st.markdown('<div style="text-align:center;color:#2ecc71;font-size:0.78rem;">가용성 95% | 성능 93% | 품질 98%</div>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── 설비 상태 그리드
    st.markdown('<div class="section-header">🔧 설비 상태 모니터링</div>', unsafe_allow_html=True)
    equipments = [
        {"name": "CNC 가공기 A1", "id": "MCH-001", "status": "가동중", "temp": "42°C", "rpm": "3,200 RPM", "load": "78%"},
        {"name": "용접 로봇 B1", "id": "ROB-001", "status": "가동중", "temp": "68°C", "rpm": "—", "load": "85%"},
        {"name": "조립 라인 C1", "id": "ASM-001", "status": "가동중", "temp": "35°C", "rpm": "—", "load": "91%"},
        {"name": "도장 설비 D1", "id": "PNT-001", "status": "정지", "temp": "28°C", "rpm": "—", "load": "0%"},
        {"name": "CNC 가공기 A2", "id": "MCH-002", "status": "점검", "temp": "55°C", "rpm": "1,800 RPM", "load": "45%"},
        {"name": "검사 장비 E1", "id": "INS-001", "status": "가동중", "temp": "31°C", "rpm": "—", "load": "62%"},
    ]

    status_badge = {
        "가동중": '<span class="badge-green">● 가동중</span>',
        "정지": '<span class="badge-red">● 정지</span>',
        "점검": '<span class="badge-orange">● 점검중</span>',
    }

    eq_cols = st.columns(3, gap="small")
    for i, eq in enumerate(equipments):
        with eq_cols[i % 3]:
            badge = status_badge.get(eq["status"], "")
            st.markdown(f"""
            <div class="equip-card">
                <div class="equip-name">{eq['name']}</div>
                <div class="equip-id">{eq['id']}</div>
                <div style="margin-bottom:8px;">{badge}</div>
                <hr class="divider">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.78rem;color:#9ba3af;">
                    <div>🌡 온도: <b style="color:#f0f2f6;">{eq['temp']}</b></div>
                    <div>⚙ 회전수: <b style="color:#f0f2f6;">{eq['rpm']}</b></div>
                    <div colspan="2">📊 부하율: <b style="color:#4f8ef7;">{eq['load']}</b></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True) if i % 3 == 2 else None

    st.markdown("<br>", unsafe_allow_html=True)

    # ── 실시간 생산 로그
    st.markdown('<div class="section-header">📝 실시간 생산 로그 (최근 10건)</div>', unsafe_allow_html=True)
    log_data = []
    for i in range(10):
        t = datetime.now() - timedelta(minutes=i * 7)
        events = ["부품 가공 완료", "품질 검사 통과", "조립 완료", "불량 감지", "설비 알람 해제", "작업 지시 수신"]
        equip_ids = ["MCH-001", "ROB-001", "ASM-001", "INS-001", "MCH-002", "PNT-001"]
        log_data.append({
            "시각": t.strftime("%H:%M:%S"),
            "설비": equip_ids[i % len(equip_ids)],
            "이벤트": events[i % len(events)],
            "수량": random.randint(1, 15),
            "작업자": f"작업자{random.randint(1,10):02d}",
        })
    st.dataframe(pd.DataFrame(log_data), use_container_width=True, height=280)


# ═══════════════════════════════════════════════════════════
# TAB 3 — 품질 대시보드
# ═══════════════════════════════════════════════════════════
with tab3:
    st.markdown('<div class="section-header">🔍 품질 현황 개요</div>', unsafe_allow_html=True)

    q_kpi_cols = st.columns(4, gap="small")
    with q_kpi_cols[0]:
        render_kpi_card("오늘 불량률", "2.8%", delta="-0.4%", color="#2ecc71")
    with q_kpi_cols[1]:
        render_kpi_card("이번달 불량건수", "73건", delta="+5건", color="#e74c3c")
    with q_kpi_cols[2]:
        render_kpi_card("1차 합격률", "96.7%", delta="+1.2%", color="#4f8ef7")
    with q_kpi_cols[3]:
        render_kpi_card("고객 클레임", "2건", delta="-1건", color="#f39c12")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── 불량률 트렌드 + 불량 유형 분포
    col_trend, col_bar = st.columns([3, 2], gap="medium")
    with col_trend:
        st.markdown('<div class="section-header">📈 불량률 트렌드 (최근 30일)</div>', unsafe_allow_html=True)
        defect_df = make_defect_trend()
        fig_trend = render_defect_trend(defect_df)
        st.plotly_chart(fig_trend, use_container_width=True)

    with col_bar:
        st.markdown('<div class="section-header">📊 불량 유형 분포</div>', unsafe_allow_html=True)
        bar_df = make_defect_bar()
        fig_bar = render_defect_bar(bar_df)
        st.plotly_chart(fig_bar, use_container_width=True)

    # ── 불량 원인 TOP 5
    col_top5, col_ai_q = st.columns([2, 1], gap="medium")
    with col_top5:
        st.markdown('<div class="section-header">🏆 불량 원인 TOP 5</div>', unsafe_allow_html=True)
        top5_df = pd.DataFrame([
            {"순위": 1, "불량 원인": "원자재 치수 편차 과다", "발생 건수": 28, "비율": "38.4%", "개선 상태": "개선중"},
            {"순위": 2, "불량 원인": "용접 온도 설정 오류", "발생 건수": 19, "비율": "26.0%", "개선 상태": "조사중"},
            {"순위": 3, "불량 원인": "작업자 수작업 실수", "발생 건수": 12, "비율": "16.4%", "개선 상태": "표준화"},
            {"순위": 4, "불량 원인": "설비 마모로 인한 오차", "발생 건수": 9,  "비율": "12.3%", "개선 상태": "PM 예정"},
            {"순위": 5, "불량 원인": "환경 이물질 혼입", "발생 건수": 5,  "비율": "6.8%",  "개선 상태": "조사중"},
        ])
        st.dataframe(top5_df, use_container_width=True, height=220)

    with col_ai_q:
        st.markdown('<div class="section-header">🤖 AI 품질 예측 알림</div>', unsafe_allow_html=True)
        ai_quality_alerts = [
            {"text": "CNC-03 진동 이상 → 치수 불량 발생 예측", "conf": 83, "color": "red"},
            {"text": "용접 로봇 B1 온도 상승 → 용접 불량 가능성", "conf": 71, "color": "orange"},
            {"text": "교대 후 첫 1시간 불량률 상승 패턴 감지", "conf": 68, "color": "orange"},
        ]
        for alert in ai_quality_alerts:
            card_class = f"alert-card-{alert['color']}"
            badge_color = "#e74c3c" if alert["color"] == "red" else "#f39c12"
            st.markdown(f"""
            <div class="{card_class}">
                <div style="color:#f0f2f6;font-size:0.85rem;font-weight:600;margin-bottom:6px;">⚠ 예측 불량 경보</div>
                <div style="color:#c9cdd6;font-size:0.82rem;">{alert['text']}</div>
                <div style="color:{badge_color};font-size:0.8rem;margin-top:6px;">AI 신뢰도: <b>{alert['conf']}%</b></div>
            </div>
            """, unsafe_allow_html=True)

    # ── 품질 검사 이력
    st.markdown('<div class="section-header">📋 오늘의 품질 검사 결과</div>', unsafe_allow_html=True)
    inspection_data = []
    result_options = ["합격", "합격", "합격", "합격", "불량", "재검사"]
    for i in range(12):
        t = datetime.now() - timedelta(minutes=i * 22)
        result = result_options[random.randint(0, len(result_options)-1)]
        inspection_data.append({
            "검사 시각": t.strftime("%H:%M"),
            "프로젝트": f"PJT-202{random.choice(['4','5'])}-{random.randint(89,114):03d}",
            "부품명": random.choice(["메인 프레임","커버 플레이트","기어 샤프트","볼트 어셈블리","센서 마운트"]),
            "검사 항목": random.choice(["치수 검사","외관 검사","용접 검사","전기 테스트"]),
            "결과": result,
            "담당자": f"Q{random.randint(1,5):02d}",
        })
    st.dataframe(pd.DataFrame(inspection_data), use_container_width=True, height=280)


# ═══════════════════════════════════════════════════════════
# TAB 4 — 납기/일정
# ═══════════════════════════════════════════════════════════
with tab4:
    st.markdown('<div class="section-header">📅 납기 D-Day 현황</div>', unsafe_allow_html=True)

    dday_projects = [
        {"name": "PJT-2025-011", "customer": "두산에너빌", "due": TODAY + timedelta(days=3),  "progress": 88},
        {"name": "PJT-2024-095", "customer": "LG화학",    "due": TODAY + timedelta(days=6),  "progress": 92},
        {"name": "PJT-2025-008", "customer": "한화에어로", "due": TODAY + timedelta(days=27), "progress": 61},
        {"name": "PJT-2024-089", "customer": "현대중공업", "due": TODAY + timedelta(days=16), "progress": 78},
        {"name": "PJT-2024-091", "customer": "삼성전자",   "due": TODAY + timedelta(days=41), "progress": 45},
    ]

    dday_cols = st.columns(5, gap="small")
    for i, proj in enumerate(dday_projects):
        days_left = (proj["due"] - TODAY).days
        if days_left <= 3:
            value_color = "#e74c3c"
            bg_style = "background:linear-gradient(135deg,#3a1a1a,#2a1515);"
        elif days_left <= 7:
            value_color = "#f39c12"
            bg_style = "background:linear-gradient(135deg,#3a2a1a,#2a1e15);"
        else:
            value_color = "#2ecc71"
            bg_style = "background:linear-gradient(135deg,#1a3a1a,#152a15);"

        dday_label = f"D-{days_left}" if days_left > 0 else ("D-Day" if days_left == 0 else f"D+{abs(days_left)}")

        with dday_cols[i]:
            st.markdown(f"""
            <div class="dday-card" style="{bg_style}border-radius:10px;padding:16px;text-align:center;">
                <div class="dday-value" style="color:{value_color};">{dday_label}</div>
                <div style="font-size:0.82rem;font-weight:700;color:#f0f2f6;margin-top:6px;">{proj['name']}</div>
                <div class="dday-project">{proj['customer']}</div>
                <div class="dday-date">{proj['due'].strftime('%Y-%m-%d')}</div>
                <div style="margin-top:10px;">
                    <div class="progress-bar-outer">
                        <div class="progress-bar-inner" style="width:{proj['progress']}%;"></div>
                    </div>
                    <div style="font-size:0.72rem;color:#9ba3af;margin-top:3px;">진행률 {proj['progress']}%</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── 간트 차트
    st.markdown('<div class="section-header">📊 납기 일정 간트 차트</div>', unsafe_allow_html=True)
    gantt_df = make_gantt()
    fig_gantt = render_gantt(gantt_df)
    st.plotly_chart(fig_gantt, use_container_width=True)

    # ── 이번달 납기 현황 요약
    st.markdown('<div class="section-header">📋 이번달 (6월) 납기 현황 요약</div>', unsafe_allow_html=True)
    col_sum1, col_sum2 = st.columns([2, 1], gap="medium")

    with col_sum1:
        monthly_df = pd.DataFrame([
            {"프로젝트": "PJT-2025-011", "고객사": "두산에너빌", "계획 납기": "2026-06-07", "예상 완료": "2026-06-07", "위험도": "낮음", "비고": "정상 진행"},
            {"프로젝트": "PJT-2024-095", "고객사": "LG화학",    "계획 납기": "2026-06-10", "예상 완료": "2026-06-10", "위험도": "낮음", "비고": "검사 일정 확정"},
            {"프로젝트": "PJT-2024-089", "고객사": "현대중공업", "계획 납기": "2026-06-20", "예상 완료": "2026-06-24", "위험도": "높음", "비고": "부품 조달 지연"},
            {"프로젝트": "PJT-2025-008", "고객사": "한화에어로", "계획 납기": "2026-07-01", "예상 완료": "2026-07-01", "위험도": "중간", "비고": "검사 자원 부족"},
        ])
        st.dataframe(monthly_df, use_container_width=True, height=200)

    with col_sum2:
        st.markdown("""
        <div class="info-card">
            <div style="font-size:0.9rem;font-weight:700;color:#f0f2f6;margin-bottom:12px;">📊 6월 납기 통계</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#9ba3af;font-size:0.85rem;">총 납기 건수</span>
                <span style="color:#f0f2f6;font-weight:700;">4건</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#9ba3af;font-size:0.85rem;">정상 납기 예상</span>
                <span style="color:#2ecc71;font-weight:700;">3건 (75%)</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#9ba3af;font-size:0.85rem;">지연 위험</span>
                <span style="color:#e74c3c;font-weight:700;">1건 (25%)</span>
            </div>
            <hr class="divider">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#9ba3af;font-size:0.85rem;">누적 납기준수율</span>
                <span style="color:#4f8ef7;font-weight:700;">94.5%</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
                <span style="color:#9ba3af;font-size:0.85rem;">목표 납기준수율</span>
                <span style="color:#9ba3af;font-weight:700;">95.0%</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # 납기 현황 파이 차트
        pie_fig = px.pie(
            names=["정상","지연위험","완료"],
            values=[3, 1, 2],
            color_discrete_map={"정상":"#2ecc71","지연위험":"#e74c3c","완료":"#4f8ef7"},
            hole=0.5,
            title="납기 현황 분포",
        )
        pie_fig.update_layout(
            height=220,
            paper_bgcolor="#1e2130",
            font_color="#f0f2f6",
            legend=dict(bgcolor="#1e2130"),
            margin=dict(l=10,r=10,t=40,b=10),
        )
        st.plotly_chart(pie_fig, use_container_width=True)


# ═══════════════════════════════════════════════════════════
# TAB 5 — 개인 대시보드
# ═══════════════════════════════════════════════════════════
with tab5:
    st.markdown('<div class="section-header">👤 개인 맞춤 대시보드</div>', unsafe_allow_html=True)

    # 역할 선택
    col_role, col_info = st.columns([1, 3], gap="medium")
    with col_role:
        role = st.selectbox(
            "역할 선택",
            ["PM (프로젝트 관리자)", "설계자", "생산관리자", "품질담당자", "현장작업자", "경영진"],
            index=0,
            key="role_selector",
        )
        st.markdown(f"""
        <div class="info-card" style="margin-top:10px;">
            <div style="font-size:1.8rem;text-align:center;margin-bottom:8px;">
                {"👔" if "경영진" in role else "📋" if "PM" in role else "🔧" if "생산" in role else "🔍" if "품질" in role else "👷" if "현장" in role else "📐"}
            </div>
            <div style="text-align:center;color:#f0f2f6;font-weight:700;font-size:0.9rem;">{role}</div>
            <div style="text-align:center;color:#9ba3af;font-size:0.78rem;margin-top:4px;">아코스 주식회사</div>
        </div>
        """, unsafe_allow_html=True)

    with col_info:
        # 역할별 위젯 정의
        role_widgets = {
            "PM (프로젝트 관리자)": [
                ("📋 담당 프로젝트", "3개 진행중", "#4f8ef7"),
                ("⚠ 납기 위험 프로젝트", "1건 — PJT-2024-089", "#e74c3c"),
                ("📊 이번주 마일스톤", "2건 완료 예정", "#2ecc71"),
                ("📧 미확인 이슈", "5건 대기", "#f39c12"),
            ],
            "설계자": [
                ("📐 설계 검토 요청", "3건 대기", "#4f8ef7"),
                ("🔄 변경 요청 (ECR)", "2건 진행중", "#f39c12"),
                ("✅ 완료된 도면", "12건 이번달", "#2ecc71"),
                ("💬 설계 리뷰 예정", "내일 오후 2시", "#9b59b6"),
            ],
            "생산관리자": [
                ("🏭 오늘 생산 목표", "280개 → 247개 달성", "#4f8ef7"),
                ("⚙ 설비 가동률", "87.3%", "#2ecc71"),
                ("⚠ 생산 지연 공정", "1개 — 도장 라인", "#e74c3c"),
                ("👷 배치 인원", "34명 투입중", "#f39c12"),
            ],
            "품질담당자": [
                ("🔍 오늘 검사 건수", "47건 완료", "#4f8ef7"),
                ("❌ 불량 판정", "3건", "#e74c3c"),
                ("📋 대기 검사", "8건 대기", "#f39c12"),
                ("🤖 AI 예측 경보", "2건 주의 필요", "#9b59b6"),
            ],
            "현장작업자": [
                ("📋 오늘 작업 지시", "작업지시 #W-2026-1204", "#4f8ef7"),
                ("⏱ 작업 시작", "08:30 — 진행중", "#2ecc71"),
                ("🎯 목표 수량", "45개 / 60개 완료", "#f39c12"),
                ("⚠ 이상 보고", "미보고 이상 없음", "#9ba3af"),
            ],
            "경영진": [
                ("💰 이번달 매출", "₩12.4억 (+15%)", "#2ecc71"),
                ("📊 수주 잔량", "₩47.2억", "#4f8ef7"),
                ("⚠ 경영 리스크", "1건 — 납기 지연", "#e74c3c"),
                ("📈 영업이익률", "18.3%", "#9b59b6"),
            ],
        }

        widgets = role_widgets.get(role, role_widgets["PM (프로젝트 관리자)"])
        widget_cols = st.columns(4, gap="small")
        for i, (title, value, color) in enumerate(widgets):
            with widget_cols[i % 4]:
                render_kpi_card(title, value, color=color)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── 내 할일 + 최근 활동 이력
    col_todo, col_hist = st.columns([1, 1], gap="medium")

    with col_todo:
        st.markdown('<div class="section-header">✅ 내 할일 목록</div>', unsafe_allow_html=True)

        todo_items_by_role = {
            "PM (프로젝트 관리자)": [
                ("PJT-2024-089 납기 위험 대응 계획 수립", False),
                ("주간 프로젝트 진행 보고서 작성", False),
                ("PJT-2024-091 설계 검토 회의 주관", True),
                ("고객사 현장 방문 일정 조율 (현대중공업)", False),
                ("이번달 원가 분석 보고서 검토", True),
            ],
            "설계자": [
                ("PJT-2024-089 조립 도면 Rev.3 업데이트", False),
                ("ECR-2026-047 변경 요청 검토 및 승인", False),
                ("3D 모델링 검증 — 기어 샤프트 부품", True),
                ("설계 표준 가이드 문서 업데이트", False),
                ("PJT-2025-002 기본설계 착수 회의 참석", False),
            ],
            "생산관리자": [
                ("도장 라인 생산 지연 원인 파악 및 보고", False),
                ("다음주 생산 계획 확정 및 공지", False),
                ("CNC 가공기 A2 예방정비 일정 수립", True),
                ("월간 생산 실적 보고서 작성", False),
                ("인력 배치 계획 검토 (야간 교대)", False),
            ],
            "품질담당자": [
                ("불량 원인 분석 보고서 — 치수 편차 이슈", False),
                ("AI 품질 예측 경보 2건 현장 확인", False),
                ("월간 품질 지표 보고서 제출", True),
                ("공정 품질 감사 — 용접 라인", False),
                ("고객 클레임 처리 현황 업데이트", False),
            ],
            "현장작업자": [
                ("작업지시 #W-2026-1204 완료 처리", False),
                ("설비 CNC-A1 일상 점검 체크리스트 작성", True),
                ("불량 부품 2건 품질팀 인계", False),
                ("안전 교육 이수 (화재 대응)", False),
                ("오늘 작업 일보 작성 및 제출", False),
            ],
            "경영진": [
                ("월간 경영 실적 검토 회의 주재", False),
                ("신규 수주 전략 보고서 검토", False),
                ("PJT-2024-089 납기 지연 대응 결재", False),
                ("투자 계획 검토 — 설비 자동화", True),
                ("하반기 사업 계획 수립 착수", False),
            ],
        }

        todos = todo_items_by_role.get(role, todo_items_by_role["PM (프로젝트 관리자)"])
        for i, (task, done) in enumerate(todos):
            col_chk, col_txt = st.columns([0.08, 0.92], gap="small")
            with col_chk:
                checked = st.checkbox("", value=done, key=f"todo_{i}_{role}")
            with col_txt:
                style = "color:#6b7280;text-decoration:line-through;" if checked else "color:#c9cdd6;"
                st.markdown(f'<div style="{style}font-size:0.88rem;padding-top:4px;">{task}</div>', unsafe_allow_html=True)

    with col_hist:
        st.markdown('<div class="section-header">🕐 최근 활동 이력</div>', unsafe_allow_html=True)

        activity_by_role = {
            "PM (프로젝트 관리자)": [
                ("10:32", "PJT-2024-091 마일스톤 승인 완료", "✅"),
                ("09:15", "PJT-2024-089 납기 위험 알림 수신", "⚠"),
                ("어제 17:40", "주간 프로젝트 보고서 제출", "📄"),
                ("어제 14:22", "현대중공업 미팅 메모 등록", "💬"),
                ("어제 09:00", "이번주 작업 지시 확인 및 배포", "📋"),
            ],
            "설계자": [
                ("10:45", "도면 #DWG-2026-0891 업로드 완료", "📐"),
                ("09:30", "ECR-2026-047 검토 의견 작성", "📝"),
                ("어제 16:10", "3D 모델 검증 완료 — 샤프트", "✅"),
                ("어제 11:30", "설계 회의 참석 (PJT-2024-089)", "💬"),
                ("어제 09:00", "업무 시작 — 도면 Rev 확인", "🔑"),
            ],
            "생산관리자": [
                ("10:20", "오늘 생산 현황 보고서 제출", "📊"),
                ("09:05", "도장 라인 정지 알림 수신", "⚠"),
                ("어제 17:00", "내일 생산 계획 확정", "📋"),
                ("어제 14:30", "CNC 가공기 A2 점검 지시", "🔧"),
                ("어제 08:30", "교대 인수인계 완료", "🔄"),
            ],
            "품질담당자": [
                ("10:55", "검사 #INS-2026-0341 합격 처리", "✅"),
                ("10:10", "AI 품질 경보 현장 확인 완료", "🤖"),
                ("어제 16:45", "불량 보고서 작성 제출", "📝"),
                ("어제 13:20", "용접 라인 품질 감사 실시", "🔍"),
                ("어제 09:30", "검사 일정 확인 및 배분", "📋"),
            ],
            "현장작업자": [
                ("10:48", "부품 15개 가공 완료 보고", "✅"),
                ("09:12", "작업지시 수령 및 확인", "📋"),
                ("어제 17:30", "일일 작업 일보 제출", "📝"),
                ("어제 15:00", "불량 부품 1건 품질팀 인계", "⚠"),
                ("어제 08:30", "설비 점검 체크리스트 완료", "🔧"),
            ],
            "경영진": [
                ("10:00", "월간 실적 보고서 수신 및 검토", "📊"),
                ("09:30", "PJT-2024-089 납기 위험 보고 수신", "⚠"),
                ("어제 18:00", "이사회 자료 최종 검토", "💼"),
                ("어제 15:00", "하반기 사업 계획 킥오프", "🚀"),
                ("어제 10:30", "수주 현황 보고서 검토", "📋"),
            ],
        }

        activities = activity_by_role.get(role, activity_by_role["PM (프로젝트 관리자)"])
        for time_str, desc, icon in activities:
            st.markdown(f"""
            <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #2d3348;">
                <span style="font-size:1.2rem;min-width:24px;">{icon}</span>
                <div style="flex:1;">
                    <div style="color:#c9cdd6;font-size:0.85rem;">{desc}</div>
                    <div style="color:#6b7280;font-size:0.72rem;margin-top:2px;">{time_str}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── 개인 성과 요약
    st.markdown('<div class="section-header">📈 이번달 개인 성과 요약</div>', unsafe_allow_html=True)
    perf_cols = st.columns(4, gap="small")
    perf_data_by_role = {
        "PM (프로젝트 관리자)": [
            ("완료 마일스톤", "14건", "+2", "#2ecc71"),
            ("이슈 해결", "28건", "+5", "#4f8ef7"),
            ("문서 작성", "9건", "±0", "#9ba3af"),
            ("고객 미팅", "6회", "+1", "#f39c12"),
        ],
        "설계자": [
            ("완료 도면", "31건", "+4", "#2ecc71"),
            ("ECR 처리", "8건", "+1", "#4f8ef7"),
            ("설계 검토", "12건", "+3", "#9b59b6"),
            ("표준화 작업", "3건", "±0", "#f39c12"),
        ],
        "생산관리자": [
            ("생산 달성률", "94.2%", "+1.8%", "#2ecc71"),
            ("불량 감소", "21건", "-5건", "#4f8ef7"),
            ("설비 가동률", "87.3%", "+0.5%", "#9b59b6"),
            ("납기 준수", "3/3건", "±0", "#f39c12"),
        ],
        "품질담당자": [
            ("검사 완료", "284건", "+12", "#2ecc71"),
            ("불량 검출", "73건", "-8건", "#4f8ef7"),
            ("1차 합격률", "96.7%", "+1.2%", "#2ecc71"),
            ("클레임 처리", "2건", "-1건", "#f39c12"),
        ],
        "현장작업자": [
            ("생산 수량", "1,243개", "+87", "#2ecc71"),
            ("품질 합격률", "98.1%", "+0.3%", "#4f8ef7"),
            ("안전 무사고", "22일째", "연속", "#9b59b6"),
            ("교육 이수", "2건", "+1", "#f39c12"),
        ],
        "경영진": [
            ("매출 달성률", "103.2%", "+3.2%", "#2ecc71"),
            ("수주 건수", "3건", "+1", "#4f8ef7"),
            ("승인 결재", "18건", "±0", "#9ba3af"),
            ("외부 미팅", "7회", "+2", "#f39c12"),
        ],
    }
    perfs = perf_data_by_role.get(role, perf_data_by_role["PM (프로젝트 관리자)"])
    for i, (title, value, delta, color) in enumerate(perfs):
        with perf_cols[i]:
            render_kpi_card(title, value, delta=delta, color=color)
