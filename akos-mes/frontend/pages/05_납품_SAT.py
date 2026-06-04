"""납품 & SAT 모듈 — Akos AI MES
Delivery planning, shipment processing, Site Acceptance Test, delivery history, and A/S management.
"""

import streamlit as st
import httpx
import pandas as pd
import plotly.express as px
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from components.kpi_card import render_kpi_card

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# ---------------------------------------------------------------------------
# Page config
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="납품 & SAT | Akos AI MES",
    page_icon="📦",
    layout="wide",
)

# ---------------------------------------------------------------------------
# Global CSS
# ---------------------------------------------------------------------------
st.markdown(
    """
    <style>
    /* ---- base ---- */
    body, .stApp { background: #0e1117; color: #f0f2f6; }

    /* ---- section header ---- */
    .section-header {
        font-size: 1.05rem;
        font-weight: 700;
        color: #e2e8f0;
        border-left: 4px solid #3b82f6;
        padding-left: 10px;
        margin: 18px 0 10px 0;
    }

    /* ---- D-Day card ---- */
    .dday-card {
        border-radius: 10px;
        padding: 14px 16px 12px 16px;
        background: #1e2130;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        margin-bottom: 8px;
        height: 140px;
    }
    .dday-title { font-size: 0.82rem; font-weight: 700; color: #e2e8f0; margin-bottom: 2px; }
    .dday-customer { font-size: 0.72rem; color: #9ba3af; margin-bottom: 6px; }
    .dday-date { font-size: 0.72rem; color: #9ba3af; }
    .dday-num-red   { font-size: 2.2rem; font-weight: 800; color: #ef4444; line-height: 1.1; }
    .dday-num-orange{ font-size: 2.2rem; font-weight: 800; color: #f97316; line-height: 1.1; }
    .dday-num-green { font-size: 2.2rem; font-weight: 800; color: #22c55e; line-height: 1.1; }

    /* ---- status badge ---- */
    .badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .badge-blue   { background: #1d4ed8; color: #bfdbfe; }
    .badge-green  { background: #166534; color: #bbf7d0; }
    .badge-yellow { background: #854d0e; color: #fef08a; }
    .badge-red    { background: #991b1b; color: #fecaca; }
    .badge-gray   { background: #374151; color: #d1d5db; }

    /* ---- checklist item ---- */
    .check-item {
        background: #1e2130;
        border-radius: 6px;
        padding: 8px 12px;
        margin-bottom: 4px;
        font-size: 0.88rem;
    }

    /* ---- transport row ---- */
    .transport-row {
        background: #1e2130;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 16px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Mock data helpers
# ---------------------------------------------------------------------------
TODAY = datetime.now().date()


def _d(days: int) -> str:
    return (TODAY + timedelta(days=days)).strftime("%Y-%m-%d")


def _past(days: int) -> str:
    return (TODAY - timedelta(days=days)).strftime("%Y-%m-%d")


# Delivery order mock data
DELIVERY_ORDERS = pd.DataFrame(
    {
        "납품번호": [f"DO-2026-{str(i).zfill(3)}" for i in range(1, 11)],
        "고객사": [
            "현대자동차(주)", "삼성SDI", "LG에너지솔루션", "SK하이닉스", "포스코",
            "현대모비스", "한화솔루션", "롯데케미칼", "두산에너빌리티", "효성중공업",
        ],
        "설비명": [
            "AI비전검사기 V300", "배터리셀 검사라인", "모듈조립 자동화", "웨이퍼검사시스템",
            "열연코일 모니터링", "제동장치 검사기", "태양광패널 검사", "화학공정 모니터링",
            "터빈블레이드 검사", "변압기 진단시스템",
        ],
        "납기일": [_d(25), _d(5), _d(12), _d(2), _d(35), _d(8), _d(18), _d(45), _d(3), _d(60)],
        "FAT상태": [
            "합격", "합격", "진행중", "합격", "미실시",
            "합격", "진행중", "미실시", "합격", "미실시",
        ],
        "출하상태": [
            "출하준비", "출하완료", "준비중", "출하승인", "미착수",
            "출하준비", "준비중", "미착수", "출하완료", "미착수",
        ],
        "담당PM": [
            "김철수", "이영희", "박민준", "최지은", "정우성",
            "한소희", "오창민", "신미래", "강동원", "윤세아",
        ],
    }
)

# D-Day projects
DDAY_PROJECTS = [
    {"name": "AI비전검사기 V300", "customer": "현대자동차(주)", "date": _d(25), "days": 25},
    {"name": "배터리셀 검사라인", "customer": "삼성SDI", "date": _d(5), "days": 5},
    {"name": "웨이퍼검사시스템", "customer": "SK하이닉스", "date": _d(2), "days": 2},
    {"name": "터빈블레이드 검사", "customer": "두산에너빌리티", "date": _d(3), "days": 3},
    {"name": "제동장치 검사기", "customer": "현대모비스", "date": _d(8), "days": 8},
]

# Transport mock data
TRANSPORT_DATA = [
    {"운송장번호": "TRK-20260601-001", "운송사": "한진택배", "출발": "성남 본사", "도착예정": _d(1), "현황": "운송중"},
    {"운송장번호": "TRK-20260601-002", "운송사": "CJ대한통운", "출발": "성남 본사", "도착예정": _past(1), "현황": "배송완료"},
    {"운송장번호": "TRK-20260530-003", "운송사": "롯데택배", "출발": "수원 창고", "도착예정": _past(2), "현황": "배송완료"},
    {"운송장번호": "TRK-20260602-004", "운송사": "한진택배", "출발": "성남 본사", "도착예정": _d(3), "현황": "운송중"},
    {"운송장번호": "TRK-20260528-005", "운송사": "로젠택배", "출발": "성남 본사", "도착예정": _past(3), "현황": "지연"},
    {"운송장번호": "TRK-20260603-006", "운송사": "CJ대한통운", "출발": "인천 창고", "도착예정": _d(2), "현황": "운송중"},
]

# SAT schedule mock
SAT_SCHEDULE = pd.DataFrame(
    {
        "SAT번호": [f"SAT-2026-{str(i).zfill(3)}" for i in range(1, 6)],
        "고객사": ["현대자동차(주)", "SK하이닉스", "두산에너빌리티", "포스코", "한화솔루션"],
        "설비명": ["AI비전검사기 V300", "웨이퍼검사시스템", "터빈블레이드 검사", "열연코일 모니터링", "태양광패널 검사"],
        "현장주소": ["울산 북구 공장", "이천 반도체단지", "창원 공장", "포항 제철소", "진천 공장"],
        "방문일": [_d(26), _d(3), _d(4), _d(36), _d(19)],
        "담당자": ["김철수", "최지은", "강동원", "정우성", "오창민"],
        "고객담당자": ["홍길동 부장", "이순신 팀장", "장보고 과장", "이황 차장", "신사임당 부장"],
        "상태": ["예정", "확정", "확정", "예정", "예정"],
    }
)

# SAT checklist items
SAT_CHECKLIST_ITEMS = [
    "설비 외관 및 포장 손상 여부 확인",
    "설치 환경 (온도/습도/전원) 적합성 확인",
    "기계적 설치 및 레벨링 완료",
    "전기 배선 및 접지 연결 확인",
    "공압/유압 라인 연결 및 누설 확인",
    "네트워크 및 통신 연결 확인",
    "소프트웨어 설치 및 라이선스 활성화",
    "초기 전원 인가 및 이상 없음 확인",
    "각 축/모듈 개별 동작 확인",
    "통합 동작 테스트 수행",
    "AI 비전 검사 정확도 검증 (목표: ≥99.5%)",
    "처리 속도 및 사이클타임 확인",
    "알람 및 비상정지 기능 확인",
    "데이터 로깅 및 저장 기능 확인",
    "고객 운용자 인수 교육 완료",
]

# Delivery history mock
DELIVERY_HISTORY = pd.DataFrame(
    {
        "납품번호": [f"DO-2025-{str(i).zfill(3)}" for i in range(1, 21)],
        "고객사": [
            "현대자동차(주)", "삼성SDI", "LG에너지솔루션", "SK하이닉스", "포스코",
            "현대모비스", "한화솔루션", "롯데케미칼", "두산에너빌리티", "효성중공업",
            "현대자동차(주)", "삼성SDI", "기아자동차", "POSCO홀딩스", "SK온",
            "현대제철", "LG화학", "한국전력", "현대건설", "삼성전자",
        ],
        "설비명": [
            "AI비전검사기 V200", "배터리검사라인 v1", "모듈조립 자동화 v1", "웨이퍼검사 v2", "코일 모니터링",
            "제동장치검사 v1", "태양광검사 v1", "화학공정 v1", "터빈검사 v1", "변압기진단 v1",
            "AI비전검사기 V150", "배터리팩검사", "도장라인 검사", "철강품질검사", "배터리모듈검사",
            "열처리 모니터링", "촉매공정 검사", "발전설비 진단", "콘크리트품질검사", "반도체검사 v3",
        ],
        "납품일": [_past(i * 15 + 10) for i in range(20)],
        "최종금액(만원)": [
            18500, 32000, 45000, 28000, 15000,
            22000, 19500, 38000, 42000, 25000,
            16000, 29000, 21000, 17500, 35000,
            24000, 31000, 19000, 23500, 48000,
        ],
        "SAT결과": ["합격"] * 18 + ["조건부합격", "합격"],
        "AS접수": [1, 0, 2, 0, 1, 0, 3, 1, 0, 2, 0, 1, 0, 0, 1, 2, 0, 1, 0, 0],
    }
)

# A/S data
AS_INPROGRESS = pd.DataFrame(
    {
        "AS번호": [f"AS-2026-{str(i).zfill(3)}" for i in range(1, 13)],
        "고객사": [
            "현대자동차(주)", "삼성SDI", "LG에너지솔루션", "SK하이닉스", "포스코",
            "현대모비스", "한화솔루션", "롯데케미칼", "두산에너빌리티", "효성중공업",
            "현대자동차(주)", "삼성SDI",
        ],
        "증상": [
            "비전 카메라 인식률 저하", "배터리 검사 오류", "조립 로봇 오작동", "웨이퍼 스캔 불량",
            "모니터링 화면 먹통", "제동 센서 오감지", "패널 포지셔닝 오차", "공정 데이터 누락",
            "터빈 진동 이상 경보", "통신 연결 불안정", "AI 모델 정확도 저하", "소프트웨어 오류",
        ],
        "담당자": [
            "김철수", "이영희", "박민준", "최지은", "정우성",
            "한소희", "오창민", "신미래", "강동원", "윤세아",
            "김철수", "이영희",
        ],
        "접수일": [_past(i + 1) for i in range(12)],
        "처리기한": [_d(i) for i in [2, 1, 3, 0, 5, 4, 7, 2, 1, 6, 3, 8]],
        "긴급도": ["긴급", "긴급", "일반", "긴급", "일반", "일반", "일반", "일반", "긴급", "일반", "일반", "일반"],
        "상태": [
            "현장출동중", "원격지원중", "부품준비중", "현장출동중", "원격지원중",
            "접수완료", "원격지원중", "부품준비중", "현장출동중", "접수완료",
            "원격지원중", "접수완료",
        ],
    }
)

AS_HISTORY = pd.DataFrame(
    {
        "AS번호": [f"AS-2025-{str(i).zfill(3)}" for i in range(1, 31)],
        "고객사": [
            "현대자동차(주)", "삼성SDI", "LG에너지솔루션", "SK하이닉스", "포스코",
            "현대모비스", "한화솔루션", "롯데케미칼", "두산에너빌리티", "효성중공업",
            "현대자동차(주)", "삼성SDI", "기아자동차", "POSCO홀딩스", "SK온",
            "현대제철", "LG화학", "한국전력", "현대건설", "삼성전자",
            "현대자동차(주)", "삼성SDI", "LG에너지솔루션", "SK하이닉스", "포스코",
            "현대모비스", "한화솔루션", "롯데케미칼", "두산에너빌리티", "효성중공업",
        ],
        "증상분류": [
            "소프트웨어", "하드웨어", "통신", "소프트웨어", "하드웨어",
            "센서", "기계", "소프트웨어", "통신", "하드웨어",
            "소프트웨어", "기계", "소프트웨어", "하드웨어", "통신",
            "센서", "소프트웨어", "기계", "통신", "하드웨어",
            "소프트웨어", "센서", "하드웨어", "소프트웨어", "기계",
            "통신", "소프트웨어", "하드웨어", "센서", "기계",
        ],
        "접수일": [_past(i * 10 + 5) for i in range(30)],
        "완료일": [_past(i * 10 + 2) for i in range(30)],
        "처리일수": [3, 2, 4, 1, 5, 3, 2, 6, 2, 4, 1, 3, 2, 5, 3, 2, 4, 1, 3, 7, 2, 3, 4, 1, 2, 5, 3, 2, 4, 3],
        "부품교체": ["없음", "있음", "없음", "없음", "있음"] * 6,
        "처리비용(만원)": [0, 15, 0, 0, 32, 0, 8, 0, 0, 25, 0, 0, 0, 18, 0, 0, 12, 0, 0, 45, 0, 0, 22, 0, 0, 35, 0, 14, 0, 0],
        "고객만족도": [5, 4, 5, 5, 4, 3, 5, 4, 5, 4, 5, 4, 5, 3, 5, 4, 5, 5, 4, 3, 5, 4, 5, 5, 4, 3, 5, 4, 5, 4],
    }
)

# ---------------------------------------------------------------------------
# Page header
# ---------------------------------------------------------------------------
st.markdown(
    """
    <div style='background:linear-gradient(90deg,#1e3a5f,#1e2130);
                border-radius:10px;padding:18px 24px;margin-bottom:20px;
                border-left:5px solid #3b82f6;'>
        <h2 style='margin:0;color:#f0f2f6;font-size:1.5rem;'>
            📦 납품 & SAT 관리
        </h2>
        <p style='margin:4px 0 0 0;color:#9ba3af;font-size:0.85rem;'>
            납품 계획 · 출하 처리 · 현장검수(SAT) · 납품 이력 · A/S 관리
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Main tabs
# ---------------------------------------------------------------------------
tab1, tab2, tab3, tab4, tab5 = st.tabs(
    ["📦 납품 계획", "🚛 출하 처리", "🏭 SAT", "📜 납품 이력", "🔧 A/S 관리"]
)

# ===========================================================================
# TAB 1 — 납품 계획
# ===========================================================================
with tab1:
    # KPI row
    st.markdown('<div class="section-header">이번 달 납품 현황</div>', unsafe_allow_html=True)
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        render_kpi_card("이번달 납품 예정", "6건", color="#3b82f6", help_text="이번 달 납품 예정 총 건수")
    with k2:
        render_kpi_card("납품 완료", "4건", delta="+1", color="#22c55e", help_text="이번 달 납품 완료 건수")
    with k3:
        render_kpi_card("D-7 이내 납기", "2건", color="#f97316", help_text="납기일이 7일 이내인 건수")
    with k4:
        render_kpi_card("지연 위험", "1건", delta="-1", color="#ef4444", help_text="납기 지연 위험 건수")

    st.markdown("<br>", unsafe_allow_html=True)

    # D-Day countdown
    st.markdown('<div class="section-header">납기 D-Day 카운트다운</div>', unsafe_allow_html=True)
    dday_cols = st.columns(5)
    for i, proj in enumerate(DDAY_PROJECTS):
        d = proj["days"]
        if d < 3:
            num_class = "dday-num-red"
            label = f"D-{d}" if d > 0 else "D-DAY"
        elif d < 7:
            num_class = "dday-num-orange"
            label = f"D-{d}"
        else:
            num_class = "dday-num-green"
            label = f"D-{d}"
        with dday_cols[i]:
            st.markdown(
                f"""
                <div class="dday-card">
                    <div class="dday-title">{proj['name']}</div>
                    <div class="dday-customer">{proj['customer']}</div>
                    <div class="{num_class}">{label}</div>
                    <div class="dday-date">납기일: {proj['date']}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown("<br>", unsafe_allow_html=True)

    # Delivery order table
    st.markdown('<div class="section-header">납품 오더 목록</div>', unsafe_allow_html=True)

    def _fat_badge(v):
        m = {"합격": "badge-green", "진행중": "badge-yellow", "미실시": "badge-gray"}
        return f'<span class="badge {m.get(v,"badge-gray")}">{v}</span>'

    def _ship_badge(v):
        m = {
            "출하완료": "badge-green",
            "출하승인": "badge-blue",
            "출하준비": "badge-yellow",
            "준비중": "badge-yellow",
            "미착수": "badge-gray",
        }
        return f'<span class="badge {m.get(v,"badge-gray")}">{v}</span>'

    display_df = DELIVERY_ORDERS.copy()
    display_df["FAT상태"] = display_df["FAT상태"].apply(_fat_badge)
    display_df["출하상태"] = display_df["출하상태"].apply(_ship_badge)
    st.markdown(
        display_df.to_html(escape=False, index=False),
        unsafe_allow_html=True,
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # Registration form
    st.markdown('<div class="section-header">납품 계획 등록</div>', unsafe_allow_html=True)
    with st.expander("+ 납품 계획 등록", expanded=False):
        with st.form("delivery_plan_form"):
            fc1, fc2 = st.columns(2)
            with fc1:
                fp_customer = st.text_input("고객사 *", placeholder="예) 현대자동차(주)")
                fp_equipment = st.text_input("설비명 *", placeholder="예) AI비전검사기 V300")
                fp_contract = st.text_input("계약번호", placeholder="예) CT-2026-001")
            with fc2:
                fp_duedate = st.date_input("납기일 *", value=TODAY + timedelta(days=30))
                fp_pm = st.text_input("담당 PM *", placeholder="예) 김철수")
                fp_note = st.text_area("특기사항", placeholder="예) 무진동 포장 필수, 현장 반입 사전 협의 필요", height=80)
            submitted = st.form_submit_button("납품 계획 등록", type="primary")
            if submitted:
                if fp_customer and fp_equipment and fp_pm:
                    st.success(f"납품 계획이 등록되었습니다. [{fp_customer} / {fp_equipment}] — 납기일: {fp_duedate}")
                else:
                    st.error("필수 항목(고객사, 설비명, 담당 PM)을 입력해 주세요.")

# ===========================================================================
# TAB 2 — 출하 처리
# ===========================================================================
with tab2:
    st2a, st2b, st2c = st.tabs(["출하 검사", "출하 지시서", "운송 현황"])

    # ---- 출하 검사 ----
    with st2a:
        st.markdown('<div class="section-header">최종 출하 전 체크리스트</div>', unsafe_allow_html=True)
        selected_order = st.selectbox(
            "납품 오더 선택",
            DELIVERY_ORDERS["납품번호"].tolist(),
            format_func=lambda x: f"{x} — {DELIVERY_ORDERS.loc[DELIVERY_ORDERS['납품번호']==x,'고객사'].values[0]} / "
                                  f"{DELIVERY_ORDERS.loc[DELIVERY_ORDERS['납품번호']==x,'설비명'].values[0]}",
        )

        st.markdown("<br>", unsafe_allow_html=True)

        checklist_items = [
            ("FAT 합격 확인", "Factory Acceptance Test 합격 서류 확인"),
            ("서류 완비 확인", "납품 관련 전 서류 (시험성적서, 인증서 등) 완비"),
            ("포장 상태 확인", "설비 포장 및 충격 방지재 확인"),
            ("라벨 부착 확인", "납품처, 취급주의 라벨 부착 완료"),
            ("수량 확인", "납품 수량 및 부속품 수량 일치 확인"),
            ("외관 검사", "외관 손상 및 이물질 없음 확인"),
            ("보증서 첨부", "품질 보증서 및 보증 기간 명시 확인"),
            ("매뉴얼 첨부", "운용 매뉴얼 (한국어) 및 유지보수 가이드 포함"),
        ]

        if "ship_checks" not in st.session_state:
            st.session_state.ship_checks = [False] * len(checklist_items)

        check_cols = st.columns(2)
        new_checks = list(st.session_state.ship_checks)
        for idx, (item, desc) in enumerate(checklist_items):
            col = check_cols[idx % 2]
            with col:
                new_checks[idx] = st.checkbox(
                    f"**{item}**  \n{desc}",
                    value=st.session_state.ship_checks[idx],
                    key=f"shipcheck_{idx}",
                )
        st.session_state.ship_checks = new_checks

        passed = sum(st.session_state.ship_checks)
        total = len(checklist_items)
        st.markdown(f"**체크 현황:** {passed} / {total} 항목 완료")
        st.progress(passed / total)

        st.markdown("<br>", unsafe_allow_html=True)
        if passed == total:
            if st.button("출하 승인", type="primary", key="ship_approve"):
                st.success(f"{selected_order} — 출하가 승인되었습니다. 출하 지시서를 발행해 주세요.")
                st.balloons()
        else:
            st.warning(f"모든 체크리스트 항목 완료 후 출하 승인이 가능합니다. ({total - passed}개 미완료)")

    # ---- 출하 지시서 ----
    with st2b:
        st.markdown('<div class="section-header">출하 지시서 목록</div>', unsafe_allow_html=True)

        instructions = pd.DataFrame(
            {
                "지시서번호": [f"SI-2026-{str(i).zfill(3)}" for i in range(1, 6)],
                "납품번호": ["DO-2026-002", "DO-2026-004", "DO-2026-001", "DO-2026-006", "DO-2026-009"],
                "고객사": ["삼성SDI", "SK하이닉스", "현대자동차(주)", "현대모비스", "두산에너빌리티"],
                "설비명": ["배터리셀 검사라인", "웨이퍼검사시스템", "AI비전검사기 V300", "제동장치 검사기", "터빈블레이드 검사"],
                "발행일": [_past(3), _past(1), _past(5), _past(2), _past(1)],
                "상태": ["발행완료", "발행완료", "출력완료", "발행완료", "발행완료"],
            }
        )
        st.dataframe(instructions, use_container_width=True, hide_index=True)

        col_btn, col_form = st.columns([1, 2])
        with col_btn:
            st.markdown("<br>", unsafe_allow_html=True)
            selected_si = st.selectbox("지시서 선택", instructions["지시서번호"].tolist())
            if st.button("지시서 출력", key="print_si"):
                st.info(f"{selected_si} 출력 요청이 처리되었습니다.")

        with col_form:
            st.markdown('<div class="section-header">운송 일정 입력</div>', unsafe_allow_html=True)
            with st.form("transport_schedule_form"):
                ts1, ts2 = st.columns(2)
                with ts1:
                    ts_carrier = st.selectbox("운송사", ["한진택배", "CJ대한통운", "롯데택배", "로젠택배", "직접운송"])
                    ts_depart = st.date_input("출발일", value=TODAY + timedelta(days=1))
                with ts2:
                    ts_arrive = st.date_input("도착 예정일", value=TODAY + timedelta(days=3))
                    ts_contact = st.text_input("기사 연락처", placeholder="010-1234-5678")
                ts_note = st.text_input("운송 특이사항", placeholder="예) 크레인 필요, 무게 2.5t 초과")
                if st.form_submit_button("운송 일정 등록", type="primary"):
                    st.success(f"운송 일정이 등록되었습니다. [{ts_carrier}] {ts_depart} → {ts_arrive}")

    # ---- 운송 현황 ----
    with st2c:
        st.markdown('<div class="section-header">운송 현황</div>', unsafe_allow_html=True)

        status_colors = {"운송중": "badge-blue", "배송완료": "badge-green", "지연": "badge-red"}
        for t in TRANSPORT_DATA:
            badge_cls = status_colors.get(t["현황"], "badge-gray")
            st.markdown(
                f"""
                <div style='background:#1e2130;border-radius:8px;padding:14px 18px;
                            margin-bottom:8px;display:flex;align-items:center;gap:0;'>
                    <div style='flex:2;'>
                        <div style='font-size:0.82rem;color:#9ba3af;'>운송장번호</div>
                        <div style='font-weight:700;color:#e2e8f0;'>{t['운송장번호']}</div>
                    </div>
                    <div style='flex:1.2;'>
                        <div style='font-size:0.82rem;color:#9ba3af;'>운송사</div>
                        <div style='color:#e2e8f0;'>{t['운송사']}</div>
                    </div>
                    <div style='flex:1.5;'>
                        <div style='font-size:0.82rem;color:#9ba3af;'>출발지</div>
                        <div style='color:#e2e8f0;'>{t['출발']}</div>
                    </div>
                    <div style='flex:1.5;'>
                        <div style='font-size:0.82rem;color:#9ba3af;'>도착 예정</div>
                        <div style='color:#e2e8f0;'>{t['도착예정']}</div>
                    </div>
                    <div style='flex:1;text-align:right;'>
                        <span class="badge {badge_cls}">{t['현황']}</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

# ===========================================================================
# TAB 3 — SAT
# ===========================================================================
with tab3:
    sat1, sat2, sat3, sat4 = st.tabs(["SAT 계획", "SAT 체크리스트", "SAT 실행", "SAT 결과 리포트"])

    # ---- SAT 계획 ----
    with sat1:
        st.markdown('<div class="section-header">SAT 일정 목록</div>', unsafe_allow_html=True)
        st.dataframe(SAT_SCHEDULE, use_container_width=True, hide_index=True)

        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown('<div class="section-header">SAT 일정 등록</div>', unsafe_allow_html=True)
        with st.expander("+ SAT 일정 등록", expanded=False):
            with st.form("sat_schedule_form"):
                ss1, ss2 = st.columns(2)
                with ss1:
                    ss_order = st.selectbox("납품 오더", DELIVERY_ORDERS["납품번호"].tolist())
                    ss_address = st.text_input("현장 주소 *", placeholder="예) 울산 북구 제조1공장")
                    ss_date = st.date_input("방문일 *", value=TODAY + timedelta(days=7))
                with ss2:
                    ss_engineer = st.text_input("담당 엔지니어 *", placeholder="예) 김철수")
                    ss_client = st.text_input("고객 담당자 *", placeholder="예) 홍길동 부장 / 010-0000-0000")
                    ss_note = st.text_area("특이사항", placeholder="예) 공장 출입증 사전 발급 필요", height=68)
                if st.form_submit_button("SAT 일정 등록", type="primary"):
                    if ss_address and ss_engineer and ss_client:
                        st.success(f"SAT 일정이 등록되었습니다. [{ss_order}] 방문일: {ss_date} / 담당: {ss_engineer}")
                    else:
                        st.error("필수 항목을 모두 입력해 주세요.")

    # ---- SAT 체크리스트 ----
    with sat2:
        st.markdown('<div class="section-header">현장 설치 확인 체크리스트</div>', unsafe_allow_html=True)
        sat_ref = st.selectbox("SAT 건 선택", SAT_SCHEDULE["SAT번호"].tolist(), key="sat_check_sel",
                               format_func=lambda x: f"{x} — {SAT_SCHEDULE.loc[SAT_SCHEDULE['SAT번호']==x,'고객사'].values[0]}")

        checklist_df = pd.DataFrame(
            {
                "순번": list(range(1, len(SAT_CHECKLIST_ITEMS) + 1)),
                "점검 항목": SAT_CHECKLIST_ITEMS,
                "합격": [False] * len(SAT_CHECKLIST_ITEMS),
                "불합격": [False] * len(SAT_CHECKLIST_ITEMS),
                "해당없음": [False] * len(SAT_CHECKLIST_ITEMS),
                "비고": [""] * len(SAT_CHECKLIST_ITEMS),
            }
        )
        edited_checklist = st.data_editor(
            checklist_df,
            use_container_width=True,
            hide_index=True,
            disabled=["순번", "점검 항목"],
            column_config={
                "합격": st.column_config.CheckboxColumn("합격 ✅", default=False),
                "불합격": st.column_config.CheckboxColumn("불합격 ❌", default=False),
                "해당없음": st.column_config.CheckboxColumn("해당없음 ➖", default=False),
                "비고": st.column_config.TextColumn("비고", max_chars=200),
            },
            key="sat_checklist_editor",
        )
        passed_count = int(edited_checklist["합격"].sum())
        fail_count = int(edited_checklist["불합격"].sum())
        na_count = int(edited_checklist["해당없음"].sum())
        st.markdown(
            f"**점검 결과:** 합격 {passed_count}개 / 불합격 {fail_count}개 / 해당없음 {na_count}개 "
            f"/ 미점검 {len(SAT_CHECKLIST_ITEMS) - passed_count - fail_count - na_count}개"
        )
        if st.button("체크리스트 저장", key="save_checklist"):
            st.success("체크리스트가 저장되었습니다.")

    # ---- SAT 실행 ----
    with sat3:
        st.markdown('<div class="section-header">SAT 현장 실행</div>', unsafe_allow_html=True)

        sat_exec_ref = st.selectbox(
            "SAT 건 선택",
            SAT_SCHEDULE["SAT번호"].tolist(),
            key="sat_exec_sel",
            format_func=lambda x: f"{x} — {SAT_SCHEDULE.loc[SAT_SCHEDULE['SAT번호']==x,'고객사'].values[0]} "
                                  f"({SAT_SCHEDULE.loc[SAT_SCHEDULE['SAT번호']==x,'방문일'].values[0]})",
        )

        col_exec1, col_exec2 = st.columns([2, 1])

        with col_exec1:
            st.markdown("**현장 점검 항목별 실행 확인**")
            if "exec_checks" not in st.session_state:
                st.session_state.exec_checks = {item: False for item in SAT_CHECKLIST_ITEMS[:8]}

            for item in SAT_CHECKLIST_ITEMS[:8]:
                st.session_state.exec_checks[item] = st.checkbox(
                    item,
                    value=st.session_state.exec_checks.get(item, False),
                    key=f"exec_{item}",
                )

            exec_progress = sum(st.session_state.exec_checks.values())
            st.progress(exec_progress / 8)
            st.caption(f"{exec_progress} / 8 항목 확인 완료")

        with col_exec2:
            st.markdown("**현장 사진 첨부**")
            uploaded_photos = st.file_uploader(
                "현장 사진 업로드",
                type=["jpg", "jpeg", "png"],
                accept_multiple_files=True,
                key="sat_photos",
            )
            if uploaded_photos:
                st.success(f"{len(uploaded_photos)}장 업로드 완료")
                for photo in uploaded_photos[:2]:
                    st.image(photo, use_container_width=True)

            st.markdown("<br>", unsafe_allow_html=True)
            st.markdown("**특이사항 기록**")
            sat_note = st.text_area("현장 특이사항", placeholder="예) 2번 축 초기화 재수행, 고객 요청에 따라 감도 조정", height=100, key="sat_exec_note")

        # 고객 서명 섹션
        st.markdown("---")
        st.markdown('<div class="section-header">고객 인수 서명</div>', unsafe_allow_html=True)

        sig_col1, sig_col2, sig_col3 = st.columns(3)
        with sig_col1:
            sig_name = st.text_input("고객 담당자 성명", placeholder="홍길동")
            sig_title = st.text_input("직책", placeholder="제조팀장")
        with sig_col2:
            sig_result = st.selectbox("SAT 결과", ["합격", "조건부합격", "불합격"])
            sig_date = st.date_input("서명일", value=TODAY)
        with sig_col3:
            sig_comment = st.text_area("고객 의견", placeholder="설비 인수에 동의합니다.", height=80)

        st.markdown("<br>", unsafe_allow_html=True)
        col_sign1, col_sign2 = st.columns([1, 4])
        with col_sign1:
            if st.button("전자 서명 완료", type="primary", key="esign_btn"):
                if sig_name and sig_title:
                    st.success(
                        f"전자 서명이 완료되었습니다.\n\n"
                        f"서명자: {sig_name} ({sig_title}) | 결과: {sig_result} | 일자: {sig_date}"
                    )
                else:
                    st.error("서명자 정보(성명, 직책)를 입력해 주세요.")

    # ---- SAT 결과 리포트 ----
    with sat4:
        st.markdown('<div class="section-header">SAT 결과 리포트</div>', unsafe_allow_html=True)

        report_ref = st.selectbox(
            "SAT 건 선택",
            SAT_SCHEDULE["SAT번호"].tolist(),
            key="sat_report_sel",
            format_func=lambda x: f"{x} — {SAT_SCHEDULE.loc[SAT_SCHEDULE['SAT번호']==x,'고객사'].values[0]}",
        )

        sel_row = SAT_SCHEDULE[SAT_SCHEDULE["SAT번호"] == report_ref].iloc[0]

        st.markdown(
            f"""
            <div style='background:#1e2130;border-radius:10px;padding:20px 24px;margin-bottom:16px;'>
                <h4 style='color:#3b82f6;margin:0 0 12px 0;'>SAT 결과 요약</h4>
                <table style='width:100%;border-collapse:collapse;'>
                    <tr>
                        <td style='padding:6px 12px;color:#9ba3af;width:20%;'>SAT 번호</td>
                        <td style='padding:6px 12px;color:#e2e8f0;font-weight:600;'>{sel_row['SAT번호']}</td>
                        <td style='padding:6px 12px;color:#9ba3af;width:20%;'>고객사</td>
                        <td style='padding:6px 12px;color:#e2e8f0;font-weight:600;'>{sel_row['고객사']}</td>
                    </tr>
                    <tr>
                        <td style='padding:6px 12px;color:#9ba3af;'>설비명</td>
                        <td style='padding:6px 12px;color:#e2e8f0;'>{sel_row['설비명']}</td>
                        <td style='padding:6px 12px;color:#9ba3af;'>방문일</td>
                        <td style='padding:6px 12px;color:#e2e8f0;'>{sel_row['방문일']}</td>
                    </tr>
                    <tr>
                        <td style='padding:6px 12px;color:#9ba3af;'>현장 주소</td>
                        <td style='padding:6px 12px;color:#e2e8f0;'>{sel_row['현장주소']}</td>
                        <td style='padding:6px 12px;color:#9ba3af;'>담당 엔지니어</td>
                        <td style='padding:6px 12px;color:#e2e8f0;'>{sel_row['담당자']}</td>
                    </tr>
                    <tr>
                        <td style='padding:6px 12px;color:#9ba3af;'>점검 항목</td>
                        <td style='padding:6px 12px;color:#22c55e;font-weight:700;'>15 / 15 합격</td>
                        <td style='padding:6px 12px;color:#9ba3af;'>최종 결과</td>
                        <td style='padding:6px 12px;'>
                            <span class="badge badge-green" style='font-size:0.9rem;padding:4px 14px;'>합격</span>
                        </td>
                    </tr>
                </table>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Result metrics
        r1, r2, r3, r4 = st.columns(4)
        with r1:
            render_kpi_card("점검 항목 합격", "15 / 15", color="#22c55e")
        with r2:
            render_kpi_card("현장 사진", "8장", color="#3b82f6")
        with r3:
            render_kpi_card("고객 서명", "완료", color="#22c55e")
        with r4:
            render_kpi_card("SAT 최종 결과", "합격", color="#22c55e")

        st.markdown("<br>", unsafe_allow_html=True)

        btn1, btn2, btn3 = st.columns(3)
        with btn1:
            if st.button("PDF 리포트 생성", type="primary", key="pdf_gen"):
                st.info(f"{report_ref} SAT 결과 리포트 PDF가 생성되었습니다.\n저장 경로: /reports/SAT/{report_ref}.pdf")
        with btn2:
            if st.button("고객사 이메일 발송", key="email_send"):
                st.success(f"{sel_row['고객사']} 담당자({sel_row['고객담당자']})에게 SAT 결과 리포트가 발송되었습니다.")
        with btn3:
            if st.button("납품 완료 처리", key="delivery_complete"):
                st.success("납품 완료 처리되었습니다. 납품 이력에 기록되었습니다.")

# ===========================================================================
# TAB 4 — 납품 이력
# ===========================================================================
with tab4:
    st.markdown('<div class="section-header">검색 필터</div>', unsafe_allow_html=True)
    hf1, hf2, hf3 = st.columns(3)
    with hf1:
        hist_customers = ["전체"] + sorted(DELIVERY_HISTORY["고객사"].unique().tolist())
        h_customer = st.selectbox("고객사", hist_customers, key="h_customer")
    with hf2:
        h_start = st.date_input("조회 시작일", value=TODAY - timedelta(days=365), key="h_start")
    with hf3:
        h_end = st.date_input("조회 종료일", value=TODAY, key="h_end")
    h_status = st.multiselect("SAT 결과", ["합격", "조건부합격", "불합격"], default=["합격", "조건부합격"])

    filtered_hist = DELIVERY_HISTORY.copy()
    if h_customer != "전체":
        filtered_hist = filtered_hist[filtered_hist["고객사"] == h_customer]
    if h_status:
        filtered_hist = filtered_hist[filtered_hist["SAT결과"].isin(h_status)]

    st.markdown('<div class="section-header">납품 완료 목록</div>', unsafe_allow_html=True)
    st.dataframe(
        filtered_hist.style.apply(
            lambda col: [
                "color: #22c55e" if v == "합격" else ("color: #f97316" if v == "조건부합격" else "color: #ef4444")
                for v in col
            ]
            if col.name == "SAT결과"
            else [""] * len(col),
            axis=0,
        ),
        use_container_width=True,
        hide_index=True,
    )
    st.caption(f"총 {len(filtered_hist)}건 조회")

    # Charts
    chart_col1, chart_col2 = st.columns(2)

    with chart_col1:
        st.markdown('<div class="section-header">고객사별 납품 건수</div>', unsafe_allow_html=True)
        cust_stats = (
            DELIVERY_HISTORY.groupby("고객사")
            .agg(납품건수=("납품번호", "count"), 총금액=("최종금액(만원)", "sum"))
            .reset_index()
            .sort_values("납품건수", ascending=False)
        )
        fig_bar = px.bar(
            cust_stats,
            x="고객사",
            y="납품건수",
            color="납품건수",
            color_continuous_scale="Blues",
            title="고객사별 납품 건수",
            text="납품건수",
        )
        fig_bar.update_layout(
            paper_bgcolor="#0e1117",
            plot_bgcolor="#1e2130",
            font_color="#e2e8f0",
            title_font_size=13,
            coloraxis_showscale=False,
            xaxis_tickangle=-30,
            margin=dict(l=20, r=20, t=40, b=60),
            height=320,
        )
        fig_bar.update_traces(textposition="outside")
        st.plotly_chart(fig_bar, use_container_width=True)

    with chart_col2:
        st.markdown('<div class="section-header">납품 완료율 트렌드 (12개월)</div>', unsafe_allow_html=True)
        months = [(TODAY.replace(day=1) - timedelta(days=30 * i)) for i in range(11, -1, -1)]
        month_labels = [m.strftime("%Y-%m") for m in months]
        completion_rates = [82, 85, 88, 90, 87, 91, 93, 89, 94, 96, 95, 97]
        trend_df = pd.DataFrame({"월": month_labels, "납품완료율(%)": completion_rates})

        fig_line = px.line(
            trend_df,
            x="월",
            y="납품완료율(%)",
            markers=True,
            title="월별 납품 완료율 추이",
            color_discrete_sequence=["#3b82f6"],
        )
        fig_line.add_hline(y=95, line_dash="dash", line_color="#22c55e", annotation_text="목표 95%")
        fig_line.update_layout(
            paper_bgcolor="#0e1117",
            plot_bgcolor="#1e2130",
            font_color="#e2e8f0",
            title_font_size=13,
            xaxis_tickangle=-30,
            margin=dict(l=20, r=20, t=40, b=60),
            height=320,
        )
        fig_line.update_xaxes(gridcolor="#374151")
        fig_line.update_yaxes(gridcolor="#374151", range=[75, 100])
        st.plotly_chart(fig_line, use_container_width=True)

# ===========================================================================
# TAB 5 — A/S 관리
# ===========================================================================
with tab5:
    # KPI row
    st.markdown('<div class="section-header">A/S 현황 KPI</div>', unsafe_allow_html=True)
    ak1, ak2, ak3, ak4 = st.columns(4)
    with ak1:
        render_kpi_card("A/S 접수", "12건", color="#f97316", help_text="현재 처리 대기 중인 A/S 건수")
    with ak2:
        render_kpi_card("처리 중", "8건", delta="-2", color="#3b82f6", help_text="현재 처리 진행 중인 A/S 건수")
    with ak3:
        render_kpi_card("완료 (이번달)", "45건", delta="+5", color="#22c55e", help_text="이번 달 완료된 A/S 건수")
    with ak4:
        render_kpi_card("평균 처리일", "3.2일", delta="-0.3", color="#22c55e", help_text="평균 A/S 처리 소요 일수")

    st.markdown("<br>", unsafe_allow_html=True)

    as1, as2, as3 = st.tabs(["A/S 접수", "처리 현황", "이력 조회"])

    # ---- A/S 접수 ----
    with as1:
        st.markdown('<div class="section-header">A/S 접수 등록</div>', unsafe_allow_html=True)
        with st.form("as_reception_form"):
            ar1, ar2 = st.columns(2)
            with ar1:
                ar_customer = st.text_input("고객사 *", placeholder="예) 현대자동차(주)")
                ar_equipment = st.text_input("설비명 *", placeholder="예) AI비전검사기 V300")
                ar_symptom = st.text_area("증상 설명 *", placeholder="예) AI 비전 카메라 인식률이 갑자기 80% 이하로 저하됨. 재가동 후에도 동일 현상.", height=100)
            with ar2:
                ar_urgency = st.selectbox("긴급도 *", ["일반", "긴급", "매우긴급"])
                ar_contact = st.text_input("고객 연락처 *", placeholder="예) 홍길동 부장 / 010-0000-0000")
                ar_history = st.text_area("조치 이력", placeholder="예) 3개월 전 동일 증상 발생, 소프트웨어 재설치로 해결", height=68)
            ar_photos = st.file_uploader(
                "현장 사진 첨부 (선택)",
                type=["jpg", "jpeg", "png"],
                accept_multiple_files=True,
                key="as_photos",
            )
            submitted_as = st.form_submit_button("A/S 접수 등록", type="primary")
            if submitted_as:
                if ar_customer and ar_equipment and ar_symptom and ar_contact:
                    import random
                    as_no = f"AS-2026-{random.randint(100, 999)}"
                    st.success(
                        f"A/S 접수가 완료되었습니다.\n\n"
                        f"접수번호: **{as_no}** | 고객사: {ar_customer} | 긴급도: **{ar_urgency}** "
                        f"| 담당자 배정 후 연락드리겠습니다."
                    )
                else:
                    st.error("필수 항목(고객사, 설비명, 증상, 연락처)을 입력해 주세요.")

    # ---- 처리 현황 ----
    with as2:
        st.markdown('<div class="section-header">A/S 처리 현황</div>', unsafe_allow_html=True)

        urgency_filter = st.multiselect("긴급도 필터", ["긴급", "일반"], default=["긴급", "일반"], key="urgency_filter")
        filtered_as = AS_INPROGRESS[AS_INPROGRESS["긴급도"].isin(urgency_filter)]

        def _as_status_badge(v):
            m = {
                "현장출동중": "badge-blue",
                "원격지원중": "badge-yellow",
                "부품준비중": "badge-yellow",
                "접수완료": "badge-gray",
            }
            return f'<span class="badge {m.get(v,"badge-gray")}">{v}</span>'

        def _urgency_badge(v):
            return f'<span class="badge {"badge-red" if v == "긴급" else "badge-gray"}">{v}</span>'

        display_as = filtered_as.copy()
        display_as["상태"] = display_as["상태"].apply(_as_status_badge)
        display_as["긴급도"] = display_as["긴급도"].apply(_urgency_badge)
        st.markdown(display_as.to_html(escape=False, index=False), unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown('<div class="section-header">조치 완료 등록</div>', unsafe_allow_html=True)
        with st.expander("조치 완료 등록", expanded=False):
            with st.form("as_complete_form"):
                cc1, cc2 = st.columns(2)
                with cc1:
                    cc_asno = st.selectbox("A/S 번호", AS_INPROGRESS["AS번호"].tolist())
                    cc_action = st.text_area("조치 내용 *", placeholder="예) AI 모델 재학습 및 카메라 렌즈 클리닝 수행, 인식률 99.7%로 정상 복구", height=100)
                with cc2:
                    cc_parts = st.selectbox("부품 교체 여부", ["없음", "있음"])
                    cc_parts_detail = st.text_input("교체 부품 내역", placeholder="예) 조명 모듈 LED 교체 (2EA)")
                    cc_cost = st.number_input("처리 비용 (만원)", min_value=0, value=0, step=1)
                    cc_satisfy = st.slider("예상 고객 만족도", 1, 5, 4)
                if st.form_submit_button("조치 완료 등록", type="primary"):
                    if cc_action:
                        st.success(f"{cc_asno} A/S 조치 완료가 등록되었습니다. 비용: {cc_cost:,}만원")
                    else:
                        st.error("조치 내용을 입력해 주세요.")

    # ---- 이력 조회 ----
    with as3:
        st.markdown('<div class="section-header">A/S 이력 검색 필터</div>', unsafe_allow_html=True)
        hh1, hh2, hh3 = st.columns(3)
        with hh1:
            ash_customers = ["전체"] + sorted(AS_HISTORY["고객사"].unique().tolist())
            ash_customer = st.selectbox("고객사", ash_customers, key="ash_customer")
        with hh2:
            ash_types = ["전체"] + sorted(AS_HISTORY["증상분류"].unique().tolist())
            ash_type = st.selectbox("증상 분류", ash_types, key="ash_type")
        with hh3:
            ash_parts = st.selectbox("부품 교체", ["전체", "있음", "없음"], key="ash_parts")

        filtered_ash = AS_HISTORY.copy()
        if ash_customer != "전체":
            filtered_ash = filtered_ash[filtered_ash["고객사"] == ash_customer]
        if ash_type != "전체":
            filtered_ash = filtered_ash[filtered_ash["증상분류"] == ash_type]
        if ash_parts != "전체":
            filtered_ash = filtered_ash[filtered_ash["부품교체"] == ash_parts]

        st.markdown('<div class="section-header">A/S 완료 이력</div>', unsafe_allow_html=True)
        st.dataframe(filtered_ash, use_container_width=True, hide_index=True)
        st.caption(f"총 {len(filtered_ash)}건")

        # Statistics charts
        ash_chart1, ash_chart2 = st.columns(2)

        with ash_chart1:
            st.markdown('<div class="section-header">고객사별 A/S 건수</div>', unsafe_allow_html=True)
            cust_as_stats = AS_HISTORY.groupby("고객사").size().reset_index(name="건수").sort_values("건수", ascending=False)
            fig_as_bar = px.bar(
                cust_as_stats,
                x="고객사",
                y="건수",
                color="건수",
                color_continuous_scale="Oranges",
                title="고객사별 A/S 발생 건수",
                text="건수",
            )
            fig_as_bar.update_layout(
                paper_bgcolor="#0e1117",
                plot_bgcolor="#1e2130",
                font_color="#e2e8f0",
                title_font_size=13,
                coloraxis_showscale=False,
                xaxis_tickangle=-30,
                margin=dict(l=20, r=20, t=40, b=60),
                height=320,
            )
            fig_as_bar.update_traces(textposition="outside")
            st.plotly_chart(fig_as_bar, use_container_width=True)

        with ash_chart2:
            st.markdown('<div class="section-header">증상 유형별 분포</div>', unsafe_allow_html=True)
            type_stats = AS_HISTORY.groupby("증상분류").size().reset_index(name="건수")
            fig_as_pie = px.pie(
                type_stats,
                names="증상분류",
                values="건수",
                title="A/S 증상 유형별 분포",
                color_discrete_sequence=px.colors.sequential.Blues_r,
                hole=0.4,
            )
            fig_as_pie.update_layout(
                paper_bgcolor="#0e1117",
                font_color="#e2e8f0",
                title_font_size=13,
                margin=dict(l=20, r=20, t=40, b=20),
                height=320,
            )
            st.plotly_chart(fig_as_pie, use_container_width=True)

        # Avg processing days by type
        st.markdown('<div class="section-header">증상 유형별 평균 처리 일수</div>', unsafe_allow_html=True)
        avg_days = (
            AS_HISTORY.groupby("증상분류")["처리일수"]
            .mean()
            .reset_index()
            .rename(columns={"처리일수": "평균처리일수"})
            .sort_values("평균처리일수", ascending=True)
        )
        fig_days = px.bar(
            avg_days,
            x="평균처리일수",
            y="증상분류",
            orientation="h",
            color="평균처리일수",
            color_continuous_scale="RdYlGn_r",
            title="증상 유형별 평균 처리 일수",
            text=avg_days["평균처리일수"].round(1),
        )
        fig_days.update_layout(
            paper_bgcolor="#0e1117",
            plot_bgcolor="#1e2130",
            font_color="#e2e8f0",
            title_font_size=13,
            coloraxis_showscale=False,
            margin=dict(l=20, r=20, t=40, b=20),
            height=280,
        )
        fig_days.update_traces(textposition="outside")
        fig_days.update_xaxes(gridcolor="#374151")
        st.plotly_chart(fig_days, use_container_width=True)
