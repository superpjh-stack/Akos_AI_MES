"""04_FAT관리.py — Factory Acceptance Test (FAT) 관리 모듈

Akos AI MES · FAT Management Page
탭 구성:
  1. FAT 계획
  2. 체크리스트
  3. FAT 실행 (모바일 최적화)
  4. FAT AI Agent
  5. 결과/리포트
  6. 재검사
"""

import streamlit as st
import httpx
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from components.kpi_card import render_kpi_card
from components.charts import fat_pie_chart, render_defect_bar, render_shap_bar

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# ---------------------------------------------------------------------------
# Page config & global styles
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="FAT 관리 | Akos AI MES",
    page_icon="🔬",
    layout="wide",
)

st.markdown("""
<style>
/* Global dark card */
.fat-card {
    background: #1e2130;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
}
/* Status badges */
.badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
}
.badge-진행중 { background: #1a3a5c; color: #4f8ef7; }
.badge-완료   { background: #1a3a1a; color: #2ecc71; }
.badge-예정   { background: #3a3a1a; color: #f39c12; }
.badge-불합격 { background: #4a1a1a; color: #e74c3c; }
.badge-보류   { background: #2d2d2d; color: #9ba3af; }
/* Alert card */
.alert-danger {
    background: #4a1a1a;
    border-left: 5px solid #e74c3c;
    border-radius: 6px;
    padding: 12px 16px;
    color: #f0f2f6;
    margin: 8px 0;
}
.alert-success {
    background: #1a3a1a;
    border-left: 5px solid #2ecc71;
    border-radius: 6px;
    padding: 12px 16px;
    color: #f0f2f6;
    margin: 8px 0;
}
.alert-warning {
    background: #3a3a1a;
    border-left: 5px solid #f39c12;
    border-radius: 6px;
    padding: 12px 16px;
    color: #f0f2f6;
    margin: 8px 0;
}
/* Section header */
.section-header {
    font-size: 1.05rem;
    font-weight: 700;
    color: #f0f2f6;
    border-bottom: 2px solid #4f8ef7;
    padding-bottom: 6px;
    margin: 16px 0 12px 0;
}
</style>
""", unsafe_allow_html=True)

st.title("🔬 FAT 관리 — Factory Acceptance Test")

# ---------------------------------------------------------------------------
# Mock data
# ---------------------------------------------------------------------------
FAT_PLANS = [
    {"FAT번호": "FAT-2024-001", "설비명": "컨베이어 시스템 A", "고객사": "(주)삼성전자", "계획일": "2024-06-10", "검사자": "김철수", "상태": "완료", "완료율": 100},
    {"FAT번호": "FAT-2024-002", "설비명": "로봇암 6축 B", "고객사": "현대자동차", "계획일": "2024-06-12", "검사자": "이영희", "상태": "진행중", "완료율": 65},
    {"FAT번호": "FAT-2024-003", "설비명": "CNC 머시닝센터 C", "고객사": "LG전자", "계획일": "2024-06-14", "검사자": "박민준", "상태": "진행중", "완료율": 40},
    {"FAT번호": "FAT-2024-004", "설비명": "프레스 자동화 D", "고객사": "포스코", "계획일": "2024-06-15", "검사자": "최수진", "상태": "예정", "완료율": 0},
    {"FAT번호": "FAT-2024-005", "설비명": "비전 검사장비 E", "고객사": "SK하이닉스", "계획일": "2024-06-08", "검사자": "정대호", "상태": "완료", "완료율": 100},
    {"FAT번호": "FAT-2024-006", "설비명": "용접 로봇 F", "고객사": "현대중공업", "계획일": "2024-06-09", "검사자": "강지원", "상태": "불합격", "완료율": 100},
    {"FAT번호": "FAT-2024-007", "설비명": "AGV 자율주행 G", "고객사": "CJ물류", "계획일": "2024-06-16", "검사자": "윤성호", "상태": "진행중", "완료율": 20},
    {"FAT번호": "FAT-2024-008", "설비명": "스크류 조립기 H", "고객사": "(주)만도", "계획일": "2024-06-17", "검사자": "임혜진", "상태": "예정", "완료율": 0},
]

CHECKLIST_TEMPLATES = [
    {"템플릿ID": "TPL-001", "설비유형": "컨베이어", "항목수": 32, "최종수정일": "2024-05-20", "사용횟수": 14},
    {"템플릿ID": "TPL-002", "설비유형": "로봇암", "항목수": 45, "최종수정일": "2024-05-28", "사용횟수": 9},
    {"템플릿ID": "TPL-003", "설비유형": "CNC 가공기", "항목수": 38, "최종수정일": "2024-06-01", "사용횟수": 7},
    {"템플릿ID": "TPL-004", "설비유형": "프레스", "항목수": 27, "최종수정일": "2024-04-15", "사용횟수": 5},
    {"템플릿ID": "TPL-005", "설비유형": "검사장비", "항목수": 22, "최종수정일": "2024-06-03", "사용횟수": 11},
]

