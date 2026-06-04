import streamlit as st
import httpx
import pandas as pd
import plotly.express as px
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from components.kpi_card import render_kpi_card

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="설계/BOM 관리 - Akos AI MES", layout="wide")

# ── Page header ──────────────────────────────────────────────────────────────
st.markdown("""
<style>
.page-header {
    background: linear-gradient(135deg, #1e2130 0%, #2d3250 100%);
    border-left: 5px solid #e67e22;
    border-radius: 8px;
    padding: 18px 24px;
    margin-bottom: 20px;
}
.page-header h2 { color: #f0f2f6; margin: 0 0 4px 0; font-size: 1.5rem; }
.page-header p  { color: #9ba3af; margin: 0; font-size: 0.85rem; }
.badge-approved  { background:#1a5c2e; color:#2ecc71; border-radius:12px; padding:2px 10px; font-size:0.75rem; font-weight:600; }
.badge-in-review { background:#5c3d1a; color:#f39c12; border-radius:12px; padding:2px 10px; font-size:0.75rem; font-weight:600; }
.badge-draft     { background:#2e2e3a; color:#9ba3af; border-radius:12px; padding:2px 10px; font-size:0.75rem; font-weight:600; }
.badge-high  { background:#5c1a1a; color:#e74c3c; border-radius:12px; padding:2px 10px; font-size:0.75rem; font-weight:600; }
.badge-mid   { background:#5c3d1a; color:#f39c12; border-radius:12px; padding:2px 10px; font-size:0.75rem; font-weight:600; }
.badge-low   { background:#1a3a5c; color:#3498db; border-radius:12px; padding:2px 10px; font-size:0.75rem; font-weight:600; }
</style>
<div class="page-header">
  <h2>📐 설계 / BOM 관리</h2>
  <p>제품 BOM 등록 · 버전 관리 · 부품 마스터 · 도면 관리 · 설계 변경 요청(ECR/ECO)</p>
</div>
""", unsafe_allow_html=True)

# ── Top KPI strip ─────────────────────────────────────────────────────────────
k1, k2, k3, k4, k5 = st.columns(5)
with k1:
    render_kpi_card("총 BOM 수", "47", "+3", "#e67e22")
with k2:
    render_kpi_card("승인 완료", "31", "+1", "#2ecc71")
with k3:
    render_kpi_card("검토 중", "9", "-2", "#f39c12")
with k4:
    render_kpi_card("대기 ECR", "6", "+2", "#e74c3c")
with k5:
    render_kpi_card("등록 부품 수", "1,284", "+18", "#3498db")

st.markdown("<br>", unsafe_allow_html=True)

# ── Mock data helpers ─────────────────────────────────────────────────────────

CUSTOMERS = ["전체", "삼성전자", "LG이노텍", "현대모비스", "SK하이닉스", "포스코", "한화시스템", "두산에너빌리티"]
CUSTOMERS_NO_ALL = CUSTOMERS[1:]
PROJECTS = ["PRJ-2024-001 스마트팩토리A", "PRJ-2024-002 반도체라인", "PRJ-2024-003 배터리팩", "PRJ-2024-004 자동화로봇", "PRJ-2025-001 AI검사기"]
STATUSES = ["전체", "DRAFT", "IN_REVIEW", "APPROVED"]

def mock_bom_list():
    return pd.DataFrame([
        {"BOM번호": "BOM-2024-001", "설비명": "자동 조립 로봇 A형",       "고객사": "삼성전자",   "버전": "v1.3", "상태": "APPROVED",  "작성일": "2024-11-05", "담당자": "김철수"},
        {"BOM번호": "BOM-2024-002", "설비명": "반도체 핸들러 B형",         "고객사": "SK하이닉스", "버전": "v2.0", "상태": "IN_REVIEW", "작성일": "2024-11-18", "담당자": "이영희"},
        {"BOM번호": "BOM-2024-003", "설비명": "배터리 팩 조립 장치",       "고객사": "LG이노텍",   "버전": "v1.0", "상태": "DRAFT",     "작성일": "2024-12-01", "담당자": "박민준"},
        {"BOM번호": "BOM-2024-004", "설비명": "비전 검사 시스템 C형",      "고객사": "현대모비스", "버전": "v1.1", "상태": "APPROVED",  "작성일": "2024-10-22", "담당자": "최수진"},
        {"BOM번호": "BOM-2024-005", "설비명": "레이저 용접 장비",          "고객사": "포스코",     "버전": "v3.1", "상태": "APPROVED",  "작성일": "2024-09-15", "담당자": "정대한"},
        {"BOM번호": "BOM-2024-006", "설비명": "스크류 체결 유닛",          "고객사": "삼성전자",   "버전": "v1.0", "상태": "DRAFT",     "작성일": "2024-12-10", "담당자": "강보람"},
        {"BOM번호": "BOM-2024-007", "설비명": "컨베이어 이송 시스템",      "고객사": "한화시스템", "버전": "v2.2", "상태": "IN_REVIEW", "작성일": "2024-11-28", "담당자": "윤성민"},
        {"BOM번호": "BOM-2024-008", "설비명": "CNC 가공 센터 D형",         "고객사": "두산에너빌리티","버전": "v1.5","상태": "APPROVED", "작성일": "2024-10-05", "담당자": "한지은"},
        {"BOM번호": "BOM-2025-001", "설비명": "AI 광학 검사기",            "고객사": "LG이노텍",   "버전": "v0.9", "상태": "IN_REVIEW", "작성일": "2025-01-08", "담당자": "오재원"},
        {"BOM번호": "BOM-2025-002", "설비명": "다축 로봇 그리퍼 시스템",  "고객사": "현대모비스", "버전": "v1.0", "상태": "DRAFT",     "작성일": "2025-01-20", "담당자": "임채린"},
    ])

def mock_version_history():
    return pd.DataFrame([
        {"버전": "v1.3", "변경일": "2024-11-05", "변경자": "김철수", "변경 내용": "서보모터 스펙 상향 (400W→750W)",      "상태": "APPROVED"},
        {"버전": "v1.2", "변경일": "2024-10-11", "변경자": "이영희", "변경 내용": "볼스크류 공급사 변경 (A→B사)",          "상태": "APPROVED"},
        {"버전": "v1.1", "변경일": "2024-09-03", "변경자": "박민준", "변경 내용": "제어반 방열 설계 보강",                 "상태": "APPROVED"},
        {"버전": "v1.0", "변경일": "2024-07-20", "변경자": "김철수", "변경 내용": "최초 BOM 등록",                        "상태": "APPROVED"},
        {"버전": "v0.9", "변경일": "2024-06-15", "변경자": "최수진", "변경 내용": "초안 작성 (견적용)",                   "상태": "DRAFT"},
    ])

