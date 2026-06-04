"""
shared_styles.py
Akos AI MES - 공유 스타일 및 유틸리티 모듈
모든 8개 메뉴 페이지에서 사용하는 공통 CSS, 헬퍼 함수, 유틸리티
"""

import streamlit as st
from datetime import datetime, date
from typing import Optional

# ─────────────────────────────────────────────
# 테마 색상 팔레트
# ─────────────────────────────────────────────
COLORS = {
    "bg": "#1e2130",           # 메인 배경
    "card": "#252a3d",         # 카드 배경
    "card_hover": "#2d3352",   # 카드 호버
    "sidebar": "#191d2e",      # 사이드바 배경
    "accent": "#4f8ef7",       # 주 강조색 (파란색)
    "accent_dark": "#3a72d4",  # 강조색 어두운 버전
    "success": "#2ecc71",      # 성공 / 정상
    "warning": "#f39c12",      # 경고
    "error": "#e74c3c",        # 오류 / 긴급
    "info": "#3498db",         # 정보
    "text_primary": "#e8eaf0", # 기본 텍스트
    "text_secondary": "#9aa3b8",# 보조 텍스트
    "text_muted": "#6b7590",   # 흐린 텍스트
    "border": "#333a52",       # 테두리
    "border_light": "#3d4566", # 밝은 테두리
    "purple": "#9b59b6",       # 보라
    "teal": "#1abc9c",         # 청록
    "orange": "#e67e22",       # 주황
}