CHECKLIST_ITEMS = [
    {"순번": 1,  "검사항목": "외관 및 도장 상태",     "판정기준": "육안검사",   "측정방법": "육안",     "합격기준Min": None, "합격기준Max": None, "단위": "-",   "필수여부": True},
    {"순번": 2,  "검사항목": "납땜 상태 점검",         "판정기준": "IPC-A-610",  "측정방법": "현미경",   "합격기준Min": None, "합격기준Max": None, "단위": "-",   "필수여부": True},
    {"순번": 3,  "검사항목": "절연저항 측정",           "판정기준": "≥1000MΩ",   "측정방법": "절연저항계","합격기준Min": 1000, "합격기준Max": None, "단위": "MΩ",  "필수여부": True},
    {"순번": 4,  "검사항목": "접지저항 측정",           "판정기준": "≤0.1Ω",     "측정방법": "저항계",   "합격기준Min": 0,    "합격기준Max": 0.1,  "단위": "Ω",   "필수여부": True},
    {"순번": 5,  "검사항목": "전원 전압 확인",          "판정기준": "220V±10%",  "측정방법": "멀티미터", "합격기준Min": 198,  "합격기준Max": 242,  "단위": "V",   "필수여부": True},
    {"순번": 6,  "검사항목": "전류 소비량 측정",        "판정기준": "≤15A",       "측정방법": "클램프미터","합격기준Min": 0,    "합격기준Max": 15,   "단위": "A",   "필수여부": True},
    {"순번": 7,  "검사항목": "모터 회전수 확인",        "판정기준": "1450±50rpm", "측정방법": "타코미터", "합격기준Min": 1400, "합격기준Max": 1500, "단위": "rpm", "필수여부": True},
    {"순번": 8,  "검사항목": "벨트 장력 측정",          "판정기준": "50~70N",     "측정방법": "장력계",   "합격기준Min": 50,   "합격기준Max": 70,   "단위": "N",   "필수여부": False},
    {"순번": 9,  "검사항목": "속도 정밀도 확인",        "판정기준": "±2%이내",    "측정방법": "엔코더",   "합격기준Min": -2,   "합격기준Max": 2,    "단위": "%",   "필수여부": True},
    {"순번": 10, "검사항목": "비상정지 기능 시험",      "판정기준": "0.5초 이내", "측정방법": "스톱워치", "합격기준Min": 0,    "합격기준Max": 0.5,  "단위": "s",   "필수여부": True},
    {"순번": 11, "검사항목": "과부하 보호 기능 시험",   "판정기준": "정격의110%", "측정방법": "동작시험", "합격기준Min": None, "합격기준Max": None, "단위": "-",   "필수여부": True},
    {"순번": 12, "검사항목": "소음 레벨 측정",          "판정기준": "≤75dB",      "측정방법": "소음계",   "합격기준Min": 0,    "합격기준Max": 75,   "단위": "dB",  "필수여부": False},
    {"순번": 13, "검사항목": "진동 레벨 측정",          "판정기준": "≤2.5mm/s",   "측정방법": "진동계",   "합격기준Min": 0,    "합격기준Max": 2.5,  "단위": "mm/s","필수여부": False},
    {"순번": 14, "검사항목": "온도 상승 시험",          "판정기준": "주위온도+40℃","측정방법": "열화상",  "합격기준Min": None, "합격기준Max": 60,   "단위": "℃",  "필수여부": True},
    {"순번": 15, "검사항목": "반복 위치 정밀도",        "판정기준": "±0.05mm",    "측정방법": "레이저트래커","합격기준Min": -0.05,"합격기준Max": 0.05,"단위": "mm", "필수여부": True},
    {"순번": 16, "검사항목": "통신 인터페이스 확인",    "판정기준": "프로토콜 일치","측정방법": "통신분석기","합격기준Min": None, "합격기준Max": None, "단위": "-",  "필수여부": True},
    {"순번": 17, "검사항목": "센서 동작 확인",          "판정기준": "전체 동작",   "측정방법": "기능시험", "합격기준Min": None, "합격기준Max": None, "단위": "-",   "필수여부": True},
    {"순번": 18, "검사항목": "안전 인터락 기능 시험",   "판정기준": "정상 동작",   "측정방법": "기능시험", "합격기준Min": None, "합격기준Max": None, "단위": "-",   "필수여부": True},
    {"순번": 19, "검사항목": "HMI 화면 동작 확인",      "판정기준": "오류 없음",   "측정방법": "화면확인", "합격기준Min": None, "합격기준Max": None, "단위": "-",   "필수여부": False},
    {"순번": 20, "검사항목": "실부하 연속 운전 시험",   "판정기준": "4시간 무결함","측정방법": "연속운전", "합격기준Min": None, "합격기준Max": None, "단위": "-",   "필수여부": True},
]

EXECUTION_ITEMS = [
    {"항목": "절연저항 측정",       "기준": "≥1000MΩ",   "min": 1000, "max": None, "단위": "MΩ",   "ai_정상": "998~1250 MΩ"},
    {"항목": "접지저항 측정",       "기준": "≤0.1Ω",     "min": 0,    "max": 0.1,  "단위": "Ω",    "ai_정상": "0.02~0.09 Ω"},
    {"항목": "전원 전압 확인",      "기준": "220V±10%",  "min": 198,  "max": 242,  "단위": "V",    "ai_정상": "215~225 V"},
    {"항목": "모터 회전수 확인",    "기준": "1450±50rpm","min": 1400, "max": 1500, "단위": "rpm",  "ai_정상": "1445~1460 rpm"},
    {"항목": "속도 정밀도",         "기준": "±2%이내",   "min": -2,   "max": 2,    "단위": "%",    "ai_정상": "-0.5~0.5 %"},
    {"항목": "비상정지 반응시간",   "기준": "≤0.5s",     "min": 0,    "max": 0.5,  "단위": "s",    "ai_정상": "0.1~0.3 s"},
    {"항목": "소음 레벨",           "기준": "≤75dB",     "min": 0,    "max": 75,   "단위": "dB",   "ai_정상": "62~70 dB"},
    {"항목": "진동 레벨",           "기준": "≤2.5mm/s",  "min": 0,    "max": 2.5,  "단위": "mm/s", "ai_정상": "0.8~1.8 mm/s"},
    {"항목": "온도 상승",           "기준": "≤60℃",     "min": 0,    "max": 60,   "단위": "℃",   "ai_정상": "35~48 ℃"},
    {"항목": "반복 위치 정밀도",    "기준": "±0.05mm",   "min": -0.05,"max": 0.05, "단위": "mm",   "ai_정상": "-0.02~0.02 mm"},
]

DEFECT_LIST = [
    {"불량코드": "DEF-001", "항목": "절연저항 측정",   "측정값": "850MΩ",  "허용값": "≥1000MΩ", "심각도": "중대",   "조치상태": "조치중"},
    {"불량코드": "DEF-002", "항목": "소음 레벨",       "측정값": "82dB",   "허용값": "≤75dB",   "심각도": "경미",   "조치상태": "완료"},
    {"불량코드": "DEF-003", "항목": "진동 레벨",       "측정값": "3.1mm/s","허용값": "≤2.5mm/s","심각도": "경미",   "조치상태": "완료"},
    {"불량코드": "DEF-004", "항목": "접지저항 측정",   "측정값": "0.15Ω", "허용값": "≤0.1Ω",  "심각도": "중대",   "조치상태": "미조치"},
    {"불량코드": "DEF-005", "항목": "반복 위치 정밀도","측정값": "0.08mm", "허용값": "±0.05mm", "심각도": "치명",   "조치상태": "조치중"},
    {"불량코드": "DEF-006", "항목": "온도 상승",       "측정값": "65℃",   "허용값": "≤60℃",   "심각도": "경미",   "조치상태": "완료"},
    {"불량코드": "DEF-007", "항목": "HMI 화면 오류",  "측정값": "오류3건", "허용값": "오류없음", "심각도": "경미",   "조치상태": "완료"},
]

