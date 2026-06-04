import streamlit as st

st.set_page_config(
    page_title="Akos AI MES",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
/* ── Global / body ── */
html, body, [data-testid="stAppViewContainer"] {
    background-color: #1e2130;
    color: #f0f2f6;
}
[data-testid="stMain"] {
    background-color: #1e2130;
}

/* ── Sidebar ── */
[data-testid="stSidebar"] {
    background-color: #161928;
    border-right: 1px solid #2e3450;
}
[data-testid="stSidebar"] * {
    color: #c8cfe8 !important;
}
[data-testid="stSidebar"] .stSelectbox label,
[data-testid="stSidebar"] .stRadio label {
    color: #a0aacb !important;
}
[data-testid="stSidebarNav"] a {
    color: #c8cfe8 !important;
    border-radius: 6px;
    padding: 4px 8px;
}
[data-testid="stSidebarNav"] a:hover {
    background-color: #2e3450 !important;
    color: #ffffff !important;
}
[data-testid="stSidebarNav"] a[aria-current="page"] {
    background-color: #3d5af1 !important;
    color: #ffffff !important;
}

/* ── Module cards ── */
.module-card {
    background-color: #252a3d;
    border: 1px solid #2e3450;
    border-radius: 10px;
    padding: 20px 18px 16px 18px;
    margin-bottom: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
    min-height: 140px;
}
.module-card:hover {
    border-color: #3d5af1;
    box-shadow: 0 4px 16px rgba(61, 90, 241, 0.18);
}
.module-card .card-icon {
    font-size: 2.0rem;
    line-height: 1;
    margin-bottom: 8px;
}
.module-card .card-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #e8ecff;
    margin-bottom: 5px;
}
.module-card .card-desc {
    font-size: 0.78rem;
    color: #8a94b8;
    line-height: 1.5;
}

/* ── Status bar ── */
.status-bar {
    background-color: #1a1f33;
    border: 1px solid #2e3450;
    border-radius: 8px;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    gap: 32px;
    flex-wrap: wrap;
    margin-bottom: 18px;
}
.status-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.82rem;
    color: #a0aacb;
}
.status-dot-green {
    width: 9px; height: 9px;
    background: #22c55e;
    border-radius: 50%;
    box-shadow: 0 0 6px #22c55e88;
    display: inline-block;
}
.status-label {
    color: #c8cfe8;
    font-weight: 600;
}

/* ── Quick links ── */
.quick-link {
    background-color: #252a3d;
    border: 1px solid #2e3450;
    border-radius: 7px;
    padding: 9px 14px;
    margin-bottom: 8px;
    font-size: 0.83rem;
    color: #8ecbff;
    display: flex;
    align-items: center;
    gap: 8px;
}
.quick-link:hover {
    border-color: #3d5af1;
    color: #ffffff;
}

/* ── Section header ── */
.section-header {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5a6380;
    margin: 22px 0 10px 0;
}