# ─────────────────────────────────────────────
# 전역 CSS 주입
# ─────────────────────────────────────────────
def inject_global_css() -> None:
    """
    다크 테마 전역 CSS를 Streamlit 앱에 주입합니다.
    사이드바, 헤더, 상태 배지, 버튼 스타일 포함.
    """
    css = f"""
    <style>
    /* ── 구글 폰트 ── */
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

    /* ── 전체 앱 배경 ── */
    .stApp {{
        background-color: {COLORS['bg']};
        color: {COLORS['text_primary']};
        font-family: 'Noto Sans KR', 'Inter', sans-serif;
    }}

    /* ── 메인 컨테이너 ── */
    .main .block-container {{
        background-color: {COLORS['bg']};
        padding: 1.5rem 2rem;
        max-width: 1400px;
    }}

    /* ── 사이드바 ── */
    [data-testid="stSidebar"] {{
        background-color: {COLORS['sidebar']};
        border-right: 1px solid {COLORS['border']};
    }}

    [data-testid="stSidebar"] .stMarkdown,
    [data-testid="stSidebar"] p,
    [data-testid="stSidebar"] label {{
        color: {COLORS['text_primary']};
    }}

    [data-testid="stSidebar"] .stSelectbox label,
    [data-testid="stSidebar"] .stRadio label {{
        color: {COLORS['text_secondary']};
        font-size: 0.85rem;
    }}

    /* ── 사이드바 라디오/셀렉트 메뉴 항목 ── */
    [data-testid="stSidebar"] [data-testid="stRadio"] div[role="radiogroup"] label {{
        background-color: transparent;
        border-radius: 6px;
        padding: 0.4rem 0.6rem;
        transition: background 0.2s;
        color: {COLORS['text_secondary']};
        font-size: 0.9rem;
    }}

    [data-testid="stSidebar"] [data-testid="stRadio"] div[role="radiogroup"] label:hover {{
        background-color: {COLORS['card']};
        color: {COLORS['text_primary']};
    }}

    /* ── 카드 컴포넌트 ── */
    .mes-card {{
        background-color: {COLORS['card']};
        border: 1px solid {COLORS['border']};
        border-radius: 12px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1rem;
        transition: box-shadow 0.2s, border-color 0.2s;
    }}

    .mes-card:hover {{
        border-color: {COLORS['border_light']};
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }}

    .mes-card-title {{
        font-size: 1rem;
        font-weight: 600;
        color: {COLORS['text_primary']};
        margin-bottom: 0.5rem;
    }}

    .mes-card-subtitle {{
        font-size: 0.82rem;
        color: {COLORS['text_secondary']};
    }}

    /* ── 페이지 헤더 ── */
    .mes-page-header {{
        background: linear-gradient(135deg, {COLORS['card']} 0%, #2a3050 100%);
        border: 1px solid {COLORS['border']};
        border-radius: 14px;
        padding: 1.5rem 2rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }}

    .mes-page-header-icon {{
        font-size: 2.2rem;
        line-height: 1;
    }}

    .mes-page-header-title {{
        font-size: 1.6rem;
        font-weight: 700;
        color: {COLORS['text_primary']};
        margin: 0;
        line-height: 1.2;
    }}

    .mes-page-header-subtitle {{
        font-size: 0.88rem;
        color: {COLORS['text_secondary']};
        margin: 0.25rem 0 0 0;
    }}

    /* ── 상태 배지 ── */
    .mes-badge {{
        display: inline-block;
        padding: 0.2rem 0.65rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        line-height: 1.6;
        white-space: nowrap;
    }}

    .mes-badge-success {{
        background-color: rgba(46, 204, 113, 0.15);
        color: {COLORS['success']};
        border: 1px solid rgba(46, 204, 113, 0.3);
    }}

    .mes-badge-warning {{
        background-color: rgba(243, 156, 18, 0.15);
        color: {COLORS['warning']};
        border: 1px solid rgba(243, 156, 18, 0.3);
    }}

    .mes-badge-error {{
        background-color: rgba(231, 76, 60, 0.15);
        color: {COLORS['error']};
        border: 1px solid rgba(231, 76, 60, 0.3);
    }}

    .mes-badge-info {{
        background-color: rgba(79, 142, 247, 0.15);
        color: {COLORS['accent']};
        border: 1px solid rgba(79, 142, 247, 0.3);
    }}

    .mes-badge-neutral {{
        background-color: rgba(155, 164, 184, 0.15);
        color: {COLORS['text_secondary']};
        border: 1px solid rgba(155, 164, 184, 0.3);
    }}

    .mes-badge-purple {{
        background-color: rgba(155, 89, 182, 0.15);
        color: {COLORS['purple']};
        border: 1px solid rgba(155, 89, 182, 0.3);
    }}

    /* ── 버튼 오버라이드 ── */
    .stButton > button {{
        background-color: {COLORS['accent']};
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 0.45rem 1.2rem;
        font-size: 0.88rem;
        font-weight: 500;
        transition: background 0.2s, transform 0.1s;
        font-family: 'Noto Sans KR', sans-serif;
    }}

    .stButton > button:hover {{
        background-color: {COLORS['accent_dark']};
        transform: translateY(-1px);
    }}

    .stButton > button:active {{
        transform: translateY(0);
    }}

    /* ── 보조 버튼 (secondary) ── */
    .stButton > button[kind="secondary"] {{
        background-color: {COLORS['card']};
        color: {COLORS['text_primary']};
        border: 1px solid {COLORS['border_light']};
    }}

    .stButton > button[kind="secondary"]:hover {{
        background-color: {COLORS['card_hover']};
        border-color: {COLORS['accent']};
    }}

    /* ── 인풋 필드 ── */
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea,
    .stSelectbox > div > div,
    .stNumberInput > div > div > input {{
        background-color: {COLORS['card']};
        color: {COLORS['text_primary']};
        border: 1px solid {COLORS['border']};
        border-radius: 8px;
        font-family: 'Noto Sans KR', sans-serif;
    }}

    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {{
        border-color: {COLORS['accent']};
        box-shadow: 0 0 0 2px rgba(79, 142, 247, 0.2);
    }}

    /* ── 데이터프레임 / 테이블 ── */
    .stDataFrame {{
        border: 1px solid {COLORS['border']};
        border-radius: 10px;
        overflow: hidden;
    }}

    /* ── 탭 ── */
    .stTabs [data-baseweb="tab-list"] {{
        background-color: {COLORS['card']};
        border-radius: 10px 10px 0 0;
        border-bottom: 1px solid {COLORS['border']};
        gap: 0;
    }}

    .stTabs [data-baseweb="tab"] {{
        color: {COLORS['text_secondary']};
        font-size: 0.88rem;
        font-weight: 500;
        padding: 0.6rem 1.2rem;
        border-bottom: 2px solid transparent;
    }}

    .stTabs [aria-selected="true"] {{
        color: {COLORS['accent']};
        border-bottom-color: {COLORS['accent']};
        background-color: transparent;
    }}

    /* ── 메트릭 카드 ── */
    [data-testid="stMetric"] {{
        background-color: {COLORS['card']};
        border: 1px solid {COLORS['border']};
        border-radius: 10px;
        padding: 1rem;
    }}

    [data-testid="stMetricLabel"] {{
        color: {COLORS['text_secondary']};
        font-size: 0.82rem;
    }}

    [data-testid="stMetricValue"] {{
        color: {COLORS['text_primary']};
        font-size: 1.6rem;
        font-weight: 700;
    }}

    /* ── 진행률 바 ── */
    .stProgress > div > div > div {{
        background-color: {COLORS['accent']};
        border-radius: 4px;
    }}

    /* ── 알림/익스팬더 ── */
    .stExpander {{
        background-color: {COLORS['card']};
        border: 1px solid {COLORS['border']};
        border-radius: 10px;
    }}

    /* ── 구분선 ── */
    hr {{
        border-color: {COLORS['border']};
        margin: 1rem 0;
    }}

    /* ── 스크롤바 ── */
    ::-webkit-scrollbar {{
        width: 6px;
        height: 6px;
    }}

    ::-webkit-scrollbar-track {{
        background: {COLORS['bg']};
    }}

    ::-webkit-scrollbar-thumb {{
        background: {COLORS['border_light']};
        border-radius: 3px;
    }}

    ::-webkit-scrollbar-thumb:hover {{
        background: {COLORS['text_muted']};
    }}

    /* ── 빈 상태 컴포넌트 ── */
    .mes-empty-state {{
        text-align: center;
        padding: 3rem 1rem;
        color: {COLORS['text_muted']};
    }}

    .mes-empty-state-icon {{
        font-size: 3.5rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }}

    .mes-empty-state-title {{
        font-size: 1rem;
        font-weight: 600;
        color: {COLORS['text_secondary']};
        margin-bottom: 0.4rem;
    }}

    .mes-empty-state-desc {{
        font-size: 0.85rem;
        color: {COLORS['text_muted']};
    }}

    /* ── 테이블 행 호버 ── */
    .mes-table-row {{
        display: flex;
        align-items: center;
        padding: 0.65rem 1rem;
        border-bottom: 1px solid {COLORS['border']};
        transition: background 0.15s;
        font-size: 0.88rem;
    }}

    .mes-table-row:hover {{
        background-color: rgba(79, 142, 247, 0.05);
    }}

    .mes-table-header {{
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border-bottom: 2px solid {COLORS['border_light']};
        font-size: 0.78rem;
        font-weight: 600;
        color: {COLORS['text_muted']};
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }}

    /* ── 알림 박스 ── */
    .mes-alert {{
        border-radius: 8px;
        padding: 0.75rem 1rem;
        margin-bottom: 0.75rem;
        font-size: 0.88rem;
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
    }}

    .mes-alert-success {{
        background-color: rgba(46, 204, 113, 0.1);
        border: 1px solid rgba(46, 204, 113, 0.3);
        color: {COLORS['success']};
    }}

    .mes-alert-warning {{
        background-color: rgba(243, 156, 18, 0.1);
        border: 1px solid rgba(243, 156, 18, 0.3);
        color: {COLORS['warning']};
    }}

    .mes-alert-error {{
        background-color: rgba(231, 76, 60, 0.1);
        border: 1px solid rgba(231, 76, 60, 0.3);
        color: {COLORS['error']};
    }}

    .mes-alert-info {{
        background-color: rgba(79, 142, 247, 0.1);
        border: 1px solid rgba(79, 142, 247, 0.3);
        color: {COLORS['accent']};
    }}
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)


# ─────────────────────────────────────────────
# 페이지 헤더 렌더링
# ─────────────────────────────────────────────
def page_header(title: str, subtitle: str = "", icon: str = "🏭") -> None:
    """
    스타일된 페이지 헤더를 렌더링합니다.

    Args:
        title: 페이지 제목 (한국어)
        subtitle: 부제목 또는 설명 문구
        icon: 헤더 아이콘 이모지
    """
    subtitle_html = f'<p class="mes-page-header-subtitle">{subtitle}</p>' if subtitle else ""
    html = f"""
    <div class="mes-page-header">
        <div class="mes-page-header-icon">{icon}</div>
        <div>
            <h1 class="mes-page-header-title">{title}</h1>
            {subtitle_html}
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