REINSPECT_LIST = [
    {"FAT번호": "FAT-2024-006", "설비명": "용접 로봇 F",    "불량항목수": 3, "재검사요청일": "2024-06-10", "담당자": "강지원", "상태": "대기"},
    {"FAT번호": "FAT-2024-003", "설비명": "CNC 머시닝센터 C","불량항목수": 2, "재검사요청일": "2024-06-13", "담당자": "박민준", "상태": "진행중"},
    {"FAT번호": "FAT-2023-041", "설비명": "프레스 자동화 X", "불량항목수": 1, "재검사요청일": "2024-05-28", "담당자": "최수진", "상태": "완료"},
    {"FAT번호": "FAT-2023-038", "설비명": "컨베이어 시스템 Y","불량항목수": 4,"재검사요청일": "2024-05-15", "담당자": "김철수", "상태": "완료"},
    {"FAT번호": "FAT-2024-002", "설비명": "로봇암 6축 B",   "불량항목수": 1, "재검사요청일": "2024-06-13", "담당자": "이영희", "상태": "대기"},
]

SIMILAR_CASES = [
    {"유사도": "97%", "사례ID": "CASE-2023-108", "설비유형": "컨베이어", "발생일": "2023-11-14", "불량유형": "절연저항 불량", "해결방법": "모터 권선 교체 후 재측정 합격"},
    {"유사도": "91%", "사례ID": "CASE-2023-092", "설비유형": "컨베이어", "발생일": "2023-09-22", "불량유형": "절연저항 불량", "해결방법": "습기 제거 및 건조 처리 후 합격"},
    {"유사도": "85%", "사례ID": "CASE-2024-011", "설비유형": "로봇암",   "발생일": "2024-01-08", "불량유형": "접지저항 초과", "해결방법": "접지선 규격 상향(2.5→6mm²) 후 합격"},
    {"유사도": "78%", "사례ID": "CASE-2023-075", "설비유형": "CNC가공기","발생일": "2023-07-30", "불량유형": "진동 초과",    "해결방법": "방진 패드 추가 설치 후 합격"},
    {"유사도": "72%", "사례ID": "CASE-2022-204", "설비유형": "프레스",   "발생일": "2022-12-05", "불량유형": "위치 정밀도 불량","해결방법": "서보모터 게인 튜닝 및 재조정 합격"},
]

STATUS_COLOR = {
    "진행중": "#4f8ef7",
    "완료":   "#2ecc71",
    "예정":   "#f39c12",
    "불합격": "#e74c3c",
    "보류":   "#9ba3af",
}

# ---------------------------------------------------------------------------
# Tab layout
# ---------------------------------------------------------------------------
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "📅 FAT 계획",
    "☑️ 체크리스트",
    "🔬 FAT 실행",
    "🤖 FAT AI Agent",
    "📊 결과/리포트",
    "🔁 재검사",
])

# ===========================================================================
# TAB 1 — FAT 계획
# ===========================================================================
with tab1:
    st.markdown("### FAT 계획 현황")

    # KPI row
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        render_kpi_card("진행중 FAT", "5", color="#4f8ef7")
    with k2:
        render_kpi_card("완료 FAT", "23", delta="+3", color="#2ecc71")
    with k3:
        render_kpi_card("예정 FAT", "3", color="#f39c12")
    with k4:
        render_kpi_card("불합격 FAT", "1", color="#e74c3c")

    st.markdown("<br>", unsafe_allow_html=True)

    sub1_a, sub1_b = st.tabs(["FAT 일정 목록", "FAT 계획 등록"])

    # --- 일정 목록 ---
    with sub1_a:
        st.markdown('<div class="section-header">FAT 일정 목록</div>', unsafe_allow_html=True)

        # Filter row
        fc1, fc2, _ = st.columns([2, 2, 4])
        with fc1:
            filter_status = st.selectbox("상태 필터", ["전체", "진행중", "완료", "예정", "불합격"], key="plan_filter_status")
        with fc2:
            filter_customer = st.selectbox("고객사 필터", ["전체"] + list({p["고객사"] for p in FAT_PLANS}), key="plan_filter_customer")

        filtered = FAT_PLANS
        if filter_status != "전체":
            filtered = [p for p in filtered if p["상태"] == filter_status]
        if filter_customer != "전체":
            filtered = [p for p in filtered if p["고객사"] == filter_customer]

        for plan in filtered:
            with st.container():
                col_a, col_b, col_c, col_d, col_e = st.columns([2, 2.5, 1.5, 1.5, 1])
                badge_html = f'<span class="badge badge-{plan["상태"]}">{plan["상태"]}</span>'
                with col_a:
                    st.markdown(f"**{plan['FAT번호']}**  \n{plan['설비명']}", unsafe_allow_html=False)
                with col_b:
                    st.markdown(f"**고객사:** {plan['고객사']}  \n**검사자:** {plan['검사자']}")
                with col_c:
                    st.markdown(f"**계획일**  \n{plan['계획일']}")
                with col_d:
                    st.markdown(badge_html + f"  \n완료율 **{plan['완료율']}%**", unsafe_allow_html=True)
                    if plan['완료율'] > 0:
                        st.progress(plan['완료율'] / 100)
                with col_e:
                    if st.button("상세보기", key=f"detail_{plan['FAT번호']}"):
                        st.session_state[f"show_detail_{plan['FAT번호']}"] = True

                # Detail expander
                if st.session_state.get(f"show_detail_{plan['FAT번호']}", False):
                    with st.expander(f"{plan['FAT번호']} 상세 정보", expanded=True):
                        dc1, dc2 = st.columns(2)
                        with dc1:
                            st.markdown(f"""
**FAT 번호:** {plan['FAT번호']}
**설비명:** {plan['설비명']}
**고객사:** {plan['고객사']}
**계획일:** {plan['계획일']}
                            """)
                        with dc2:
                            st.markdown(f"""
**검사자:** {plan['검사자']}
**상태:** {plan['상태']}
**완료율:** {plan['완료율']}%
**체크리스트 템플릿:** TPL-001
                            """)
                        if st.button("닫기", key=f"close_{plan['FAT번호']}"):
                            st.session_state[f"show_detail_{plan['FAT번호']}"] = False
                            st.rerun()

                st.markdown("---")

    # --- 계획 등록 ---
    with sub1_b:
        st.markdown('<div class="section-header">FAT 계획 등록</div>', unsafe_allow_html=True)
        with st.form("fat_plan_form"):
            fc1, fc2 = st.columns(2)
            with fc1:
                proj = st.text_input("프로젝트명", placeholder="예: 삼성전자 FA라인 증설")
                equip = st.text_input("설비명", placeholder="예: 컨베이어 시스템 A-3")
                planned_date = st.date_input("검사 예정일", value=datetime.today() + timedelta(days=7))
            with fc2:
                inspector = st.selectbox("검사자", ["김철수", "이영희", "박민준", "최수진", "정대호", "강지원", "윤성호", "임혜진"])
                template = st.selectbox("체크리스트 템플릿", [f"{t['템플릿ID']} — {t['설비유형']} ({t['항목수']}항목)" for t in CHECKLIST_TEMPLATES])
                customer_attend = st.radio("고객 참석 여부", ["참석", "불참", "원격 참관"], horizontal=True)
            notes = st.text_area("비고 / 특이사항", placeholder="고객 요구사항, 특별 검사 항목 등 입력")
            submitted = st.form_submit_button("FAT 계획 등록", use_container_width=True, type="primary")
            if submitted:
                if proj and equip:
                    st.success(f"FAT 계획이 등록되었습니다. (프로젝트: {proj}, 설비: {equip}, 날짜: {planned_date})")
                else:
                    st.error("프로젝트명과 설비명을 입력해주세요.")