/* ── Hero header ── */
.hero-title {
    font-size: 2.4rem;
    font-weight: 800;
    color: #e8ecff;
    line-height: 1.15;
    margin-bottom: 4px;
}
.hero-subtitle {
    font-size: 1.1rem;
    color: #8a94b8;
    margin-bottom: 28px;
}
.hero-badge {
    display: inline-block;
    background: linear-gradient(90deg, #3d5af1 0%, #6b82f6 100%);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 12px;
}

/* ── Divider ── */
hr.custom-hr {
    border: none;
    border-top: 1px solid #2e3450;
    margin: 18px 0;
}
</style>
""", unsafe_allow_html=True)

# ── Hero Section ───────────────────────────────────────────────────────────────
st.markdown("""
<div style="padding: 8px 0 0 0;">
    <div class="hero-badge">AI POWERED MES v1.0</div>
    <div class="hero-title">🏭 Akos AI MES</div>
    <div class="hero-subtitle">AI 특화 스마트공장 제조실행시스템 &nbsp;|&nbsp; 주식회사 아코스</div>
</div>
""", unsafe_allow_html=True)

# ── System Status Bar ──────────────────────────────────────────────────────────
st.markdown("""
<div class="status-bar">
    <div class="status-item">
        <span class="status-dot-green"></span>
        <span class="status-label">API 연결상태</span>
        <span style="color:#22c55e; font-weight:600;">정상</span>
    </div>
    <div class="status-item">
        <span class="status-dot-green"></span>
        <span class="status-label">DB 상태</span>
        <span style="color:#22c55e; font-weight:600;">연결됨</span>
    </div>
    <div class="status-item">
        <span class="status-dot-green"></span>
        <span class="status-label">AI 모델 상태</span>
        <span style="color:#22c55e; font-weight:600;">Claude Sonnet 4.6 활성</span>
    </div>
    <div class="status-item" style="margin-left:auto; color:#5a6380;">
        2026-06-04 &nbsp;|&nbsp; 오전 세션
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown('<hr class="custom-hr">', unsafe_allow_html=True)

# ── Module Cards ───────────────────────────────────────────────────────────────
st.markdown('<div class="section-header">모듈 바로가기</div>', unsafe_allow_html=True)

MODULES = [
    {
        "icon": "🏢",
        "title": "대시보드",
        "desc": "경영진 KPI · 생산현황 실시간 모니터링 · 품질지표 · 납기 달성률",
    },
    {
        "icon": "📐",
        "title": "설계 / BOM",
        "desc": "BOM 관리 · 부품 마스터 · 도면 연동 · ECR(설계변경요청)",
    },
    {
        "icon": "⚙️",
        "title": "생산관리",
        "desc": "생산계획 수립 · 공정 현황 추적 · 재고 관리 · OEE 분석",
    },
    {
        "icon": "🔬",
        "title": "FAT 관리",
        "desc": "FAT 계획 · 체크리스트 실행 · AI 결함분석 · 검사 리포트",
    },
    {
        "icon": "🚛",
        "title": "납품 / SAT",
        "desc": "납품 계획 · 출하 처리 · 현장 SAT · A/S 이력 관리",
    },
    {
        "icon": "🤖",
        "title": "AI 허브",
        "desc": "AI 채팅 어시스턴트 · 예측 AI · 견적 자동화 AI · RAG 지식검색",
    },
    {
        "icon": "💰",
        "title": "원가 / 견적",
        "desc": "견적 관리 · 원가 분석 · 수주 현황 · 재무 리포트",
    },
    {
        "icon": "👨‍💼",
        "title": "관리자",
        "desc": "사용자 관리 · 권한 설정 · 코드 관리 · 감사 로그",
    },
]

def render_card(mod: dict) -> str:
    return f"""
<div class="module-card">
    <div class="card-icon">{mod['icon']}</div>
    <div class="card-title">{mod['title']}</div>
    <div class="card-desc">{mod['desc']}</div>
</div>
"""

# 2 × 4 grid
rows = [MODULES[i:i+4] for i in range(0, len(MODULES), 4)]
for row in rows:
    cols = st.columns(4, gap="medium")
    for col, mod in zip(cols, row):
        with col:
            st.markdown(render_card(mod), unsafe_allow_html=True)

st.markdown('<hr class="custom-hr">', unsafe_allow_html=True)

# ── Quick Links ────────────────────────────────────────────────────────────────
col_left, col_right = st.columns([1, 2], gap="large")

with col_left:
    st.markdown('<div class="section-header">최근 방문 페이지</div>', unsafe_allow_html=True)
    recent_pages = [
        ("📊", "대시보드 — 생산현황 개요"),
        ("🔬", "FAT 관리 — 체크리스트 #FA-2024-031"),
        ("🤖", "AI 허브 — 견적 자동화 AI"),
    ]
    for icon, label in recent_pages:
        st.markdown(
            f'<div class="quick-link">{icon}&nbsp;&nbsp;{label}</div>',
            unsafe_allow_html=True,
        )

with col_right:
    st.markdown('<div class="section-header">시스템 공지</div>', unsafe_allow_html=True)
    st.markdown("""
<div style="background:#252a3d; border:1px solid #2e3450; border-radius:8px; padding:14px 18px; font-size:0.83rem; color:#8a94b8; line-height:1.8;">
    <span style="color:#f0c674; font-weight:700;">📢 공지</span>&nbsp;&nbsp;
    AI MES 시스템이 초기화되었습니다. 왼쪽 사이드바에서 원하는 모듈을 선택하거나
    위 카드를 통해 바로 이동하세요.<br>
    <span style="color:#5a6380; font-size:0.76rem;">2026-06-04 &nbsp;·&nbsp; 시스템 관리자</span>
</div>
""", unsafe_allow_html=True)

# ── Footer ─────────────────────────────────────────────────────────────────────
st.markdown("""
<hr class="custom-hr">
<div style="text-align:center; color:#3a4060; font-size:0.75rem; padding: 6px 0 12px 0;">
    Akos AI MES &nbsp;|&nbsp; 주식회사 아코스 &nbsp;|&nbsp; Powered by Claude AI &nbsp;·&nbsp; © 2026
</div>
""", unsafe_allow_html=True)