def mock_parts():
    return pd.DataFrame([
        {"부품코드": "PRT-001", "부품명": "서보모터 750W",       "규격": "SGMJV-07A",   "단위": "EA", "단가": 320000,  "공급사": "야스카와전기",  "재고": 45},
        {"부품코드": "PRT-002", "부품명": "볼스크류 Ø20",        "규격": "L=600mm",      "단위": "EA", "단가": 85000,   "공급사": "THK코리아",    "재고": 120},
        {"부품코드": "PRT-003", "부품명": "LM가이드 블록",       "규격": "HGH20CA",      "단위": "EA", "단가": 42000,   "공급사": "THK코리아",    "재고": 200},
        {"부품코드": "PRT-004", "부품명": "AC서보드라이버",      "규격": "SGDV-7R6A",    "단위": "EA", "단가": 480000,  "공급사": "야스카와전기",  "재고": 22},
        {"부품코드": "PRT-005", "부품명": "알루미늄 프레임",     "규격": "40×40 L=1000", "단위": "EA", "단가": 15000,   "공급사": "미스미코리아",  "재고": 500},
        {"부품코드": "PRT-006", "부품명": "공압 실린더",         "규격": "Ø50 Stroke100","단위": "EA", "단가": 62000,   "공급사": "SMC코리아",    "재고": 78},
        {"부품코드": "PRT-007", "부품명": "근접센서",            "규격": "NPN Ø8",       "단위": "EA", "단가": 18500,   "공급사": "오므론",        "재고": 350},
        {"부품코드": "PRT-008", "부품명": "PLC 메인유닛",        "규격": "Q06UDEH",      "단위": "EA", "단가": 1200000, "공급사": "미쓰비시전기",  "재고": 8},
        {"부품코드": "PRT-009", "부품명": "터치스크린 HMI",      "규격": "GT2510-VTBA",  "단위": "EA", "단가": 850000,  "공급사": "미쓰비시전기",  "재고": 12},
        {"부품코드": "PRT-010", "부품명": "타이밍벨트",          "규격": "HTD5M W=25",   "단위": "M",  "단가": 8500,    "공급사": "미스미코리아",  "재고": 300},
        {"부품코드": "PRT-011", "부품명": "스텝핑모터",          "규격": "NEMA23 3Nm",   "단위": "EA", "단가": 95000,   "공급사": "오리엔탈모터",  "재고": 55},
        {"부품코드": "PRT-012", "부품명": "커플링",              "규격": "Ø14/Ø19",      "단위": "EA", "단가": 22000,   "공급사": "미스미코리아",  "재고": 180},
        {"부품코드": "PRT-013", "부품명": "비전 카메라",         "규격": "5MP GigE",     "단위": "EA", "단가": 680000,  "공급사": "바슬러",        "재고": 15},
        {"부품코드": "PRT-014", "부품명": "링 조명",             "규격": "Ø120 백색",    "단위": "EA", "단가": 45000,   "공급사": "CCS코리아",    "재고": 40},
        {"부품코드": "PRT-015", "부품명": "제어반 판넬",         "규격": "600×800×200",  "단위": "EA", "단가": 320000,  "공급사": "리탈코리아",    "재고": 6},
    ])

def mock_suppliers():
    return pd.DataFrame([
        {"공급사코드": "SUP-001", "공급사명": "야스카와전기(주)",   "담당자": "田中一郎",  "연락처": "02-1234-5678", "주요품목": "서보모터/드라이버",  "거래상태": "활성"},
        {"공급사코드": "SUP-002", "공급사명": "THK코리아",          "담당자": "이상훈",    "연락처": "031-234-5678", "주요품목": "LM가이드/볼스크류", "거래상태": "활성"},
        {"공급사코드": "SUP-003", "공급사명": "미스미코리아(주)",   "담당자": "김민정",    "연락처": "02-3456-7890", "주요품목": "기계요소 전반",      "거래상태": "활성"},
        {"공급사코드": "SUP-004", "공급사명": "SMC코리아",          "담당자": "박준혁",    "연락처": "031-987-6543", "주요품목": "공압 기기",          "거래상태": "활성"},
        {"공급사코드": "SUP-005", "공급사명": "미쓰비시전기(주)",   "담당자": "홍길동",    "연락처": "02-5678-9012", "주요품목": "PLC/HMI",           "거래상태": "활성"},
    ])

def mock_drawings():
    return pd.DataFrame([
        {"도면번호": "DWG-2024-001", "설비명": "자동 조립 로봇 A형",  "버전": "Rev.C", "형식": "DWG", "크기": "2.4 MB", "업로드일": "2024-11-05", "담당자": "김철수"},
        {"도면번호": "DWG-2024-002", "설비명": "반도체 핸들러 B형",  "버전": "Rev.B", "형식": "PDF", "크기": "1.8 MB", "업로드일": "2024-11-18", "담당자": "이영희"},
        {"도면번호": "DWG-2024-003", "설비명": "배터리 팩 조립 장치","버전": "Rev.A", "형식": "DXF", "크기": "3.1 MB", "업로드일": "2024-12-01", "담당자": "박민준"},
        {"도면번호": "DWG-2024-004", "설비명": "비전 검사 시스템",   "버전": "Rev.D", "형식": "DWG", "크기": "4.5 MB", "업로드일": "2024-10-22", "담당자": "최수진"},
        {"도면번호": "DWG-2024-005", "설비명": "레이저 용접 장비",   "버전": "Rev.E", "형식": "PDF", "크기": "2.2 MB", "업로드일": "2024-09-15", "담당자": "정대한"},
        {"도면번호": "DWG-2024-006", "설비명": "스크류 체결 유닛",   "버전": "Rev.A", "형식": "DWG", "크기": "1.1 MB", "업로드일": "2024-12-10", "담당자": "강보람"},
        {"도면번호": "DWG-2024-007", "설비명": "컨베이어 이송 시스템","버전": "Rev.C","형식": "DXF", "크기": "5.8 MB", "업로드일": "2024-11-28", "담당자": "윤성민"},
        {"도면번호": "DWG-2024-008", "설비명": "CNC 가공 센터 D형",  "버전": "Rev.F", "형식": "PDF", "크기": "3.7 MB", "업로드일": "2024-10-05", "담당자": "한지은"},
        {"도면번호": "DWG-2025-001", "설비명": "AI 광학 검사기",     "버전": "Rev.A", "형식": "DWG", "크기": "2.9 MB", "업로드일": "2025-01-08", "담당자": "오재원"},
        {"도면번호": "DWG-2025-002", "설비명": "다축 로봇 그리퍼",   "버전": "Rev.A", "형식": "DXF", "크기": "1.6 MB", "업로드일": "2025-01-20", "담당자": "임채린"},
    ])