# ===========================================================================
# TAB 2 — 체크리스트
# ===========================================================================
with tab2:
    st.markdown("### 검사 체크리스트 관리")
    sub2_a, sub2_b, sub2_c = st.tabs(["템플릿 목록", "항목 편집", "배포"])

    # --- 템플릿 목록 ---
    with sub2_a:
        st.markdown('<div class="section-header">체크리스트 템플릿 목록</div>', unsafe_allow_html=True)
        for t in CHECKLIST_TEMPLATES:
            with st.container():
                tc1, tc2, tc3, tc4, tc5 = st.columns([1.2, 2, 1, 1.5, 1])
                with tc1:
                    st.markdown(f"**{t['템플릿ID']}**")
                with tc2:
                    st.markdown(f"**{t['설비유형']}**")
                with tc3:
                    st.markdown(f"항목 수: **{t['항목수']}**")
                with tc4:
                    st.markdown(f"최종수정: {t['최종수정일']}  \n사용: **{t['사용횟수']}**회")
                with tc5:
                    st.button("편집", key=f"edit_tpl_{t['템플릿ID']}", use_container_width=True)
            st.markdown("---")

    # --- 항목 편집 ---
    with sub2_b:
        st.markdown('<div class="section-header">체크리스트 항목 편집</div>', unsafe_allow_html=True)
        selected_tpl = st.selectbox(
            "편집할 템플릿 선택",
            [f"{t['템플릿ID']} — {t['설비유형']}" for t in CHECKLIST_TEMPLATES],
            key="edit_tpl_select",
        )
        st.info(f"선택된 템플릿: **{selected_tpl}** — 아래 표에서 직접 편집 후 저장하세요.")

        df_checklist = pd.DataFrame(CHECKLIST_ITEMS)
        edited_df = st.data_editor(
            df_checklist,
            use_container_width=True,
            num_rows="dynamic",
            column_config={
                "순번":         st.column_config.NumberColumn("순번", width="small"),
                "검사항목":     st.column_config.TextColumn("검사항목", width="large"),
                "판정기준":     st.column_config.TextColumn("판정기준"),
                "측정방법":     st.column_config.TextColumn("측정방법"),
                "합격기준Min":  st.column_config.NumberColumn("합격기준Min", format="%.3f"),
                "합격기준Max":  st.column_config.NumberColumn("합격기준Max", format="%.3f"),
                "단위":         st.column_config.TextColumn("단위", width="small"),
                "필수여부":     st.column_config.CheckboxColumn("필수여부", width="small"),
            },
            key="checklist_editor",
        )
        save_col, _ = st.columns([2, 6])
        with save_col:
            if st.button("변경사항 저장", type="primary", use_container_width=True):
                st.success(f"템플릿 저장 완료 — {len(edited_df)}개 항목이 저장되었습니다.")

    # --- 배포 ---
    with sub2_c:
        st.markdown('<div class="section-header">체크리스트 배포</div>', unsafe_allow_html=True)
        dist_c1, dist_c2 = st.columns(2)
        with dist_c1:
            deploy_tpl = st.selectbox(
                "배포할 템플릿",
                [f"{t['템플릿ID']} — {t['설비유형']} ({t['항목수']}항목)" for t in CHECKLIST_TEMPLATES],
                key="deploy_tpl",
            )
        with dist_c2:
            deploy_fat = st.multiselect(
                "대상 FAT 선택",
                [p["FAT번호"] + " — " + p["설비명"] for p in FAT_PLANS if p["상태"] in ("진행중", "예정")],
                key="deploy_fat",
            )

        st.markdown("**배포 옵션**")
        opt_c1, opt_c2 = st.columns(2)
        with opt_c1:
            notify_inspector = st.checkbox("검사자에게 알림 전송", value=True)
            notify_customer = st.checkbox("고객사에게 배포 알림", value=False)
        with opt_c2:
            deploy_note = st.text_area("배포 메모", placeholder="배포 관련 특이사항 입력", height=80)

        if st.button("체크리스트 배포", type="primary", use_container_width=True, key="deploy_btn"):
            if deploy_fat:
                st.success(f"체크리스트 **{deploy_tpl}** 이(가) {len(deploy_fat)}개 FAT에 배포되었습니다.")
                for fat_item in deploy_fat:
                    st.markdown(f"- {fat_item} ✅")
            else:
                st.warning("배포 대상 FAT를 선택해주세요.")