# ─────────────────────────────────────────────
# 상태 배지 HTML 반환
# ─────────────────────────────────────────────
def status_badge_html(status: str, color: str = "info") -> str:
    """
    인라인 상태 배지 HTML 문자열을 반환합니다.

    Args:
        status: 배지에 표시할 텍스트 (예: "진행중", "완료", "지연")
        color: 배지 색상 키 — "success" | "warning" | "error" | "info" | "neutral" | "purple"

    Returns:
        HTML 문자열 (st.markdown(..., unsafe_allow_html=True)로 렌더링)
    """
    valid_colors = {"success", "warning", "error", "info", "neutral", "purple"}
    css_class = f"mes-badge mes-badge-{color}" if color in valid_colors else "mes-badge mes-badge-neutral"
    return f'<span class="{css_class}">{status}</span>'


# ─────────────────────────────────────────────
# 날짜 포맷 유틸리티
# ─────────────────────────────────────────────
def format_date(d, fmt: str = "%Y-%m-%d") -> str:
    """
    날짜 값을 지정된 포맷 문자열로 변환합니다.

    Args:
        d: datetime, date, 또는 ISO 형식 날짜 문자열
        fmt: strftime 포맷 (기본값: "%Y-%m-%d")

    Returns:
        포맷된 날짜 문자열. 변환 실패 시 원본 문자열 반환.
    """
    if d is None:
        return "-"
    if isinstance(d, datetime):
        return d.strftime(fmt)
    if isinstance(d, date):
        return datetime(d.year, d.month, d.day).strftime(fmt)
    if isinstance(d, str):
        d_str = d.strip()
        if not d_str:
            return "-"
        for parse_fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y%m%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
            try:
                return datetime.strptime(d_str, parse_fmt).strftime(fmt)
            except ValueError:
                continue
        return d_str  # 파싱 실패 시 원본 반환
    return str(d)