def mock_ecr_list():
    return pd.DataFrame([
        {"ECR번호": "ECR-2024-001", "요청일": "2024-11-20", "요청자": "김철수", "변경 내용": "서보모터 공급사 변경",           "우선순위": "높음", "상태": "승인"},
        {"ECR번호": "ECR-2024-002", "요청일": "2024-11-25", "요청자": "이영희", "변경 내용": "핸들러 그리퍼 재질 변경",        "우선순위": "중간", "상태": "승인"},
        {"ECR번호": "ECR-2024-003", "요청일": "2024-12-02", "요청자": "박민준", "변경 내용": "배터리 체결 토크 수정",           "우선순위": "높음", "상태": "검토중"},
        {"ECR번호": "ECR-2024-004", "요청일": "2024-12-08", "요청자": "최수진", "변경 내용": "조명 색온도 5600K→6500K 변경",   "우선순위": "낮음", "상태": "검토중"},
        {"ECR번호": "ECR-2024-005", "요청일": "2024-12-15", "요청자": "정대한", "변경 내용": "용접 파라미터 재설정",            "우선순위": "높음", "상태": "대기"},
        {"ECR번호": "ECR-2024-006", "요청일": "2024-12-20", "요청자": "강보람", "변경 내용": "스크류 토크 기준 ±5% 완화",       "우선순위": "중간", "상태": "대기"},
        {"ECR번호": "ECR-2025-001", "요청일": "2025-01-10", "요청자": "윤성민", "변경 내용": "컨베이어 속도 제어 로직 변경",    "우선순위": "높음", "상태": "대기"},
        {"ECR번호": "ECR-2025-002", "요청일": "2025-01-22", "요청자": "오재원", "변경 내용": "AI 검사 임계값 재조정",           "우선순위": "중간", "상태": "대기"},
    ])

# ── Status badge helper ───────────────────────────────────────────────────────
def status_badge(status: str) -> str:
    mapping = {
        "APPROVED": '<span class="badge-approved">APPROVED</span>',
        "IN_REVIEW": '<span class="badge-in-review">IN REVIEW</span>',
        "DRAFT": '<span class="badge-draft">DRAFT</span>',
        "승인": '<span class="badge-approved">승인</span>',
        "검토중": '<span class="badge-in-review">검토중</span>',
        "대기": '<span class="badge-draft">대기</span>',
        "반려": '<span class="badge-high">반려</span>',
    }
    return mapping.get(status, f'<span class="badge-draft">{status}</span>')

def priority_badge(priority: str) -> str:
    mapping = {
        "높음": '<span class="badge-high">높음</span>',
        "중간": '<span class="badge-mid">중간</span>',
        "낮음": '<span class="badge-low">낮음</span>',
    }
    return mapping.get(priority, priority)