# ===========================================================================
# TAB 3 — FAT 실행 (모바일 최적화)
# ===========================================================================
with tab3:
    # Mobile-optimized CSS
    st.markdown("""
    <style>
    /* Mobile-optimized FAT execution UI */
    .mobile-header {
        font-size: 1.3rem;
        font-weight: 700;
        color: #4f8ef7;
        text-align: center;
        padding: 8px 0 4px 0;
    }
    .mobile-item-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: #f0f2f6;
    }
    .mobile-spec {
        font-size: 0.9rem;
        color: #9ba3af;
    }
    .ai-ok {
        background: #1a3a1a;
        border: 1px solid #2ecc71;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 0.85rem;
        color: #2ecc71;
        margin: 4px 0;
    }
    .ai-warn {
        background: #4a1a1a;
        border: 1px solid #e74c3c;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 0.85rem;
        color: #e74c3c;
        margin: 4px 0;
    }
    .big-submit-btn > button {
        height: 56px !important;
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        border-radius: 10px !important;
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="mobile-header">🔬 FAT 현장 실행</div>', unsafe_allow_html=True)

    # FAT 선택
    exec_fat = st.selectbox(
        "검사 FAT 선택",
        [f"{p['FAT번호']} | {p['설비명']} | {p['고객사']}" for p in FAT_PLANS if p["상태"] in ("진행중", "예정")],
        key="exec_fat_select",
    )
    st.markdown(f"**검사자:** 이영희 &nbsp;|&nbsp; **계획일:** 2024-06-12 &nbsp;|&nbsp; **고객사:** 현대자동차")

    # Progress
    if "exec_results" not in st.session_state:
        st.session_state.exec_results = {}

    completed = sum(1 for k, v in st.session_state.exec_results.items() if v.get("판정") in ("합격", "불합격"))
    total = len(EXECUTION_ITEMS)
    st.markdown(f"**진행률:** {completed}/{total} 항목 완료")
    st.progress(completed / total if total > 0 else 0)

    st.markdown("---")
    st.markdown("#### 검사 항목 입력")

    for i, item in enumerate(EXECUTION_ITEMS):
        key_base = f"exec_{i}"
        with st.expander(f"{'✅' if st.session_state.exec_results.get(key_base, {}).get('판정') == '합격' else '❌' if st.session_state.exec_results.get(key_base, {}).get('판정') == '불합격' else '⬜'} {item['항목']}", expanded=False):
            st.markdown(f'<div class="mobile-spec">판정기준: {item["기준"]} &nbsp;|&nbsp; 단위: {item["단위"]}</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="ai-ok">🤖 AI 정상범위: {item["ai_정상"]}</div>', unsafe_allow_html=True)

            ex_c1, ex_c2 = st.columns([2, 1])
            with ex_c1:
                meas_val = st.number_input(
                    f"측정값 ({item['단위']})",
                    min_value=None,
                    value=None,
                    format="%.3f",
                    key=f"{key_base}_val",
                    placeholder="측정값 입력",
                )
            with ex_c2:
                verdict = st.radio(
                    "판정",
                    ["합격", "불합격", "보류"],
                    key=f"{key_base}_verdict",
                    horizontal=False,
                )

            # AI range check feedback
            if meas_val is not None and item["max"] is not None:
                if item["min"] is not None and (meas_val < item["min"] or meas_val > item["max"]):
                    st.markdown(f'<div class="ai-warn">⚠️ 측정값 {meas_val}{item["단위"]} 이(가) 허용 범위를 벗어났습니다!</div>', unsafe_allow_html=True)
                else:
                    st.markdown(f'<div class="ai-ok">✅ 측정값 {meas_val}{item["단위"]} — 허용 범위 내</div>', unsafe_allow_html=True)

            photo = st.file_uploader("사진 첨부", type=["jpg", "jpeg", "png"], key=f"{key_base}_photo", label_visibility="collapsed")
            memo = st.text_input("검사 메모", key=f"{key_base}_memo", placeholder="특이사항 입력 (선택)")

            if st.button("저장", key=f"{key_base}_save", use_container_width=True):
                st.session_state.exec_results[key_base] = {
                    "항목": item["항목"],
                    "측정값": meas_val,
                    "판정": verdict,
                    "메모": memo,
                }
                st.success(f"저장 완료: {item['항목']} — {verdict}")
                st.rerun()

    # 불량 등록
    st.markdown("---")
    st.markdown("#### 불량 즉시 등록")
    with st.expander("➕ 불량 등록", expanded=False):
        def_c1, def_c2 = st.columns(2)
        with def_c1:
            def_item = st.selectbox("불량 발생 항목", [item["항목"] for item in EXECUTION_ITEMS], key="def_item")
            def_code = st.text_input("불량코드", placeholder="예: DEF-008", key="def_code")
        with def_c2:
            def_loc = st.text_input("불량 위치", placeholder="예: 3번 롤러 우측", key="def_loc")
            def_severity = st.selectbox("심각도", ["경미", "중대", "치명"], key="def_severity")
        def_desc = st.text_area("불량 설명", placeholder="불량 내용 상세 기술", key="def_desc")
        def_photo = st.file_uploader("불량 사진", type=["jpg", "jpeg", "png"], key="def_photo")
        if st.button("불량 등록", type="primary", use_container_width=True, key="def_register"):
            st.error(f"불량 등록 완료: {def_item} — {def_severity} 심각도")

    # Submit button
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="big-submit-btn">', unsafe_allow_html=True)
    if st.button("✅ 검사 완료 제출", type="primary", use_container_width=True, key="exec_submit"):
        if completed == total:
            st.success("검사가 완료되었습니다. 결과가 제출되었습니다.")
            st.balloons()
        else:
            st.warning(f"아직 {total - completed}개 항목이 미완료입니다. 모든 항목 입력 후 제출해주세요.")
    st.markdown("</div>", unsafe_allow_html=True)

# ===========================================================================
# TAB 4 — FAT AI Agent
# ===========================================================================
with tab4:
    st.markdown("### 🤖 FAT AI Agent")
    ai_sub1, ai_sub2, ai_sub3, ai_sub4 = st.tabs(["AI 검사 보조", "불량 원인 분석", "AI 검사 리포트", "유사 사례 검색"])

    # --- AI 검사 보조 ---
    with ai_sub1:
        st.markdown('<div class="section-header">AI 검사 보조</div>', unsafe_allow_html=True)
        st.markdown("측정값을 입력하면 AI가 정상 여부를 즉시 판단합니다.")

        with st.form("ai_assist_form"):
            aa_c1, aa_c2, aa_c3 = st.columns(3)
            with aa_c1:
                aa_item = st.selectbox("검사 항목", [item["항목"] for item in EXECUTION_ITEMS], key="aa_item")
            with aa_c2:
                aa_val = st.number_input("측정값", value=0.82, format="%.3f", key="aa_val")
            with aa_c3:
                aa_unit = st.text_input("단위", value="Ω", key="aa_unit")
            aa_submit = st.form_submit_button("🔍 AI 분석", use_container_width=True, type="primary")

        if aa_submit:
            # Mock AI response based on item
            selected_item = next((item for item in EXECUTION_ITEMS if item["항목"] == aa_item), EXECUTION_ITEMS[0])
            in_range = True
            if selected_item["max"] is not None and aa_val > selected_item["max"]:
                in_range = False
            if selected_item["min"] is not None and aa_val < selected_item["min"]:
                in_range = False

            if in_range:
                st.markdown(f"""
<div class="alert-success">
<b>✅ AI 분석 결과 — 정상</b><br>
측정값 <b>{aa_val}{aa_unit}</b> — 정상범위({selected_item['ai_정상']}) 내에 있습니다.<br>
신뢰도: <b>94%</b> &nbsp;|&nbsp; 판정: <b>합격</b>
</div>
""", unsafe_allow_html=True)
            else:
                st.markdown(f"""
<div class="alert-danger">
<b>🚨 AI 이상 감지 — 범위 초과</b><br>
측정값 <b>{aa_val}{aa_unit}</b> 이(가) 허용 범위({selected_item['기준']})를 벗어났습니다.<br>
신뢰도: <b>97%</b> &nbsp;|&nbsp; 판정: <b>불합격</b><br>
권장 조치: 설비 담당자 즉시 통보 및 원인 조사 필요
</div>
""", unsafe_allow_html=True)

            # Historical trend mock
            st.markdown("**해당 항목 이력 트렌드 (최근 10회)**")
            import random
            random.seed(42)
            hist_df = pd.DataFrame({
                "검사회차": [f"#{i}" for i in range(1, 11)],
                "측정값": [round(random.uniform(0.6, 1.1), 3) for _ in range(10)],
            })
            hist_fig = px.line(
                hist_df, x="검사회차", y="측정값",
                markers=True, title=f"{aa_item} 측정값 이력",
                color_discrete_sequence=["#4f8ef7"],
            )
            hist_fig.add_hline(y=selected_item.get("max") or 1.2, line_dash="dash", line_color="#e74c3c", annotation_text="상한")
            hist_fig.add_hline(y=selected_item.get("min") or 0.5, line_dash="dash", line_color="#f39c12", annotation_text="하한")
            hist_fig.update_layout(paper_bgcolor="#1e2130", plot_bgcolor="#151822", font_color="#f0f2f6", height=280)
            st.plotly_chart(hist_fig, use_container_width=True)

    # --- 불량 원인 분석 ---
    with ai_sub2:
        st.markdown('<div class="section-header">불량 원인 분석 (XGBoost + SHAP)</div>', unsafe_allow_html=True)

        sel_defect = st.selectbox(
            "분석할 불량 선택",
            [f"{d['불량코드']} — {d['항목']} ({d['측정값']})" for d in DEFECT_LIST],
            key="ai_defect_select",
        )

        analyze_btn = st.button("🔬 원인 분석 실행", type="primary", key="analyze_btn")

        if analyze_btn or st.session_state.get("ai_analyzed", False):
            st.session_state.ai_analyzed = True

            st.markdown("""
<div class="alert-warning">
<b>🤖 XGBoost 예측 결과</b><br>
불량 확률: <b>72%</b> &nbsp;|&nbsp; 모델 정확도: 91.3%
</div>
""", unsafe_allow_html=True)

            ca_c1, ca_c2, ca_c3 = st.columns(3)
            with ca_c1:
                render_kpi_card("재료 불량", "38%", color="#e74c3c")
            with ca_c2:
                render_kpi_card("공정 이상", "24%", color="#f39c12")
            with ca_c3:
                render_kpi_card("설계 오류", "10%", color="#4f8ef7")

            st.markdown("<br>", unsafe_allow_html=True)

            # SHAP chart
            shap_features = [
                "절연재 재질",
                "공정온도",
                "작업자 숙련도",
                "장비 노후도",
                "원자재 배치번호",
                "습도",
                "체결 토크",
                "표면 거칠기",
            ]
            shap_values = [0.312, 0.198, -0.145, 0.132, 0.098, -0.076, 0.055, -0.041]
            shap_fig = render_shap_bar(shap_features, shap_values)
            st.plotly_chart(shap_fig, use_container_width=True)

            st.markdown("""
<div class="alert-success">
<b>📋 AI 권장 조치</b><br>
1. 절연재 재질 공급업체 변경 또는 수입 검사 강화<br>
2. 공정 온도 모니터링 강화 (±2℃ 이내 유지)<br>
3. 해당 배치 원자재 전수 재검사 실시
</div>
""", unsafe_allow_html=True)

    # --- AI 검사 리포트 ---
    with ai_sub3:
        st.markdown('<div class="section-header">AI 자동 검사 리포트 생성</div>', unsafe_allow_html=True)

        report_fat = st.selectbox(
            "리포트 생성 FAT 선택",
            [f"{p['FAT번호']} — {p['설비명']}" for p in FAT_PLANS],
            key="report_fat_select",
        )
        gen_report_btn = st.button("📄 AI 리포트 생성", type="primary", key="gen_report_btn")

        if gen_report_btn or st.session_state.get("report_generated", False):
            st.session_state.report_generated = True
            selected_plan = next((p for p in FAT_PLANS if p["FAT번호"] in report_fat), FAT_PLANS[0])

            st.markdown(f"""
<div class="fat-card">
<h4 style="color:#4f8ef7;">📋 FAT 검사 AI 리포트</h4>
<p><b>FAT 번호:</b> {selected_plan['FAT번호']}</p>
<p><b>설비명:</b> {selected_plan['설비명']}</p>
<p><b>고객사:</b> {selected_plan['고객사']}</p>
<p><b>검사일:</b> {selected_plan['계획일']}</p>
<p><b>검사자:</b> {selected_plan['검사자']}</p>
<hr style="border-color:#2d3348;">
<h5 style="color:#f0f2f6;">검사 요약</h5>
<p>총 45개 항목 중 41개 합격, 3개 불합격, 1개 보류로 검사를 완료하였습니다.
합격률 91.1%로 기준치(85%)를 상회하나, 중대 불량 2건이 발견되어 즉각 조치가 필요합니다.</p>
<h5 style="color:#f0f2f6;">주요 발견 사항</h5>
<ul>
  <li>절연저항 측정값 850MΩ — 기준(1000MΩ) 미달 (중대)</li>
  <li>접지저항 0.15Ω — 기준(0.1Ω) 초과 (중대)</li>
  <li>반복 위치 정밀도 0.08mm — 기준(±0.05mm) 초과 (치명)</li>
</ul>
<h5 style="color:#f0f2f6;">AI 권장 조치</h5>
<ul>
  <li>모터 권선 점검 및 절연 처리 강화</li>
  <li>접지선 규격 상향 조치 (2.5→6mm²)</li>
  <li>서보모터 게인 재튜닝 및 백래시 점검</li>
</ul>
<h5 style="color:#f0f2f6;">최종 판정</h5>
<span class="badge badge-불합격">불합격 — 조치 후 재검사 필요</span>
</div>
""", unsafe_allow_html=True)

            mock_pdf_content = f"FAT Report: {selected_plan['FAT번호']}\n설비: {selected_plan['설비명']}\n결과: 불합격\n생성일: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            st.download_button(
                "📥 리포트 PDF 다운로드",
                data=mock_pdf_content.encode("utf-8"),
                file_name=f"FAT_Report_{selected_plan['FAT번호']}.txt",
                mime="text/plain",
                use_container_width=True,
            )

    # --- 유사 사례 검색 ---
    with ai_sub4:
        st.markdown('<div class="section-header">유사 사례 RAG 검색</div>', unsafe_allow_html=True)
        st.markdown("과거 FAT 이력 데이터베이스에서 유사한 불량 사례를 검색합니다.")

        rag_c1, rag_c2 = st.columns([4, 1])
        with rag_c1:
            rag_query = st.text_input(
                "검색어",
                placeholder="예: 절연저항 불량 컨베이어, 위치 정밀도 초과 로봇",
                key="rag_query",
                label_visibility="collapsed",
            )
        with rag_c2:
            rag_search = st.button("🔍 RAG 검색", type="primary", use_container_width=True, key="rag_search")

        if rag_search or (rag_query and st.session_state.get("rag_searched", False)):
            st.session_state.rag_searched = True
            st.markdown(f"**검색 결과: '{rag_query or '절연저항 불량'}'** — 5개 유사 사례 발견")

            for case in SIMILAR_CASES:
                with st.container():
                    sim_score = int(case["유사도"].replace("%", ""))
                    sim_color = "#2ecc71" if sim_score >= 90 else "#f39c12" if sim_score >= 75 else "#9ba3af"
                    st.markdown(f"""
<div class="fat-card">
<span style="color:{sim_color};font-weight:700;font-size:1.1rem;">유사도 {case['유사도']}</span>
&nbsp;&nbsp;<b>{case['사례ID']}</b> — {case['설비유형']} | {case['발생일']}<br>
<b>불량 유형:</b> {case['불량유형']}<br>
<b>해결 방법:</b> <span style="color:#2ecc71;">{case['해결방법']}</span>
</div>
""", unsafe_allow_html=True)

# ===========================================================================
# TAB 5 — 결과/리포트
# ===========================================================================
with tab5:
    st.markdown("### 📊 FAT 결과 및 리포트")

    # KPI row
    r1, r2, r3, r4, r5 = st.columns(5)
    with r1:
        render_kpi_card("총 항목수", "45", color="#4f8ef7")
    with r2:
        render_kpi_card("합격", "41", color="#2ecc71")
    with r3:
        render_kpi_card("불합격", "3", color="#e74c3c")
    with r4:
        render_kpi_card("보류", "1", color="#f39c12")
    with r5:
        render_kpi_card("합격률", "91%", delta="+6%", color="#2ecc71")

    st.markdown("<br>", unsafe_allow_html=True)

    # Charts row
    ch_c1, ch_c2 = st.columns(2)
    with ch_c1:
        pie_data = {"pass": 41, "fail": 3, "pending": 1, "waived": 0}
        pie_fig = fat_pie_chart(pie_data)
        st.plotly_chart(pie_fig, use_container_width=True)

    with ch_c2:
        defect_type_df = pd.DataFrame({
            "defect_type": ["절연저항 불량", "접지저항 초과", "위치 정밀도", "소음 초과", "진동 초과", "온도 초과", "HMI 오류"],
            "count": [4, 3, 5, 2, 3, 2, 1],
        })
        defect_fig = render_defect_bar(defect_type_df)
        st.plotly_chart(defect_fig, use_container_width=True)

    # Defect list
    st.markdown('<div class="section-header">불량 목록</div>', unsafe_allow_html=True)
    df_defects = pd.DataFrame(DEFECT_LIST)

    def color_severity(val):
        if val == "치명":
            return "background-color: #4a1a1a; color: #e74c3c; font-weight: bold;"
        elif val == "중대":
            return "background-color: #3a2a1a; color: #f39c12; font-weight: bold;"
        return "background-color: #1e2130; color: #9ba3af;"

    def color_action(val):
        if val == "완료":
            return "color: #2ecc71; font-weight: bold;"
        elif val == "미조치":
            return "color: #e74c3c; font-weight: bold;"
        return "color: #f39c12;"

    styled_defects = df_defects.style.applymap(color_severity, subset=["심각도"]).applymap(color_action, subset=["조치상태"])
    st.dataframe(styled_defects, use_container_width=True, hide_index=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Report generation
    rep_c1, rep_c2 = st.columns(2)
    with rep_c1:
        st.markdown('<div class="section-header">FAT 보고서 생성</div>', unsafe_allow_html=True)
        report_fat_sel = st.selectbox(
            "보고서 FAT 선택",
            [p["FAT번호"] + " — " + p["설비명"] for p in FAT_PLANS],
            key="report_fat_gen",
        )
        gen_col1, gen_col2 = st.columns(2)
        with gen_col1:
            include_photos = st.checkbox("사진 포함", value=True)
            include_ai = st.checkbox("AI 분석 포함", value=True)
        with gen_col2:
            include_shap = st.checkbox("SHAP 차트 포함", value=False)
            include_trend = st.checkbox("이력 트렌드 포함", value=True)

        if st.button("📄 FAT 보고서 PDF 생성", type="primary", use_container_width=True, key="gen_pdf"):
            mock_report = f"""FAT 검사 보고서
================
FAT: {report_fat_sel}
생성일: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

검사 결과 요약:
- 총 항목수: 45
- 합격: 41 (91.1%)
- 불합격: 3 (6.7%)
- 보류: 1 (2.2%)

최종 판정: 불합격 (조치 후 재검사 필요)
"""
            st.download_button(
                "📥 PDF 다운로드",
                data=mock_report.encode("utf-8"),
                file_name=f"FAT_보고서_{report_fat_sel.split(' ')[0]}.txt",
                mime="text/plain",
                use_container_width=True,
                key="pdf_download",
            )

    with rep_c2:
        st.markdown('<div class="section-header">고객사 공유 리포트</div>', unsafe_allow_html=True)
        share_email = st.text_input("고객사 이메일", placeholder="example@customer.com", key="share_email")
        share_name = st.text_input("수신자 이름", placeholder="홍길동 과장", key="share_name")
        share_msg = st.text_area("첨언 메시지", placeholder="검사 결과 공유드립니다. 불량 항목 조치 후 재검사 예정입니다.", height=80, key="share_msg")
        share_options = st.multiselect(
            "포함 항목",
            ["검사 결과 요약", "불량 목록", "AI 분석", "조치 계획", "사진 첨부"],
            default=["검사 결과 요약", "불량 목록"],
            key="share_options",
        )
        if st.button("📧 고객사 리포트 전송", type="primary", use_container_width=True, key="share_send"):
            if share_email:
                st.success(f"{share_email} 으로 리포트를 전송했습니다.")
            else:
                st.warning("이메일 주소를 입력해주세요.")

# ===========================================================================
# TAB 6 — 재검사
# ===========================================================================
with tab6:
    st.markdown("### 🔁 재검사 관리")

    # KPI
    ri1, ri2, ri3 = st.columns(3)
    with ri1:
        render_kpi_card("재검사 대기", "2", color="#f39c12")
    with ri2:
        render_kpi_card("재검사 진행중", "1", color="#4f8ef7")
    with ri3:
        render_kpi_card("재검사 완료", "2", color="#2ecc71")

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown('<div class="section-header">재검사 요청 목록</div>', unsafe_allow_html=True)

    for req in REINSPECT_LIST:
        with st.container():
            ri_c1, ri_c2, ri_c3, ri_c4, ri_c5 = st.columns([1.8, 2, 1, 1.5, 1.2])
            badge_html = f'<span class="badge badge-{req["상태"]}">{req["상태"]}</span>'
            with ri_c1:
                st.markdown(f"**{req['FAT번호']}**")
            with ri_c2:
                st.markdown(f"**{req['설비명']}**  \n불량항목: **{req['불량항목수']}**개")
            with ri_c3:
                st.markdown(f"담당: {req['담당자']}")
            with ri_c4:
                st.markdown(f"요청일: {req['재검사요청일']}  \n{badge_html}", unsafe_allow_html=True)
            with ri_c5:
                if req["상태"] in ("대기", "진행중"):
                    start_key = f"reinspect_start_{req['FAT번호']}"
                    if st.button("재검사 시작", key=start_key, use_container_width=True, type="primary"):
                        st.session_state[f"reinspect_open_{req['FAT번호']}"] = True

            # Reinspection form
            if st.session_state.get(f"reinspect_open_{req['FAT번호']}", False):
                with st.expander(f"{req['FAT번호']} 재검사 결과 입력", expanded=True):
                    with st.form(f"reinspect_form_{req['FAT번호']}"):
                        rf_c1, rf_c2 = st.columns(2)
                        with rf_c1:
                            ri_date = st.date_input("재검사 일자", value=datetime.today(), key=f"ri_date_{req['FAT번호']}")
                            ri_inspector = st.selectbox("재검사자", ["김철수", "이영희", "박민준", "최수진"], key=f"ri_insp_{req['FAT번호']}")
                        with rf_c2:
                            ri_result = st.selectbox("재검사 결과", ["합격", "불합격", "조건부 합격"], key=f"ri_result_{req['FAT번호']}")
                            ri_items = st.multiselect(
                                "재검사 항목",
                                [item["항목"] for item in EXECUTION_ITEMS],
                                key=f"ri_items_{req['FAT번호']}",
                            )
                        ri_note = st.text_area("재검사 의견", key=f"ri_note_{req['FAT번호']}")
                        ri_photo = st.file_uploader("재검사 증빙 사진", type=["jpg", "png"], key=f"ri_photo_{req['FAT번호']}")
                        ri_submit = st.form_submit_button("재검사 결과 제출", type="primary", use_container_width=True)
                        if ri_submit:
                            st.success(f"재검사 결과 제출 완료: {req['FAT번호']} — {ri_result}")
                            st.session_state[f"reinspect_open_{req['FAT번호']}"] = False

        st.markdown("---")

    # Reinspection history
    st.markdown('<div class="section-header">재검사 이력</div>', unsafe_allow_html=True)
    reinspect_history = pd.DataFrame([
        {"FAT번호": "FAT-2023-041", "설비명": "프레스 자동화 X", "재검사일": "2024-05-30", "재검사자": "최수진", "불량항목수": 1, "결과": "합격",    "의견": "접지선 교체 후 재측정 합격"},
        {"FAT번호": "FAT-2023-038", "설비명": "컨베이어 시스템 Y","재검사일": "2024-05-17","재검사자": "김철수", "불량항목수": 4, "결과": "합격",    "의견": "전체 불량항목 조치 후 합격 판정"},
        {"FAT번호": "FAT-2023-029", "설비명": "CNC 가공기 Z",     "재검사일": "2024-04-02","재검사자": "박민준", "불량항목수": 2, "결과": "조건부합격","의견": "소음 항목 웨이버 처리 후 출하 승인"},
        {"FAT번호": "FAT-2023-020", "설비명": "검사장비 W",       "재검사일": "2024-03-10","재검사자": "이영희", "불량항목수": 1, "결과": "합격",    "의견": "소프트웨어 업데이트 후 HMI 오류 해소"},
        {"FAT번호": "FAT-2023-015", "설비명": "로봇암 V",         "재검사일": "2024-02-21","재검사자": "정대호", "불량항목수": 3, "결과": "불합격",   "의견": "서보모터 교체 후 재재검사 필요"},
    ])

    def color_result(val):
        if val == "합격":
            return "color: #2ecc71; font-weight: bold;"
        elif val == "불합격":
            return "color: #e74c3c; font-weight: bold;"
        return "color: #f39c12; font-weight: bold;"

    styled_history = reinspect_history.style.applymap(color_result, subset=["결과"])
    st.dataframe(styled_history, use_container_width=True, hide_index=True)