# ─────────────────────────────────────────────
# 빈 상태 렌더링
# ─────────────────────────────────────────────
def render_empty_state(message: str, description: str = "", icon: str = "📭") -> None:
    """
    데이터가 없을 때 표시할 빈 상태 UI를 렌더링합니다.

    Args:
        message: 주 메시지 (예: "등록된 작업 지시가 없습니다")
        description: 보조 설명 문구
        icon: 표시할 이모지 아이콘
    """
    desc_html = f'<p class="mes-empty-state-desc">{description}</p>' if description else ""
    html = f"""
    <div class="mes-empty-state">
        <div class="mes-empty-state-icon">{icon}</div>
        <div class="mes-empty-state-title">{message}</div>
        {desc_html}
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


# ─────────────────────────────────────────────
# 목업 데이터: 프로젝트 목록
# ─────────────────────────────────────────────
def mock_projects() -> list[dict]:
    """
    8개의 실제적인 한국 MES 제조 프로젝트 딕셔너리 목록을 반환합니다.

    각 프로젝트 딕셔너리 키:
        id, name, code, product_type, customer, status,
        start_date, end_date, progress, manager, priority,
        quantity, unit, notes
    """
    return [
        {
            "id": "PRJ-2024-001",
            "name": "스마트 모터 컨트롤러 양산",
            "code": "SMC-2024-A1",
            "product_type": "전장 부품",
            "customer": "(주)현대모비스",
            "status": "진행중",
            "status_color": "info",
            "start_date": "2024-03-01",
            "end_date": "2024-09-30",
            "progress": 62,
            "manager": "김민준",
            "priority": "높음",
            "quantity": 50000,
            "unit": "EA",
            "notes": "월 5,000EA 생산 목표. 품질 검사 강화 요청.",
        },
        {
            "id": "PRJ-2024-002",
            "name": "EV 배터리 팩 조립 라인 구축",
            "code": "EVB-2024-B2",
            "product_type": "배터리 모듈",
            "customer": "(주)삼성SDI",
            "status": "계획",
            "status_color": "neutral",
            "start_date": "2024-07-01",
            "end_date": "2025-03-31",
            "progress": 8,
            "manager": "이수연",
            "priority": "긴급",
            "quantity": 12000,
            "unit": "SET",
            "notes": "신규 라인 설비 발주 완료. 시운전 일정 조율 중.",
        },
        {
            "id": "PRJ-2024-003",
            "name": "정밀 기어박스 소량 다품종",
            "code": "PGB-2024-C3",
            "product_type": "기계 부품",
            "customer": "(주)두산인프라코어",
            "status": "완료",
            "status_color": "success",
            "start_date": "2024-01-15",
            "end_date": "2024-05-31",
            "progress": 100,
            "manager": "박재현",
            "priority": "보통",
            "quantity": 2400,
            "unit": "EA",
            "notes": "납품 완료. 고객 만족도 98점 달성.",
        },
        {
            "id": "PRJ-2024-004",
            "name": "의료기기 하우징 사출 성형",
            "code": "MED-2024-D4",
            "product_type": "의료 부품",
            "customer": "메디텍코리아(주)",
            "status": "지연",
            "status_color": "warning",
            "start_date": "2024-04-01",
            "end_date": "2024-08-15",
            "progress": 45,
            "manager": "최영희",
            "priority": "높음",
            "quantity": 8000,
            "unit": "EA",
            "notes": "원자재 수급 지연으로 일정 3주 초과. 대응책 수립 중.",
        },
        {
            "id": "PRJ-2024-005",
            "name": "반도체 클린룸 장비 프레임",
            "code": "SCF-2024-E5",
            "product_type": "반도체 장비",
            "customer": "(주)한미반도체",
            "status": "진행중",
            "status_color": "info",
            "start_date": "2024-05-20",
            "end_date": "2024-11-20",
            "progress": 38,
            "manager": "정동욱",
            "priority": "긴급",
            "quantity": 36,
            "unit": "SET",
            "notes": "클린룸 등급 ISO Class 5 준수 필수.",
        },
        {
            "id": "PRJ-2024-006",
            "name": "항공 브래킷 CNC 가공",
            "code": "ABR-2024-F6",
            "product_type": "항공 부품",
            "customer": "한국항공우주산업(주)",
            "status": "검토",
            "status_color": "purple",
            "start_date": "2024-09-01",
            "end_date": "2025-06-30",
            "progress": 5,
            "manager": "윤서진",
            "priority": "보통",
            "quantity": 600,
            "unit": "EA",
            "notes": "AS9100D 인증 요구. 도면 검토 단계.",
        },
        {
            "id": "PRJ-2024-007",
            "name": "로봇 관절 모듈 시제품",
            "code": "RJM-2024-G7",
            "product_type": "로봇 부품",
            "customer": "(주)레인보우로보틱스",
            "status": "진행중",
            "status_color": "info",
            "start_date": "2024-06-01",
            "end_date": "2024-10-31",
            "progress": 71,
            "manager": "강하은",
            "priority": "높음",
            "quantity": 20,
            "unit": "SET",
            "notes": "시제품 3차 제작 중. 토크 테스트 통과.",
        },
        {
            "id": "PRJ-2024-008",
            "name": "태양광 마운팅 시스템 대량 생산",
            "code": "SLM-2024-H8",
            "product_type": "에너지 부품",
            "customer": "한화솔루션(주)",
            "status": "완료",
            "status_color": "success",
            "start_date": "2024-02-01",
            "end_date": "2024-06-30",
            "progress": 100,
            "manager": "임태양",
            "priority": "보통",
            "quantity": 150000,
            "unit": "EA",
            "notes": "전량 납품 완료. 재발주 계약 협의 중.",
        },
    ]


# ─────────────────────────────────────────────
# 목업 데이터: BOM 항목
# ─────────────────────────────────────────────
def mock_bom_items(project_id: str) -> list[dict]:
    """
    주어진 프로젝트 ID에 대한 BOM(Bill of Materials) 항목 목록을 반환합니다.

    Args:
        project_id: 프로젝트 식별자 (예: "PRJ-2024-001")

    Returns:
        BOM 딕셔너리 목록. 각 항목 키:
            bom_id, part_no, part_name, specification,
            quantity, unit, unit_cost, total_cost,
            supplier, lead_time_days, stock_qty, status
    """
    # 프로젝트별 특화 BOM 데이터
    bom_data = {
        "PRJ-2024-001": [
            {
                "bom_id": "BOM-001-01",
                "part_no": "MCU-STM32F4-001",
                "part_name": "STM32F4 마이크로컨트롤러",
                "specification": "STM32F407VGT6, LQFP-100",
                "quantity": 1,
                "unit": "EA",
                "unit_cost": 4200,
                "total_cost": 4200,
                "supplier": "(주)ST코리아",
                "lead_time_days": 14,
                "stock_qty": 5200,
                "status": "정상",
            },
            {
                "bom_id": "BOM-001-02",
                "part_name": "MOSFET 게이트 드라이버",
                "part_no": "DRV-IR2110-002",
                "specification": "IR2110, 600V, DIP-14",
                "quantity": 4,
                "unit": "EA",
                "unit_cost": 1800,
                "total_cost": 7200,
                "supplier": "인피니언코리아",
                "lead_time_days": 21,
                "stock_qty": 18500,
                "status": "정상",
            },
            {
                "bom_id": "BOM-001-03",
                "part_no": "CAP-ELE-470U-003",
                "part_name": "전해 커패시터",
                "specification": "470μF / 50V, Ø12.5×20mm",
                "quantity": 8,
                "unit": "EA",
                "unit_cost": 350,
                "total_cost": 2800,
                "supplier": "삼영전자(주)",
                "lead_time_days": 7,
                "stock_qty": 42000,
                "status": "정상",
            },
            {
                "bom_id": "BOM-001-04",
                "part_no": "PCB-SMC-REV3-004",
                "part_name": "메인 PCB 기판",
                "specification": "4레이어, FR4, 120×80mm, 1.6T",
                "quantity": 1,
                "unit": "EA",
                "unit_cost": 3500,
                "total_cost": 3500,
                "supplier": "(주)코리아서킷",
                "lead_time_days": 10,
                "stock_qty": 3200,
                "status": "부족",
            },
            {
                "bom_id": "BOM-001-05",
                "part_no": "HSG-ALU-SMC-005",
                "part_name": "알루미늄 하우징",
                "specification": "ADC12 다이캐스팅, 흑색 아노다이징",
                "quantity": 1,
                "unit": "EA",
                "unit_cost": 8900,
                "total_cost": 8900,
                "supplier": "정밀금형(주)",
                "lead_time_days": 30,
                "stock_qty": 4800,
                "status": "정상",
            },
        ],
        "PRJ-2024-002": [
            {
                "bom_id": "BOM-002-01",
                "part_no": "CEL-LFP-100AH-001",
                "part_name": "LFP 배터리 셀",
                "specification": "리튬인산철, 100Ah, 3.2V",
                "quantity": 16,
                "unit": "EA",
                "unit_cost": 85000,
                "total_cost": 1360000,
                "supplier": "(주)에코프로BM",
                "lead_time_days": 45,
                "stock_qty": 2400,
                "status": "정상",
            },
            {
                "bom_id": "BOM-002-02",
                "part_no": "BMS-16S-200A-002",
                "part_name": "배터리 관리 시스템(BMS)",
                "specification": "16S, ±200A, CAN통신, IP67",
                "quantity": 1,
                "unit": "EA",
                "unit_cost": 320000,
                "total_cost": 320000,
                "supplier": "엘에스일렉트릭(주)",
                "lead_time_days": 28,
                "stock_qty": 580,
                "status": "발주중",
            },
            {
                "bom_id": "BOM-002-03",
                "part_no": "ENC-SS304-BAT-003",
                "part_name": "배터리 팩 인클로저",
                "specification": "SUS304, 600×400×250mm, IP65",
                "quantity": 1,
                "unit": "SET",
                "unit_cost": 145000,
                "total_cost": 145000,
                "supplier": "(주)성광금속",
                "lead_time_days": 21,
                "stock_qty": 320,
                "status": "정상",
            },
            {
                "bom_id": "BOM-002-04",
                "part_no": "CON-XT90-004",
                "part_name": "고전류 커넥터 XT90",
                "specification": "XT90-H, 90A, 60V, 금도금",
                "quantity": 4,
                "unit": "EA",
                "unit_cost": 4500,
                "total_cost": 18000,
                "supplier": "알파전자(주)",
                "lead_time_days": 5,
                "stock_qty": 12000,
                "status": "정상",
            },
        ],
        "PRJ-2024-004": [
            {
                "bom_id": "BOM-004-01",
                "part_no": "RES-ABS-WHT-001",
                "part_name": "의료용 ABS 수지",
                "specification": "의료등급 ABS, 백색, FDA 승인",
                "quantity": 2.5,
                "unit": "kg",
                "unit_cost": 12000,
                "total_cost": 30000,
                "supplier": "LG화학(주)",
                "lead_time_days": 14,
                "stock_qty": 850,
                "status": "부족",
            },
            {
                "bom_id": "BOM-004-02",
                "part_no": "INS-MED-M3-002",
                "part_name": "의료용 인서트 너트 M3",
                "specification": "SUS316L, M3×4.8, 열압입",
                "quantity": 12,
                "unit": "EA",
                "unit_cost": 180,
                "total_cost": 2160,
                "supplier": "신일스크류(주)",
                "lead_time_days": 7,
                "stock_qty": 50000,
                "status": "정상",
            },
            {
                "bom_id": "BOM-004-03",
                "part_no": "LBL-MED-CE-003",
                "part_name": "CE인증 라벨",
                "specification": "폴리에스터, 30×20mm, 내열성",
                "quantity": 1,
                "unit": "EA",
                "unit_cost": 120,
                "total_cost": 120,
                "supplier": "대한라벨(주)",
                "lead_time_days": 3,
                "stock_qty": 200000,
                "status": "정상",
            },
        ],
        "PRJ-2024-007": [
            {
                "bom_id": "BOM-007-01",
                "part_no": "MTR-BLDC-200W-001",
                "part_name": "BLDC 서보모터",
                "specification": "200W, 24V, 3000RPM, 인코더 내장",
                "quantity": 6,
                "unit": "EA",
                "unit_cost": 185000,
                "total_cost": 1110000,
                "supplier": "하모닉드라이브(주)",
                "lead_time_days": 35,
                "stock_qty": 48,
                "status": "발주중",
            },
            {
                "bom_id": "BOM-007-02",
                "part_no": "BRG-CROSS-35-002",
                "part_name": "크로스롤러 베어링",
                "specification": "RB3510, 내경35mm, 정밀등급P4",
                "quantity": 6,
                "unit": "EA",
                "unit_cost": 95000,
                "total_cost": 570000,
                "supplier": "(주)THK코리아",
                "lead_time_days": 42,
                "stock_qty": 12,
                "status": "부족",
            },
            {
                "bom_id": "BOM-007-03",
                "part_no": "ALU-7075-LINK-003",
                "part_name": "7075 알루미늄 링크 프레임",
                "specification": "7075-T6, CNC가공, 아노다이징처리",
                "quantity": 12,
                "unit": "EA",
                "unit_cost": 28000,
                "total_cost": 336000,
                "supplier": "정밀가공(주)",
                "lead_time_days": 20,
                "stock_qty": 36,
                "status": "정상",
            },
            {
                "bom_id": "BOM-007-04",
                "part_no": "SEN-TORQ-6AXIS-004",
                "part_name": "6축 힘/토크 센서",
                "specification": "Fx/Fy/Fz: ±200N, Mx/My/Mz: ±10Nm",
                "quantity": 1,
                "unit": "EA",
                "unit_cost": 2800000,
                "total_cost": 2800000,
                "supplier": "ATI Industrial Automation",
                "lead_time_days": 60,
                "stock_qty": 2,
                "status": "정상",
            },
        ],
    }

    # 기본 BOM 데이터 (매핑되지 않은 프로젝트용)
    default_bom = [
        {
            "bom_id": "BOM-DEF-01",
            "part_no": "RAW-STL-SS400-001",
            "part_name": "SS400 구조용 강판",
            "specification": "SS400, 6.0T, 1219×2438mm",
            "quantity": 10,
            "unit": "EA",
            "unit_cost": 45000,
            "total_cost": 450000,
            "supplier": "포스코(주)",
            "lead_time_days": 7,
            "stock_qty": 320,
            "status": "정상",
        },
        {
            "bom_id": "BOM-DEF-02",
            "part_no": "HDW-BOLT-M10-002",
            "part_name": "육각 볼트 M10×30",
            "specification": "M10×30, 강도 8.8, 유니크로 도금",
            "quantity": 48,
            "unit": "EA",
            "unit_cost": 85,
            "total_cost": 4080,
            "supplier": "(주)대성볼트",
            "lead_time_days": 2,
            "stock_qty": 50000,
            "status": "정상",
        },
        {
            "bom_id": "BOM-DEF-03",
            "part_no": "SFC-PNT-GRY-003",
            "part_name": "분체 도장 처리",
            "specification": "RAL7035 라이트그레이, 50~80μm",
            "quantity": 1,
            "unit": "LOT",
            "unit_cost": 180000,
            "total_cost": 180000,
            "supplier": "한국도장(주)",
            "lead_time_days": 5,
            "stock_qty": 999,
            "status": "정상",
        },
    ]

    return bom_data.get(project_id, default_bom)


# ─────────────────────────────────────────────
# 추가 유틸리티: 진행률 컬러 매핑
# ─────────────────────────────────────────────
def progress_color(progress: int) -> str:
    """
    진행률 값에 따라 적절한 COLORS 키를 반환합니다.

    Args:
        progress: 0~100 정수 진행률

    Returns:
        COLORS 딕셔너리의 키 문자열
    """
    if progress >= 100:
        return "success"
    elif progress >= 60:
        return "accent"
    elif progress >= 30:
        return "warning"
    else:
        return "error"


def priority_badge(priority: str) -> str:
    """
    우선순위 텍스트에 따라 배지 HTML을 반환합니다.

    Args:
        priority: "긴급" | "높음" | "보통" | "낮음"

    Returns:
        HTML 배지 문자열
    """
    color_map = {
        "긴급": "error",
        "높음": "warning",
        "보통": "info",
        "낮음": "neutral",
    }
    color = color_map.get(priority, "neutral")
    return status_badge_html(priority, color)


def format_currency(amount: int | float, symbol: str = "₩") -> str:
    """
    숫자를 원화 통화 포맷으로 변환합니다.

    Args:
        amount: 금액 (정수 또는 실수)
        symbol: 통화 기호 (기본값: ₩)

    Returns:
        포맷된 통화 문자열 (예: "₩1,234,567")
    """
    try:
        return f"{symbol}{int(amount):,}"
    except (ValueError, TypeError):
        return f"{symbol}0"


def format_number(n: int | float, decimal_places: int = 0) -> str:
    """
    숫자에 천 단위 구분자를 적용하여 문자열로 반환합니다.

    Args:
        n: 포맷할 숫자
        decimal_places: 소수점 이하 자릿수 (기본값: 0)

    Returns:
        포맷된 숫자 문자열 (예: "12,345" 또는 "12,345.67")
    """
    try:
        if decimal_places > 0:
            return f"{float(n):,.{decimal_places}f}"
        return f"{int(n):,}"
    except (ValueError, TypeError):
        return "0"