# ═══════════════════════════════════════════════════════════════════════════════
# TABS
# ═══════════════════════════════════════════════════════════════════════════════
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "📋 BOM 목록",
    "✏️ BOM 등록/편집",
    "🔄 버전 이력",
    "🔩 부품 마스터",
    "📐 도면 관리",
    "🔀 설계 변경 요청",
])

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 1 — BOM 목록
# ═══════════════════════════════════════════════════════════════════════════════
with tab1:
    st.subheader("BOM 목록 조회")

    # Search filters
    fc1, fc2, fc3, fc4 = st.columns([3, 2, 2, 1])
    with fc1:
        search_name = st.text_input("프로젝트/설비명 검색", placeholder="설비명 또는 BOM번호 입력", key="t1_name")
    with fc2:
        search_status = st.selectbox("상태", STATUSES, key="t1_status")
    with fc3:
        search_customer = st.selectbox("고객사", CUSTOMERS, key="t1_customer")
    with fc4:
        st.markdown("<br>", unsafe_allow_html=True)
        do_search = st.button("🔍 검색", use_container_width=True, key="t1_search")

    st.markdown("---")

    # Load data (try API, fall back to mock)
    bom_df = None
    if do_search or True:  # always show on load
        try:
            params = {}
            if search_name:
                params["name"] = search_name
            if search_status != "전체":
                params["status"] = search_status
            if search_customer != "전체":
                params["customer"] = search_customer
            resp = httpx.get(f"{BACKEND_URL}/api/bom/list", params=params, timeout=3.0)
            if resp.status_code == 200:
                bom_df = pd.DataFrame(resp.json())
        except Exception:
            pass
        if bom_df is None or bom_df.empty:
            bom_df = mock_bom_list()
            if search_name:
                mask = bom_df["설비명"].str.contains(search_name, case=False, na=False) | \
                       bom_df["BOM번호"].str.contains(search_name, case=False, na=False)
                bom_df = bom_df[mask]
            if search_status != "전체":
                bom_df = bom_df[bom_df["상태"] == search_status]
            if search_customer != "전체":
                bom_df = bom_df[bom_df["고객사"] == search_customer]

    # Summary stats
    total = len(bom_df)
    approved_cnt = len(bom_df[bom_df["상태"] == "APPROVED"])
    review_cnt   = len(bom_df[bom_df["상태"] == "IN_REVIEW"])
    draft_cnt    = len(bom_df[bom_df["상태"] == "DRAFT"])

    s1, s2, s3, s4 = st.columns(4)
    s1.metric("전체", total)
    s2.metric("APPROVED", approved_cnt)
    s3.metric("IN_REVIEW", review_cnt)
    s4.metric("DRAFT", draft_cnt)

    st.markdown("<br>", unsafe_allow_html=True)

    # BOM table with expandable rows
    st.markdown(f"**검색 결과: {total}건**")
    for _, row in bom_df.iterrows():
        badge_html = status_badge(row["상태"])
        with st.expander(f"[{row['BOM번호']}]  {row['설비명']}  |  {row['고객사']}  |  {row['버전']}"):
            dc1, dc2, dc3, dc4 = st.columns([2, 2, 2, 1])
            with dc1:
                st.markdown(f"**상태:** {badge_html}", unsafe_allow_html=True)
                st.write(f"**작성일:** {row['작성일']}")
            with dc2:
                st.write(f"**담당자:** {row['담당자']}")
                st.write(f"**고객사:** {row['고객사']}")
            with dc3:
                st.write(f"**버전:** {row['버전']}")
                st.write(f"**BOM번호:** {row['BOM번호']}")
            with dc4:
                if st.button("상세보기", key=f"detail_{row['BOM번호']}"):
                    st.info(f"{row['BOM번호']} 상세 보기 (API 연동 예정)")
                if st.button("편집", key=f"edit_{row['BOM번호']}"):
                    st.session_state["edit_bom"] = row["BOM번호"]
                    st.info(f"{row['BOM번호']} 편집 모드 (Tab2에서 확인)")
                if st.button("삭제", key=f"del_{row['BOM번호']}"):
                    st.warning(f"{row['BOM번호']} 삭제 요청 (확인 필요)")

    st.markdown("---")
    if st.button("➕ 신규 BOM 등록", type="primary", use_container_width=False):
        st.session_state["new_bom"] = True
        st.success("Tab '✏️ BOM 등록/편집' 에서 신규 BOM을 등록하세요.")

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 2 — BOM 등록/편집
# ═══════════════════════════════════════════════════════════════════════════════
with tab2:
    st.subheader("BOM 등록 / 편집")

    edit_bom_no = st.session_state.get("edit_bom", "")
    if edit_bom_no:
        st.info(f"편집 모드: {edit_bom_no}")

    sub1, sub2, sub3 = st.tabs(["📄 기본 정보", "🔧 부품 구성", "📎 도면 첨부"])

    # ── Sub-tab 1: 기본 정보 ──────────────────────────────────────────────────
    with sub1:
        st.markdown("#### 기본 정보 입력")
        f1c1, f1c2 = st.columns(2)
        with f1c1:
            product_code = st.text_input("제품 코드 (자동 생성)", value="BOM-2025-AUTO", disabled=True, key="t2_pcode")
            equip_name   = st.text_input("설비명 *", placeholder="예: 자동 조립 로봇 C형", key="t2_ename")
            customer_sel = st.selectbox("고객사 *", CUSTOMERS_NO_ALL, key="t2_customer")
        with f1c2:
            due_date    = st.date_input("납기일 *", value=datetime.now() + timedelta(days=90), key="t2_due")
            project_sel = st.selectbox("프로젝트 *", PROJECTS, key="t2_proj")
            spec_notes  = st.text_area("비고 / 특기사항", placeholder="고객 요청 사항, 특수 규격 등 입력", height=80, key="t2_notes")

        st.markdown("##### 설비 사양")
        sc1, sc2, sc3 = st.columns(3)
        with sc1:
            st.text_input("설비 중량 (kg)", placeholder="예: 850", key="t2_weight")
            st.text_input("설치 면적 (mm × mm)", placeholder="예: 1200 × 900", key="t2_area")
        with sc2:
            st.text_input("전원 사양", placeholder="예: AC 220V 3Ph 60Hz", key="t2_power")
            st.text_input("소비 전력 (kW)", placeholder="예: 7.5", key="t2_kwatt")
        with sc3:
            st.selectbox("작성 담당자", ["김철수", "이영희", "박민준", "최수진", "정대한"], key="t2_author")
            st.selectbox("검토자", ["팀장 A", "팀장 B", "부장 C"], key="t2_reviewer")

        st.markdown("---")
        b1, b2, _ = st.columns([1, 1, 4])
        with b1:
            if st.button("💾 임시저장", key="t2_save"):
                st.success("임시 저장 완료 (DRAFT 상태)")
        with b2:
            if st.button("📤 검토 요청", type="primary", key="t2_review"):
                st.success("검토 요청이 완료되었습니다. 상태: IN_REVIEW")

    # ── Sub-tab 2: 부품 구성 ──────────────────────────────────────────────────
    with sub2:
        st.markdown("#### 부품 구성 (BOM Tree)")

        if "bom_parts_df" not in st.session_state:
            st.session_state["bom_parts_df"] = pd.DataFrame([
                {"상위부품번호": "",        "부품번호": "ASM-001",  "부품명": "메인 프레임 어셈블리",  "수량": 1, "단위": "SET", "단가(원)": 1500000},
                {"상위부품번호": "ASM-001", "부품번호": "PRT-005",  "부품명": "알루미늄 프레임 40×40","수량": 8, "단위": "EA",  "단가(원)": 15000},
                {"상위부품번호": "ASM-001", "부품번호": "PRT-012",  "부품명": "커플링 Ø14/Ø19",       "수량": 2, "단위": "EA",  "단가(원)": 22000},
                {"상위부품번호": "",        "부품번호": "ASM-002",  "부품명": "구동 축 어셈블리",       "수량": 1, "단위": "SET", "단가(원)": 2800000},
                {"상위부품번호": "ASM-002", "부품번호": "PRT-001",  "부품명": "서보모터 750W",          "수량": 2, "단위": "EA",  "단가(원)": 320000},
                {"상위부품번호": "ASM-002", "부품번호": "PRT-002",  "부품명": "볼스크류 Ø20 L=600",    "수량": 2, "단위": "EA",  "단가(원)": 85000},
                {"상위부품번호": "ASM-002", "부품번호": "PRT-003",  "부품명": "LM가이드 블록 HGH20CA", "수량": 4, "단위": "EA",  "단가(원)": 42000},
                {"상위부품번호": "",        "부품번호": "ASM-003",  "부품명": "제어 시스템 어셈블리",   "수량": 1, "단위": "SET", "단가(원)": 2500000},
                {"상위부품번호": "ASM-003", "부품번호": "PRT-008",  "부품명": "PLC 메인유닛 Q06UDEH",  "수량": 1, "단위": "EA",  "단가(원)": 1200000},
                {"상위부품번호": "ASM-003", "부품번호": "PRT-009",  "부품명": "터치스크린 HMI",         "수량": 1, "단위": "EA",  "단가(원)": 850000},
                {"상위부품번호": "ASM-003", "부품번호": "PRT-004",  "부품명": "AC서보드라이버",         "수량": 2, "단위": "EA",  "단가(원)": 480000},
            ])

        edited_df = st.data_editor(
            st.session_state["bom_parts_df"],
            num_rows="dynamic",
            use_container_width=True,
            key="bom_parts_editor",
            column_config={
                "상위부품번호": st.column_config.TextColumn("상위 부품번호", width="medium"),
                "부품번호":     st.column_config.TextColumn("부품번호",      width="medium"),
                "부품명":       st.column_config.TextColumn("부품명",        width="large"),
                "수량":         st.column_config.NumberColumn("수량",        min_value=0, step=1),
                "단위":         st.column_config.SelectboxColumn("단위", options=["EA", "SET", "M", "KG", "L", "개"]),
                "단가(원)":     st.column_config.NumberColumn("단가(원)",    format="%d ₩", min_value=0),
            }
        )
        st.session_state["bom_parts_df"] = edited_df

        # Total cost
        if not edited_df.empty:
            try:
                total_cost = (edited_df["수량"] * edited_df["단가(원)"]).sum()
                st.markdown(f"**총 부품 원가 합계:** `{total_cost:,.0f} 원`")
            except Exception:
                pass

        st.markdown("---")
        ai_col1, ai_col2 = st.columns([1, 3])
        with ai_col1:
            ai_btn = st.button("🤖 AI 유사 BOM 추천", key="t2_ai_recommend")
        if ai_btn:
            with st.expander("AI 추천 결과 — 유사 BOM 참조", expanded=True):
                st.markdown("""
**AI 분석 결과:** 입력하신 설비 사양과 유사한 BOM 3건을 발견했습니다.

| 유사도 | BOM번호 | 설비명 | 버전 | 주요 차이점 |
|--------|---------|--------|------|------------|
| 94% | BOM-2024-001 | 자동 조립 로봇 A형 | v1.3 | 서보모터 용량 400W vs 750W |
| 87% | BOM-2024-005 | 레이저 용접 장비 | v3.1 | 제어반 구성 상이 |
| 82% | BOM-2024-008 | CNC 가공 센터 D형 | v1.5 | 이송 축 구성 3축 vs 2축 |

**추천 부품 추가 (BOM-2024-001 기반):**
- PRT-006 공압 실린더 (수량: 4) — 유사 설비에 98% 포함
- PRT-007 근접센서 (수량: 6) — 유사 설비에 95% 포함
                """)
                if st.button("추천 부품 일괄 추가", key="t2_ai_add"):
                    st.success("추천 부품이 BOM에 추가되었습니다.")

    # ── Sub-tab 3: 도면 첨부 ──────────────────────────────────────────────────
    with sub3:
        st.markdown("#### 도면 첨부")

        up_c1, up_c2 = st.columns([2, 1])
        with up_c1:
            uploaded_files = st.file_uploader(
                "도면 파일 업로드 (PDF / DWG / DXF)",
                type=["pdf", "dwg", "dxf"],
                accept_multiple_files=True,
                key="t2_files"
            )
        with up_c2:
            version_tag = st.text_input("버전 태그", placeholder="예: Rev.A", key="t2_ver_tag")
            drawing_desc = st.text_input("도면 설명", placeholder="예: 전체 조립도", key="t2_dwg_desc")
            if st.button("📤 업로드", key="t2_upload_btn"):
                if uploaded_files:
                    st.success(f"{len(uploaded_files)}개 파일 업로드 완료 (버전: {version_tag or 'Rev.A'})")
                else:
                    st.warning("업로드할 파일을 선택하세요.")

        st.markdown("##### 첨부된 도면 목록")
        attached_drawings = pd.DataFrame([
            {"도면명": "전체 조립도.pdf",       "버전": "Rev.C", "크기": "2.4 MB", "업로드일": "2024-11-05", "업로드자": "김철수"},
            {"도면명": "메인 프레임 도면.dwg",  "버전": "Rev.B", "크기": "1.8 MB", "업로드일": "2024-10-15", "업로드자": "이영희"},
            {"도면명": "구동부 상세도.dxf",     "버전": "Rev.A", "크기": "0.9 MB", "업로드일": "2024-09-20", "업로드자": "박민준"},
            {"도면명": "제어반 배선도.pdf",     "버전": "Rev.B", "크기": "1.2 MB", "업로드일": "2024-10-28", "업로드자": "최수진"},
            {"도면명": "케이블 트레이 도면.dwg","버전": "Rev.A", "크기": "0.7 MB", "업로드일": "2024-11-01", "업로드자": "김철수"},
        ])
        st.dataframe(attached_drawings, use_container_width=True, hide_index=True)

        st.markdown("---")
        sb1, sb2 = st.columns([1, 1])
        with sb1:
            if st.button("💾 임시저장", key="t2_sub3_save"):
                st.success("도면 첨부 정보 임시 저장 완료")
        with sb2:
            if st.button("📤 검토 요청", type="primary", key="t2_sub3_review"):
                st.success("검토 요청 완료. 담당자에게 알림이 전송되었습니다.")

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 3 — BOM 버전 이력
# ═══════════════════════════════════════════════════════════════════════════════
with tab3:
    st.subheader("BOM 버전 이력")

    bom_options = mock_bom_list()["BOM번호"].tolist()
    selected_bom = st.selectbox("BOM 선택", bom_options, key="t3_bom_sel")

    if selected_bom:
        sel_info = mock_bom_list()[mock_bom_list()["BOM번호"] == selected_bom].iloc[0]
        st.markdown(f"**설비명:** {sel_info['설비명']}  |  **고객사:** {sel_info['고객사']}  |  **현재 버전:** {sel_info['버전']}")

    st.markdown("---")

    hist_df = mock_version_history()
    st.markdown("#### 버전 이력")

    for _, row in hist_df.iterrows():
        badge_html = status_badge(row["상태"])
        with st.expander(f"{row['버전']}  —  {row['변경일']}  |  {row['변경자']}  |  {row['변경 내용'][:40]}..."):
            hc1, hc2, hc3 = st.columns(3)
            with hc1:
                st.write(f"**버전:** {row['버전']}")
                st.write(f"**변경일:** {row['변경일']}")
            with hc2:
                st.write(f"**변경자:** {row['변경자']}")
                st.markdown(f"**상태:** {badge_html}", unsafe_allow_html=True)
            with hc3:
                st.write(f"**변경 내용:** {row['변경 내용']}")

            if st.button(f"🔍 Diff 보기 ({row['버전']})", key=f"diff_{row['버전']}"):
                with st.container():
                    st.markdown("**변경 전 / 후 비교**")
                    d1, d2 = st.columns(2)
                    with d1:
                        st.markdown("**변경 전**")
                        st.code(f"""BOM번호: {selected_bom}
버전: {row['버전']} (이전)
부품: 서보모터 400W (수량: 2)
단가: 220,000 원
총 원가: 7,850,000 원""", language="text")
                    with d2:
                        st.markdown("**변경 후**")
                        st.code(f"""BOM번호: {selected_bom}
버전: {row['버전']}
부품: 서보모터 750W (수량: 2) ← 변경
단가: 320,000 원 ← 변경
총 원가: 8,050,000 원 ← 변경""", language="text")

    st.markdown("---")
    st.markdown("#### 버전별 원가 비교")

    cost_data = pd.DataFrame({
        "버전":   ["v0.9", "v1.0", "v1.1", "v1.2", "v1.3"],
        "총원가(만원)": [620, 680, 705, 780, 805],
        "변경유형": ["초안", "기본", "보강", "공급사변경", "스펙상향"],
    })
    fig_cost = px.bar(
        cost_data, x="버전", y="총원가(만원)",
        color="변경유형",
        text="총원가(만원)",
        title=f"{selected_bom} 버전별 BOM 원가 추이",
        color_discrete_sequence=px.colors.qualitative.Set2,
        template="plotly_dark",
    )
    fig_cost.update_traces(texttemplate="%{text:,}만원", textposition="outside")
    fig_cost.update_layout(height=350, margin=dict(t=50, b=20))
    st.plotly_chart(fig_cost, use_container_width=True)

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 4 — 부품/자재 마스터
# ═══════════════════════════════════════════════════════════════════════════════
with tab4:
    st.subheader("부품 / 자재 마스터")

    pt1, pt2, pt3 = st.tabs(["📦 부품 목록", "➕ 부품 등록", "🏭 공급사 관리"])

    # ── Sub-tab: 부품 목록 ────────────────────────────────────────────────────
    with pt1:
        st.markdown("#### 부품 목록")
        pc1, pc2, pc3 = st.columns([3, 2, 1])
        with pc1:
            part_search = st.text_input("부품명/코드 검색", placeholder="부품코드 또는 부품명 입력", key="t4_psearch")
        with pc2:
            supplier_filter = st.selectbox(
                "공급사 필터",
                ["전체"] + mock_suppliers()["공급사명"].tolist(),
                key="t4_sup_filter"
            )
        with pc3:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🔍 검색", key="t4_search_btn", use_container_width=True):
                pass

        parts_df = mock_parts()
        if part_search:
            mask = parts_df["부품명"].str.contains(part_search, case=False, na=False) | \
                   parts_df["부품코드"].str.contains(part_search, case=False, na=False)
            parts_df = parts_df[mask]
        if supplier_filter != "전체":
            parts_df = parts_df[parts_df["공급사"] == supplier_filter]

        st.markdown(f"**총 {len(parts_df)}건**")

        # Highlight low stock
        def highlight_low_stock(row):
            if row["재고"] < 20:
                return ["background-color: rgba(231,76,60,0.15)"] * len(row)
            return [""] * len(row)

        styled = parts_df.style.apply(highlight_low_stock, axis=1).format({"단가": "{:,.0f} ₩"})
        st.dataframe(styled, use_container_width=True, hide_index=True)
        st.caption("* 재고 20개 미만 항목은 붉은색으로 표시됩니다.")

        # Stock distribution chart
        st.markdown("#### 부품 재고 현황")
        fig_stock = px.bar(
            mock_parts().sort_values("재고"),
            x="재고", y="부품명",
            orientation="h",
            color="재고",
            color_continuous_scale="RdYlGn",
            title="부품별 현재 재고",
            template="plotly_dark",
        )
        fig_stock.update_layout(height=400, margin=dict(t=50, b=20), coloraxis_showscale=False)
        st.plotly_chart(fig_stock, use_container_width=True)

    # ── Sub-tab: 부품 등록 ────────────────────────────────────────────────────
    with pt2:
        st.markdown("#### 신규 부품 등록")
        with st.form("part_register_form"):
            pr1, pr2 = st.columns(2)
            with pr1:
                st.text_input("부품 코드 *", placeholder="예: PRT-016", key="pr_code")
                st.text_input("부품명 *", placeholder="예: 감속기 1/20", key="pr_name")
                st.text_input("규격 / 모델명 *", placeholder="예: NEMA23 Ratio 20", key="pr_spec")
                st.selectbox("단위", ["EA", "SET", "M", "KG", "L", "개"], key="pr_unit")
            with pr2:
                st.number_input("단가 (원) *", min_value=0, step=1000, key="pr_price")
                st.selectbox("공급사 *", mock_suppliers()["공급사명"].tolist(), key="pr_supplier")
                st.number_input("최소 재고 기준 (EA)", min_value=0, step=1, value=10, key="pr_min_stock")
                st.number_input("현재 재고 (EA)", min_value=0, step=1, key="pr_cur_stock")
            st.text_area("비고", placeholder="특이 사항, 대체 부품 정보 등", key="pr_notes")
            submitted = st.form_submit_button("✅ 부품 등록", type="primary")
            if submitted:
                st.success("부품이 성공적으로 등록되었습니다.")

    # ── Sub-tab: 공급사 관리 ──────────────────────────────────────────────────
    with pt3:
        st.markdown("#### 공급사 목록")
        st.dataframe(mock_suppliers(), use_container_width=True, hide_index=True)

        st.markdown("---")
        st.markdown("#### 신규 공급사 등록")
        with st.form("supplier_register_form"):
            sp1, sp2 = st.columns(2)
            with sp1:
                st.text_input("공급사 코드 *", placeholder="예: SUP-006", key="sp_code")
                st.text_input("공급사명 *", placeholder="예: (주)한국정밀기계", key="sp_name")
                st.text_input("담당자 *", placeholder="예: 홍길동", key="sp_contact_name")
            with sp2:
                st.text_input("연락처 *", placeholder="예: 02-1234-5678", key="sp_phone")
                st.text_input("주요 품목", placeholder="예: LM가이드, 볼스크류", key="sp_items")
                st.selectbox("거래 상태", ["활성", "비활성", "검토중"], key="sp_status")
            st.text_area("비고", key="sp_notes")
            sp_submitted = st.form_submit_button("✅ 공급사 등록", type="primary")
            if sp_submitted:
                st.success("공급사가 성공적으로 등록되었습니다.")

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 5 — 도면 관리
# ═══════════════════════════════════════════════════════════════════════════════
with tab5:
    st.subheader("도면 관리")

    dt1, dt2, dt3 = st.tabs(["🗂️ 도면 목록", "⬆️ 도면 업로드", "🖼️ 도면 뷰어"])

    # ── Sub-tab: 도면 목록 ────────────────────────────────────────────────────
    with dt1:
        st.markdown("#### 도면 목록")
        dc1, dc2, dc3 = st.columns([3, 2, 1])
        with dc1:
            dwg_search = st.text_input("도면번호/설비명 검색", key="t5_dsearch")
        with dc2:
            fmt_filter = st.selectbox("파일 형식", ["전체", "DWG", "PDF", "DXF"], key="t5_fmt")
        with dc3:
            st.markdown("<br>", unsafe_allow_html=True)
            st.button("🔍 검색", key="t5_search", use_container_width=True)

        dwg_df = mock_drawings()
        if dwg_search:
            mask = dwg_df["도면번호"].str.contains(dwg_search, case=False, na=False) | \
                   dwg_df["설비명"].str.contains(dwg_search, case=False, na=False)
            dwg_df = dwg_df[mask]
        if fmt_filter != "전체":
            dwg_df = dwg_df[dwg_df["형식"] == fmt_filter]

        st.markdown(f"**총 {len(dwg_df)}건**")
        st.dataframe(dwg_df, use_container_width=True, hide_index=True)

        st.markdown("#### 파일 형식 분포")
        fmt_counts = mock_drawings()["형식"].value_counts().reset_index()
        fmt_counts.columns = ["형식", "건수"]
        fig_fmt = px.pie(
            fmt_counts, values="건수", names="형식",
            title="도면 파일 형식 분포",
            color_discrete_sequence=px.colors.qualitative.Pastel,
            template="plotly_dark",
        )
        fig_fmt.update_layout(height=300, margin=dict(t=50, b=20))
        st.plotly_chart(fig_fmt, use_container_width=True)

    # ── Sub-tab: 도면 업로드 ──────────────────────────────────────────────────
    with dt2:
        st.markdown("#### 도면 업로드")
        with st.form("drawing_upload_form"):
            du1, du2 = st.columns([2, 1])
            with du1:
                up_file = st.file_uploader(
                    "도면 파일 선택 (PDF / DWG / DXF) *",
                    type=["pdf", "dwg", "dxf"],
                    key="t5_file"
                )
            with du2:
                st.text_input("도면 번호", placeholder="자동 생성 또는 직접 입력", key="t5_dno")
                st.text_input("버전", placeholder="예: Rev.A", key="t5_dver")

            um1, um2 = st.columns(2)
            with um1:
                st.selectbox("연결 BOM", mock_bom_list()["BOM번호"].tolist(), key="t5_bom")
                st.selectbox("도면 유형", ["조립도", "부품도", "배선도", "배관도", "설치도", "기타"], key="t5_dtype")
                st.selectbox("담당자", ["김철수", "이영희", "박민준", "최수진", "정대한"], key="t5_dauthor")
            with um2:
                st.text_input("설비명", key="t5_dequip")
                st.text_area("도면 설명", height=80, key="t5_ddesc")

            du_submitted = st.form_submit_button("📤 도면 업로드", type="primary")
            if du_submitted:
                if up_file:
                    st.success(f"'{up_file.name}' 업로드 완료. 도면 번호가 발급되었습니다.")
                else:
                    st.warning("도면 파일을 선택하세요.")

    # ── Sub-tab: 도면 뷰어 ────────────────────────────────────────────────────
    with dt3:
        st.markdown("#### 도면 뷰어")
        dwg_options = mock_drawings()["도면번호"].tolist()
        sel_dwg = st.selectbox("도면 선택", dwg_options, key="t5_view_sel")

        if sel_dwg:
            sel_dwg_info = mock_drawings()[mock_drawings()["도면번호"] == sel_dwg].iloc[0]
            vc1, vc2, vc3, vc4 = st.columns(4)
            vc1.metric("도면번호", sel_dwg_info["도면번호"])
            vc2.metric("버전",     sel_dwg_info["버전"])
            vc3.metric("형식",     sel_dwg_info["형식"])
            vc4.metric("크기",     sel_dwg_info["크기"])

        # Placeholder viewer
        st.markdown("---")
        st.markdown(f"""
<div style="
    background: #1e2130;
    border: 2px dashed #3d4460;
    border-radius: 10px;
    height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #6b7280;
">
    <div style="font-size: 4rem;">📐</div>
    <div style="font-size: 1.1rem; margin-top: 12px; font-weight: 600;">{sel_dwg if sel_dwg else '도면을 선택하세요'}</div>
    <div style="font-size: 0.85rem; margin-top: 6px;">DWG/DXF 뷰어 — 백엔드 렌더링 연동 예정</div>
    <div style="font-size: 0.78rem; margin-top: 4px; color: #4b5563;">실제 환경에서는 PDF 뷰어 또는 CAD 렌더링 이미지가 표시됩니다</div>
</div>
""", unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        vc_btn1, vc_btn2, vc_btn3 = st.columns([1, 1, 4])
        with vc_btn1:
            st.button("⬇️ 다운로드", key="t5_download")
        with vc_btn2:
            st.button("🖨️ 인쇄", key="t5_print")

# ═══════════════════════════════════════════════════════════════════════════════
# TAB 6 — 설계 변경 요청 (ECR/ECO)
# ═══════════════════════════════════════════════════════════════════════════════
with tab6:
    st.subheader("설계 변경 요청 (ECR / ECO)")

    et1, et2, et3 = st.tabs(["📋 변경 요청 목록", "📝 변경 요청 등록", "✅ 승인 처리"])

    # ── Sub-tab: 변경 요청 목록 ───────────────────────────────────────────────
    with et1:
        st.markdown("#### ECR 목록")
        ec1, ec2, ec3 = st.columns([3, 2, 1])
        with ec1:
            ecr_search = st.text_input("ECR번호 / 변경 내용 검색", key="t6_ecrsearch")
        with ec2:
            ecr_status_filter = st.selectbox("상태 필터", ["전체", "대기", "검토중", "승인", "반려"], key="t6_ecrstatus")
        with ec3:
            st.markdown("<br>", unsafe_allow_html=True)
            st.button("🔍 검색", key="t6_search", use_container_width=True)

        ecr_df = mock_ecr_list()
        if ecr_search:
            mask = ecr_df["ECR번호"].str.contains(ecr_search, case=False, na=False) | \
                   ecr_df["변경 내용"].str.contains(ecr_search, case=False, na=False)
            ecr_df = ecr_df[mask]
        if ecr_status_filter != "전체":
            ecr_df = ecr_df[ecr_df["상태"] == ecr_status_filter]

        # Summary
        all_ecr = mock_ecr_list()
        ecr_s1, ecr_s2, ecr_s3, ecr_s4 = st.columns(4)
        ecr_s1.metric("전체", len(all_ecr))
        ecr_s2.metric("대기", len(all_ecr[all_ecr["상태"] == "대기"]))
        ecr_s3.metric("검토중", len(all_ecr[all_ecr["상태"] == "검토중"]))
        ecr_s4.metric("승인", len(all_ecr[all_ecr["상태"] == "승인"]))

        st.markdown(f"**검색 결과: {len(ecr_df)}건**")

        for _, row in ecr_df.iterrows():
            s_badge = status_badge(row["상태"])
            p_badge = priority_badge(row["우선순위"])
            with st.expander(
                f"[{row['ECR번호']}]  {row['변경 내용'][:35]}...  |  {row['요청일']}  |  {row['요청자']}"
            ):
                ec_a, ec_b, ec_c = st.columns(3)
                with ec_a:
                    st.write(f"**ECR번호:** {row['ECR번호']}")
                    st.write(f"**요청일:** {row['요청일']}")
                    st.write(f"**요청자:** {row['요청자']}")
                with ec_b:
                    st.markdown(f"**우선순위:** {p_badge}", unsafe_allow_html=True)
                    st.markdown(f"**상태:** {s_badge}", unsafe_allow_html=True)
                with ec_c:
                    st.write(f"**변경 내용:**")
                    st.write(row["변경 내용"])

        # Priority distribution chart
        st.markdown("#### ECR 우선순위 / 상태 분포")
        ch1, ch2 = st.columns(2)
        with ch1:
            pri_counts = mock_ecr_list()["우선순위"].value_counts().reset_index()
            pri_counts.columns = ["우선순위", "건수"]
            fig_pri = px.pie(
                pri_counts, values="건수", names="우선순위",
                title="우선순위 분포",
                color="우선순위",
                color_discrete_map={"높음": "#e74c3c", "중간": "#f39c12", "낮음": "#3498db"},
                template="plotly_dark",
            )
            fig_pri.update_layout(height=280, margin=dict(t=50, b=10))
            st.plotly_chart(fig_pri, use_container_width=True)
        with ch2:
            stat_counts = mock_ecr_list()["상태"].value_counts().reset_index()
            stat_counts.columns = ["상태", "건수"]
            fig_stat = px.bar(
                stat_counts, x="상태", y="건수",
                title="상태별 ECR 현황",
                color="상태",
                color_discrete_map={"승인": "#2ecc71", "검토중": "#f39c12", "대기": "#9ba3af", "반려": "#e74c3c"},
                template="plotly_dark",
                text="건수",
            )
            fig_stat.update_traces(textposition="outside")
            fig_stat.update_layout(height=280, margin=dict(t=50, b=10), showlegend=False)
            st.plotly_chart(fig_stat, use_container_width=True)

    # ── Sub-tab: 변경 요청 등록 ───────────────────────────────────────────────
    with et2:
        st.markdown("#### 신규 ECR 등록")
        with st.form("ecr_register_form"):
            er1, er2 = st.columns(2)
            with er1:
                st.selectbox("관련 BOM *", mock_bom_list()["BOM번호"].tolist(), key="er_bom")
                st.selectbox("요청자 *", ["김철수", "이영희", "박민준", "최수진", "정대한", "강보람", "윤성민"], key="er_author")
                st.selectbox("우선순위 *", ["높음", "중간", "낮음"], key="er_priority")
                st.date_input("요청일 *", value=datetime.now(), key="er_date")
            with er2:
                st.selectbox("변경 유형", ["설계 변경", "부품 변경", "규격 변경", "공급사 변경", "공정 변경", "기타"], key="er_type")
                st.selectbox("영향도", ["전체 영향", "부분 영향", "경미한 영향"], key="er_impact")
                st.date_input("요청 처리 희망일", value=datetime.now() + timedelta(days=14), key="er_due")

            st.text_area("변경 사유 *", placeholder="변경이 필요한 이유를 상세히 입력하세요.", height=80, key="er_reason")
            st.text_area("변경 내용 *", placeholder="변경 전/후 내용을 구체적으로 기술하세요.\n예)\n변경 전: 서보모터 400W (SGMJV-04A)\n변경 후: 서보모터 750W (SGMJV-07A)", height=120, key="er_content")
            st.text_area("예상 영향 분석", placeholder="원가 영향, 납기 영향, 품질 영향 등", height=60, key="er_analysis")

            ecr_file = st.file_uploader("첨부 파일 (선택)", type=["pdf", "dwg", "dxf", "xlsx", "docx"], key="er_file")

            er_submitted = st.form_submit_button("📤 변경 요청 등록", type="primary")
            if er_submitted:
                ecr_new_no = f"ECR-2025-{str(len(mock_ecr_list()) + 1).zfill(3)}"
                st.success(f"변경 요청이 등록되었습니다. ECR 번호: **{ecr_new_no}** (상태: 대기)")

    # ── Sub-tab: 승인 처리 ────────────────────────────────────────────────────
    with et3:
        st.markdown("#### 승인 대기 ECR 목록")

        pending_ecr = mock_ecr_list()[mock_ecr_list()["상태"].isin(["대기", "검토중"])]
        st.info(f"현재 승인 대기/검토 중인 ECR: **{len(pending_ecr)}건**")

        for _, row in pending_ecr.iterrows():
            p_badge = priority_badge(row["우선순위"])
            s_badge = status_badge(row["상태"])
            with st.expander(
                f"[{row['ECR번호']}]  {row['변경 내용'][:40]}  |  우선순위: {row['우선순위']}  |  {row['상태']}"
            ):
                ap1, ap2 = st.columns([2, 1])
                with ap1:
                    st.markdown(f"**ECR번호:** {row['ECR번호']}")
                    st.markdown(f"**요청일:** {row['요청일']}  |  **요청자:** {row['요청자']}")
                    st.markdown(f"**우선순위:** {p_badge}  |  **현재 상태:** {s_badge}", unsafe_allow_html=True)
                    st.markdown(f"**변경 내용:** {row['변경 내용']}")
                    comment = st.text_area(
                        "검토 코멘트",
                        placeholder="승인 또는 반려 사유를 입력하세요.",
                        height=80,
                        key=f"comment_{row['ECR번호']}"
                    )
                with ap2:
                    st.markdown("<br><br>", unsafe_allow_html=True)
                    if st.button("✅ 승인", key=f"approve_{row['ECR번호']}", use_container_width=True, type="primary"):
                        st.success(f"{row['ECR번호']} 승인 완료. 담당자에게 알림이 전송되었습니다.")
                    st.markdown("<br>", unsafe_allow_html=True)
                    if st.button("❌ 반려", key=f"reject_{row['ECR번호']}", use_container_width=True):
                        st.error(f"{row['ECR번호']} 반려 처리. 요청자에게 알림이 전송되었습니다.")
                    st.markdown("<br>", unsafe_allow_html=True)
                    if st.button("🔁 추가 검토 요청", key=f"rereview_{row['ECR번호']}", use_container_width=True):
                        st.warning(f"{row['ECR번호']} 추가 검토 요청이 등록되었습니다.")

        st.markdown("---")
        st.markdown("#### 최근 처리 완료 ECR")
        completed_ecr = mock_ecr_list()[mock_ecr_list()["상태"] == "승인"]
        st.dataframe(completed_ecr, use_container_width=True, hide_index=True)
