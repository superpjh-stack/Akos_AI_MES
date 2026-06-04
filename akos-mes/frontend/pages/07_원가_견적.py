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

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="원가/견적 관리", page_icon="💰", layout="wide")

st.title("💰 원가/견적 관리")
st.caption("견적 작성, 원가 분석, 수주/계약 관리, 재무 리포트")

# ─────────────────────────────────────────────
# Mock Data
# ─────────────────────────────────────────────

QUOTES = [
    {"견적번호": "QT-2025-001", "고객사": "현대자동차㈜", "설비명": "CNC 자동화 라인", "견적금액": 4.2, "작성일": "2025-05-20", "담당자": "김민준", "상태": "APPROVED"},
    {"견적번호": "QT-2025-002", "고객사": "삼성SDI㈜", "설비명": "배터리팩 조립 설비", "견적금액": 6.8, "작성일": "2025-05-22", "담당자": "이서연", "상태": "ISSUED"},
    {"견적번호": "QT-2025-003", "고객사": "LG에너지솔루션", "설비명": "전극 코팅 시스템", "견적금액": 3.5, "작성일": "2025-05-25", "담당자": "박지훈", "상태": "IN_REVIEW"},
    {"견적번호": "QT-2025-004", "고객사": "SK하이닉스㈜", "설비명": "반도체 이송 로봇", "견적금액": 2.1, "작성일": "2025-05-28", "담당자": "최수아", "상태": "DRAFT"},
    {"견적번호": "QT-2025-005", "고객사": "포스코인터내셔널", "설비명": "철강 절단 자동화", "견적금액": 1.8, "작성일": "2025-05-30", "담당자": "김민준", "상태": "APPROVED"},
    {"견적번호": "QT-2025-006", "고객사": "한화에어로스페이스", "설비명": "항공부품 가공 라인", "견적금액": 5.5, "작성일": "2025-06-01", "담당자": "이서연", "상태": "ISSUED"},
    {"견적번호": "QT-2025-007", "고객사": "두산중공업㈜", "설비명": "발전기 조립 설비", "견적금액": 7.2, "작성일": "2025-06-02", "담당자": "박지훈", "상태": "IN_REVIEW"},
    {"견적번호": "QT-2025-008", "고객사": "현대로템㈜", "설비명": "철도차량 용접 자동화", "견적금액": 4.9, "작성일": "2025-06-02", "담당자": "최수아", "상태": "APPROVED"},
    {"견적번호": "QT-2025-009", "고객사": "기아자동차㈜", "설비명": "프레스 라인 자동화", "견적금액": 3.3, "작성일": "2025-06-03", "담당자": "김민준", "상태": "DRAFT"},
    {"견적번호": "QT-2025-010", "고객사": "LS일렉트릭㈜", "설비명": "전력기기 조립 라인", "견적금액": 2.7, "작성일": "2025-06-03", "담당자": "이서연", "상태": "IN_REVIEW"},
    {"견적번호": "QT-2025-011", "고객사": "코오롱인더스트리", "설비명": "섬유 검사 자동화", "견적금액": 1.5, "작성일": "2025-06-03", "담당자": "박지훈", "상태": "DRAFT"},
    {"견적번호": "QT-2025-012", "고객사": "효성중공업㈜", "설비명": "변압기 코어 조립", "견적금액": 3.8, "작성일": "2025-06-04", "담당자": "최수아", "상태": "APPROVED"},
    {"견적번호": "QT-2025-013", "고객사": "롯데케미칼㈜", "설비명": "화학 공정 모니터링", "견적금액": 2.2, "작성일": "2025-06-04", "담당자": "김민준", "상태": "DRAFT"},
    {"견적번호": "QT-2025-014", "고객사": "현대제철㈜", "설비명": "압연 공정 AI 제어", "견적금액": 4.6, "작성일": "2025-06-04", "담당자": "이서연", "상태": "ISSUED"},
    {"견적번호": "QT-2025-015", "고객사": "삼성전자㈜ DS부문", "설비명": "웨이퍼 검사 시스템", "견적금액": 8.1, "작성일": "2025-06-04", "담당자": "박지훈", "상태": "IN_REVIEW"},
]

ORDERS = [
    {"수주번호": "SO-2025-001", "고객사": "현대자동차㈜", "설비명": "CNC 자동화 라인", "수주금액": 4.5, "계약일": "2025-01-15", "납기": "2025-08-31", "진행상태": "생산"},
    {"수주번호": "SO-2025-002", "고객사": "삼성SDI㈜", "설비명": "배터리팩 조립 설비", "수주금액": 7.2, "계약일": "2025-02-01", "납기": "2025-09-30", "진행상태": "설계"},
    {"수주번호": "SO-2025-003", "고객사": "LG에너지솔루션", "설비명": "전극 코팅 시스템", "수주금액": 3.8, "계약일": "2025-02-20", "납기": "2025-07-15", "진행상태": "FAT"},
    {"수주번호": "SO-2025-004", "고객사": "SK하이닉스㈜", "설비명": "반도체 이송 로봇", "수주금액": 2.3, "계약일": "2025-03-05", "납기": "2025-06-30", "진행상태": "납품"},
    {"수주번호": "SO-2025-005", "고객사": "포스코인터내셔널", "설비명": "철강 절단 자동화", "수주금액": 2.0, "계약일": "2025-03-15", "납기": "2025-07-31", "진행상태": "생산"},
    {"수주번호": "SO-2025-006", "고객사": "한화에어로스페이스", "설비명": "항공부품 가공 라인", "수주금액": 6.0, "계약일": "2025-03-25", "납기": "2025-11-30", "진행상태": "설계"},
    {"수주번호": "SO-2025-007", "고객사": "두산중공업㈜", "설비명": "발전기 조립 설비", "수주금액": 7.8, "계약일": "2025-04-01", "납기": "2025-12-31", "진행상태": "수주"},
    {"수주번호": "SO-2025-008", "고객사": "현대로템㈜", "설비명": "철도차량 용접 자동화", "수주금액": 5.2, "계약일": "2025-04-10", "납기": "2025-10-31", "진행상태": "생산"},
    {"수주번호": "SO-2025-009", "고객사": "기아자동차㈜", "설비명": "프레스 라인 자동화", "수주금액": 3.6, "계약일": "2025-04-20", "납기": "2025-09-15", "진행상태": "설계"},
    {"수주번호": "SO-2025-010", "고객사": "LS일렉트릭㈜", "설비명": "전력기기 조립 라인", "수주금액": 3.0, "계약일": "2025-05-01", "납기": "2025-10-15", "진행상태": "설계"},
    {"수주번호": "SO-2025-011", "고객사": "코오롱인더스트리", "설비명": "섬유 검사 자동화", "수주금액": 1.7, "계약일": "2025-05-10", "납기": "2025-08-15", "진행상태": "생산"},
    {"수주번호": "SO-2025-012", "고객사": "효성중공업㈜", "설비명": "변압기 코어 조립", "수주금액": 4.1, "계약일": "2025-05-20", "납기": "2025-11-15", "진행상태": "수주"},
    {"수주번호": "SO-2025-013", "고객사": "롯데케미칼㈜", "설비명": "화학 공정 모니터링", "수주금액": 2.4, "계약일": "2024-11-01", "납기": "2025-05-31", "진행상태": "납품"},
    {"수주번호": "SO-2024-045", "고객사": "현대제철㈜", "설비명": "압연 공정 AI 제어", "수주금액": 5.0, "계약일": "2024-09-15", "납기": "2025-04-30", "진행상태": "납품"},
    {"수주번호": "SO-2024-038", "고객사": "삼성전자㈜ DS부문", "설비명": "웨이퍼 검사 시스템 (취소)", "수주금액": 8.5, "계약일": "2024-08-01", "납기": "2025-03-31", "진행상태": "취소"},
]

COST_PROJECTS = [
    {"프로젝트": "현대차 CNC 라인", "예산_재료비": 180, "실적_재료비": 195, "예산_노무비": 120, "실적_노무비": 118, "예산_간접비": 50, "실적_간접비": 55},
    {"프로젝트": "삼성SDI 배터리팩", "예산_재료비": 310, "실적_재료비": 305, "예산_노무비": 160, "실적_노무비": 172, "예산_간접비": 70, "실적_간접비": 68},
    {"프로젝트": "LG에너지 전극코팅", "예산_재료비": 160, "실적_재료비": 162, "예산_노무비": 90, "실적_노무비": 88, "예산_간접비": 40, "실적_간접비": 41},
    {"프로젝트": "SK하이닉스 이송로봇", "예산_재료비": 95, "실적_재료비": 98, "예산_노무비": 55, "실적_노무비": 57, "예산_간접비": 25, "실적_간접비": 26},
    {"프로젝트": "포스코 철강절단", "예산_재료비": 85, "실적_재료비": 110, "예산_노무비": 45, "실적_노무비": 52, "예산_간접비": 20, "실적_간접비": 28},
    {"프로젝트": "한화에어로 항공부품", "예산_재료비": 260, "실적_재료비": 255, "예산_노무비": 140, "실적_노무비": 138, "예산_간접비": 60, "실적_간접비": 59},
    {"프로젝트": "두산 발전기조립", "예산_재료비": 340, "실적_재료비": 338, "예산_노무비": 180, "실적_노무비": 175, "예산_간접비": 80, "실적_간접비": 78},
    {"프로젝트": "현대로템 용접자동화", "예산_재료비": 225, "실적_재료비": 240, "예산_노무비": 120, "실적_노무비": 135, "예산_간접비": 55, "실적_간접비": 62},
]

MONTHLY_REVENUE = [8.2, 7.5, 9.1, 10.3, 11.8, 12.4, 0, 0, 0, 0, 0, 0]
MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

QUARTERLY_DATA = [
    {"분기": "2024 Q1", "매출": 22.5, "원가": 16.2, "이익": 6.3, "이익률": 28.0},
    {"분기": "2024 Q2", "매출": 27.8, "원가": 19.8, "이익": 8.0, "이익률": 28.8},
    {"분기": "2024 Q3", "매출": 31.2, "원가": 21.9, "이익": 9.3, "이익률": 29.8},
    {"분기": "2024 Q4", "매출": 36.8, "원가": 25.5, "이익": 11.3, "이익률": 30.7},
    {"분기": "2025 Q1", "매출": 24.8, "원가": 17.2, "이익": 7.6, "이익률": 30.6},
    {"분기": "2025 Q2 (예상)", "매출": 36.5, "원가": 24.8, "이익": 11.7, "이익률": 32.1},
]

STATUS_COLOR = {
    "DRAFT": ("🔵", "#3B82F6", "작성중"),
    "IN_REVIEW": ("🟡", "#F59E0B", "검토중"),
    "APPROVED": ("🟢", "#10B981", "승인완료"),
    "ISSUED": ("🟣", "#8B5CF6", "발행완료"),
}

ORDER_STATUS_COLOR = {
    "수주": "#6366F1",
    "설계": "#3B82F6",
    "생산": "#F59E0B",
    "FAT": "#EF4444",
    "납품": "#10B981",
    "취소": "#9CA3AF",
}

# ─────────────────────────────────────────────
# TABS
# ─────────────────────────────────────────────

tab1, tab2, tab3, tab4 = st.tabs(["📄 견적 관리", "💰 원가 분석", "📝 수주/계약", "📊 재무 리포트"])

# ══════════════════════════════════════════════════════
# TAB 1 — 견적 관리
# ══════════════════════════════════════════════════════
with tab1:
    # KPI Row
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        render_kpi_card("이번달 견적", "12건", delta="+3건 전월대비", icon="📄")
    with k2:
        render_kpi_card("승인 완료", "8건", delta="67% 승인율", icon="✅")
    with k3:
        render_kpi_card("발행 완료", "6건", delta="50% 발행율", icon="📨")
    with k4:
        render_kpi_card("총 견적 금액", "₩28.4억", delta="+15% 전월대비", icon="💵")

    st.divider()

    sub1, sub2, sub3, sub4 = st.tabs(["견적 목록", "견적서 작성", "승인 워크플로우", "견적 발행"])

    # ── 견적 목록 ──────────────────────────────────────
    with sub1:
        col_filter, col_btn = st.columns([3, 1])
        with col_filter:
            filter_status = st.multiselect(
                "상태 필터",
                options=["DRAFT", "IN_REVIEW", "APPROVED", "ISSUED"],
                default=["DRAFT", "IN_REVIEW", "APPROVED", "ISSUED"],
                format_func=lambda x: STATUS_COLOR[x][2],
            )
        with col_btn:
            st.write("")
            if st.button("🤖 AI 견적 생성", use_container_width=True, type="primary"):
                st.switch_page("pages/05_ai_agent.py")

        filtered = [q for q in QUOTES if q["상태"] in filter_status]
        df_q = pd.DataFrame(filtered)
        df_q["견적금액(억)"] = df_q["견적금액"].apply(lambda x: f"₩{x:.1f}억")

        for _, row in df_q.iterrows():
            icon, color, label = STATUS_COLOR[row["상태"]]
            with st.container():
                c1, c2, c3, c4, c5 = st.columns([2, 2.5, 2.5, 1.5, 1])
                with c1:
                    st.markdown(f"**{row['견적번호']}**")
                    st.caption(row["작성일"])
                with c2:
                    st.write(row["고객사"])
                    st.caption(row["설비명"])
                with c3:
                    st.markdown(f"**{row['견적금액(억)']}**")
                    st.caption(f"담당: {row['담당자']}")
                with c4:
                    st.markdown(
                        f"<span style='background:{color};color:white;padding:2px 10px;"
                        f"border-radius:12px;font-size:12px'>{icon} {label}</span>",
                        unsafe_allow_html=True,
                    )
                with c5:
                    st.button("상세", key=f"detail_{row['견적번호']}")
        st.caption(f"총 {len(filtered)}건 표시")

    # ── 견적서 작성 ────────────────────────────────────
    with sub2:
        st.subheader("견적서 작성")
        with st.form("quote_form"):
            col_a, col_b = st.columns(2)
            with col_a:
                customer = st.text_input("고객사 *", placeholder="예: 현대자동차㈜")
                contact = st.text_input("담당자", placeholder="예: 홍길동 부장")
                equip_type = st.selectbox(
                    "설비 유형",
                    ["자동화 조립 설비", "CNC 가공 라인", "용접 자동화", "검사/측정 설비", "이송/물류 자동화", "기타"],
                )
            with col_b:
                valid_date = st.date_input("유효기간", value=datetime.today() + timedelta(days=30))
                ref_project = st.text_input("참조 프로젝트", placeholder="예: SO-2025-001")
                engineer = st.selectbox("담당 엔지니어", ["김민준", "이서연", "박지훈", "최수아"])

            st.markdown("#### 금액 구성")
            default_items = pd.DataFrame(
                [
                    {"항목명": "기계 구조물", "재료비": 45000000, "노무비": 12000000, "간접비": 5000000},
                    {"항목명": "전기/제어 시스템", "재료비": 32000000, "노무비": 18000000, "간접비": 7000000},
                    {"항목명": "소프트웨어", "재료비": 5000000, "노무비": 25000000, "간접비": 8000000},
                    {"항목명": "설치/시운전", "재료비": 3000000, "노무비": 20000000, "간접비": 4000000},
                    {"항목명": "교육/문서화", "재료비": 0, "노무비": 8000000, "간접비": 2000000},
                ]
            )
            edited_df = st.data_editor(
                default_items,
                use_container_width=True,
                num_rows="dynamic",
                column_config={
                    "재료비": st.column_config.NumberColumn("재료비 (원)", format="₩%d"),
                    "노무비": st.column_config.NumberColumn("노무비 (원)", format="₩%d"),
                    "간접비": st.column_config.NumberColumn("간접비 (원)", format="₩%d"),
                },
            )

            total_mat = edited_df["재료비"].sum()
            total_lab = edited_df["노무비"].sum()
            total_ovh = edited_df["간접비"].sum()
            subtotal = total_mat + total_lab + total_ovh
            margin_rate = st.slider("마진율 (%)", min_value=5, max_value=40, value=22)
            margin_amt = subtotal * margin_rate / 100
            final_total = subtotal + margin_amt

            mc1, mc2, mc3, mc4 = st.columns(4)
            mc1.metric("재료비 소계", f"₩{total_mat/1e8:.2f}억")
            mc2.metric("노무비 소계", f"₩{total_lab/1e8:.2f}억")
            mc3.metric("간접비 소계", f"₩{total_ovh/1e8:.2f}억")
            mc4.metric("최종 견적금액", f"₩{final_total/1e8:.2f}억", delta=f"마진 ₩{margin_amt/1e6:.0f}백만")

            remarks = st.text_area("비고/특이사항", placeholder="납기 조건, 보증 기간, 특수 요구사항 등을 입력하세요.")

            btn1, btn2, btn3 = st.columns(3)
            with btn1:
                save_draft = st.form_submit_button("💾 임시저장", use_container_width=True)
            with btn2:
                ai_review = st.form_submit_button("🤖 AI 검토", use_container_width=True)
            with btn3:
                submit_approval = st.form_submit_button("📤 승인 요청", use_container_width=True, type="primary")

        if save_draft:
            st.success("임시저장 완료 (QT-2025-TMP-001)")
        if ai_review:
            st.info("🤖 AI 원가 검토 중... 유사 프로젝트 대비 재료비 +5% 수준입니다. 노무비는 적정 범위입니다.")
        if submit_approval:
            st.success("승인 요청이 제출되었습니다. 검토자: 이서연 팀장")

    # ── 승인 워크플로우 ────────────────────────────────
    with sub3:
        st.subheader("승인 대기 목록")
        pending = [q for q in QUOTES if q["상태"] == "IN_REVIEW"]
        for q in pending:
            with st.expander(f"📋 {q['견적번호']} — {q['고객사']} | ₩{q['견적금액']:.1f}억"):
                col_info, col_summary = st.columns([1, 1])
                with col_info:
                    st.markdown(f"**설비명:** {q['설비명']}")
                    st.markdown(f"**작성일:** {q['작성일']}")
                    st.markdown(f"**작성자:** {q['담당자']}")
                with col_summary:
                    st.markdown("**원가 분석 요약**")
                    est = q["견적금액"] * 1e8
                    st.write(f"- 재료비: ₩{est*0.45/1e6:.0f}백만 (45%)")
                    st.write(f"- 노무비: ₩{est*0.32/1e6:.0f}백만 (32%)")
                    st.write(f"- 간접비: ₩{est*0.10/1e6:.0f}백만 (10%)")
                    st.write(f"- 마진: ₩{est*0.13/1e6:.0f}백만 (13%)")

                comment = st.text_input("코멘트", key=f"comment_{q['견적번호']}", placeholder="승인/반려 사유를 입력하세요.")
                col_app, col_rej = st.columns(2)
                with col_app:
                    if st.button("✅ 승인", key=f"approve_{q['견적번호']}", use_container_width=True, type="primary"):
                        st.success(f"{q['견적번호']} 승인 완료")
                with col_rej:
                    if st.button("❌ 반려", key=f"reject_{q['견적번호']}", use_container_width=True):
                        st.error(f"{q['견적번호']} 반려 처리")

        st.divider()
        st.subheader("승인 이력")
        timeline_data = [
            {"일시": "2025-06-04 09:15", "견적번호": "QT-2025-012", "고객사": "효성중공업㈜", "처리": "승인", "처리자": "이서연 팀장", "코멘트": "가격 적정, 승인"},
            {"일시": "2025-06-03 16:42", "견적번호": "QT-2025-008", "고객사": "현대로템㈜", "처리": "승인", "처리자": "이서연 팀장", "코멘트": "원가 검토 완료"},
            {"일시": "2025-06-02 11:30", "견적번호": "QT-2025-005", "고객사": "포스코인터내셔널", "처리": "승인", "처리자": "박지훈 차장", "코멘트": "정상 처리"},
            {"일시": "2025-06-01 14:20", "견적번호": "QT-2025-003_R1", "고객사": "LG에너지솔루션", "처리": "반려", "처리자": "이서연 팀장", "코멘트": "노무비 재산정 필요"},
            {"일시": "2025-05-30 10:05", "견적번호": "QT-2025-001", "고객사": "현대자동차㈜", "처리": "승인", "처리자": "이서연 팀장", "코멘트": "경쟁 입찰 고려하여 승인"},
        ]
        for t in timeline_data:
            icon = "✅" if t["처리"] == "승인" else "❌"
            color = "#10B981" if t["처리"] == "승인" else "#EF4444"
            st.markdown(
                f"<div style='border-left:3px solid {color};padding:6px 12px;margin-bottom:8px'>"
                f"<b>{icon} {t['견적번호']}</b> — {t['고객사']}&nbsp;&nbsp;"
                f"<span style='color:#6B7280;font-size:12px'>{t['일시']} | {t['처리자']}</span><br>"
                f"<span style='color:#374151'>{t['코멘트']}</span>"
                f"</div>",
                unsafe_allow_html=True,
            )

    # ── 견적 발행 ──────────────────────────────────────
    with sub4:
        st.subheader("발행 대기 견적")
        issuable = [q for q in QUOTES if q["상태"] == "APPROVED"]
        for q in issuable:
            with st.container():
                c1, c2, c3 = st.columns([3, 2, 2])
                with c1:
                    st.markdown(f"**{q['견적번호']}** — {q['고객사']}")
                    st.caption(f"{q['설비명']} | ₩{q['견적금액']:.1f}억 | 담당: {q['담당자']}")
                with c2:
                    mock_pdf = b"[PDF Mock Content for " + q["견적번호"].encode() + b"]"
                    st.download_button(
                        label="📄 PDF 생성",
                        data=mock_pdf,
                        file_name=f"{q['견적번호']}_견적서.pdf",
                        mime="application/pdf",
                        key=f"pdf_{q['견적번호']}",
                        use_container_width=True,
                    )
                with c3:
                    if st.button("📧 이메일 발송", key=f"email_btn_{q['견적번호']}", use_container_width=True):
                        st.session_state[f"email_open_{q['견적번호']}"] = True

                if st.session_state.get(f"email_open_{q['견적번호']}", False):
                    with st.form(f"email_form_{q['견적번호']}"):
                        st.text_input("수신자", value="", placeholder="example@company.co.kr")
                        st.text_input("제목", value=f"[아코스] {q['견적번호']} 견적서 송부 드립니다")
                        st.text_area(
                            "본문",
                            value=f"안녕하세요,\n\n{q['고객사']} 귀중\n\n요청하신 {q['설비명']}에 대한 견적서를 첨부하여 송부 드립니다.\n\n감사합니다.\n아코스 영업팀 드림",
                        )
                        if st.form_submit_button("발송", type="primary"):
                            st.success("이메일이 발송되었습니다.")
                            del st.session_state[f"email_open_{q['견적번호']}"]

            st.divider()


# ══════════════════════════════════════════════════════
# TAB 2 — 원가 분석
# ══════════════════════════════════════════════════════
with tab2:
    col_proj, col_period = st.columns([2, 1])
    with col_proj:
        selected_proj = st.selectbox(
            "프로젝트 선택",
            ["전체"] + [p["프로젝트"] for p in COST_PROJECTS],
        )
    with col_period:
        period = st.selectbox("기간", ["2025년 상반기", "2025년 전체", "2024년 전체", "최근 12개월"])

    # 예산 vs 실적 bar chart
    df_cost = pd.DataFrame(COST_PROJECTS)
    if selected_proj != "전체":
        df_cost = df_cost[df_cost["프로젝트"] == selected_proj]

    fig_budget = go.Figure()
    categories = ["재료비", "노무비", "간접비"]
    colors_budget = ["#3B82F6", "#10B981", "#F59E0B"]
    colors_actual = ["#1D4ED8", "#047857", "#B45309"]

    for cat, cb, ca in zip(categories, colors_budget, colors_actual):
        fig_budget.add_trace(
            go.Bar(name=f"예산 {cat}", x=df_cost["프로젝트"], y=df_cost[f"예산_{cat}"], marker_color=cb, opacity=0.7)
        )
        fig_budget.add_trace(
            go.Bar(name=f"실적 {cat}", x=df_cost["프로젝트"], y=df_cost[f"실적_{cat}"], marker_color=ca)
        )

    fig_budget.update_layout(
        barmode="group",
        title="예산 vs 실적 비교 (단위: 백만원)",
        height=380,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    )
    st.plotly_chart(fig_budget, use_container_width=True)

    ca1, ca2, ca3, ca4 = st.tabs(["프로젝트별 원가", "재료비 분석", "노무비 분석", "원가 초과 알림"])

    # ── 프로젝트별 원가 ────────────────────────────────
    with ca1:
        df_proj_cost = pd.DataFrame(COST_PROJECTS).copy()
        df_proj_cost["총예산"] = df_proj_cost["예산_재료비"] + df_proj_cost["예산_노무비"] + df_proj_cost["예산_간접비"]
        df_proj_cost["총실적"] = df_proj_cost["실적_재료비"] + df_proj_cost["실적_노무비"] + df_proj_cost["실적_간접비"]
        df_proj_cost["달성률(%)"] = (df_proj_cost["총실적"] / df_proj_cost["총예산"] * 100).round(1)
        df_proj_cost["초과여부"] = df_proj_cost["달성률(%)"] > 100

        for _, row in df_proj_cost.iterrows():
            bg = "#FEF2F2" if row["초과여부"] else "#F0FDF4"
            border = "#EF4444" if row["초과여부"] else "#10B981"
            badge = "🔴 예산 초과" if row["초과여부"] else "🟢 정상"
            st.markdown(
                f"<div style='background:{bg};border-left:4px solid {border};padding:10px 14px;margin-bottom:8px;border-radius:4px'>"
                f"<b>{row['프로젝트']}</b>&nbsp;<span style='font-size:12px'>{badge}</span><br>"
                f"예산: ₩{row['총예산']}백만 &nbsp;|&nbsp; 실적: ₩{row['총실적']}백만 &nbsp;|&nbsp; 달성률: {row['달성률(%)']}%"
                f"</div>",
                unsafe_allow_html=True,
            )
            progress_val = min(row["달성률(%)"] / 100, 1.0)
            st.progress(progress_val)

    # ── 재료비 분석 ────────────────────────────────────
    with ca2:
        parts = pd.DataFrame(
            {
                "부품명": ["서보모터", "PLC 컨트롤러", "볼스크류 LM가이드", "센서 세트", "스테인리스 플레이트",
                           "AC 드라이브", "비전 카메라", "공압 밸브 세트", "안전 울타리", "케이블 트레이"],
                "금액(백만원)": [85, 72, 58, 44, 38, 31, 28, 22, 18, 14],
                "비중(%)": [20.2, 17.1, 13.8, 10.5, 9.0, 7.4, 6.7, 5.2, 4.3, 3.3],
            }
        )

        fig_treemap = px.treemap(
            parts,
            path=["부품명"],
            values="금액(백만원)",
            title="부품별 재료비 구성 (Treemap)",
            color="금액(백만원)",
            color_continuous_scale="Blues",
        )
        fig_treemap.update_layout(height=350)
        st.plotly_chart(fig_treemap, use_container_width=True)

        st.markdown("#### 주요 고가 부품 TOP 10")
        st.dataframe(parts, use_container_width=True, hide_index=True)

    # ── 노무비 분석 ────────────────────────────────────
    with ca3:
        labor_data = pd.DataFrame(
            {
                "공정/작업자": ["기계설계", "전기설계", "SW개발", "기계조립", "전기배선", "시운전/조정", "품질검사", "관리/지원"],
                "예산(백만원)": [45, 38, 55, 30, 28, 35, 20, 15],
                "실적(백만원)": [47, 40, 52, 32, 31, 38, 19, 17],
                "단가(만원/h)": [8.5, 7.8, 9.2, 6.5, 6.2, 7.5, 6.8, 6.0],
            }
        )

        fig_labor = go.Figure(
            data=[
                go.Bar(name="예산", y=labor_data["공정/작업자"], x=labor_data["예산(백만원)"], orientation="h", marker_color="#3B82F6"),
                go.Bar(name="실적", y=labor_data["공정/작업자"], x=labor_data["실적(백만원)"], orientation="h", marker_color="#1D4ED8"),
            ]
        )
        fig_labor.update_layout(barmode="group", title="공정별 노무비 예산 vs 실적", height=380)
        st.plotly_chart(fig_labor, use_container_width=True)

        st.markdown("#### 시간당 단가 현황")
        st.dataframe(labor_data[["공정/작업자", "단가(만원/h)"]], use_container_width=True, hide_index=True)

    # ── 원가 초과 알림 ─────────────────────────────────
    with ca4:
        st.subheader("원가 초과 위험 프로젝트")
        alerts = [
            {
                "프로젝트": "포스코인터내셔널 철강절단",
                "초과율": "+29.4%",
                "원인": "스테인리스 재료 단가 급등 (+18%) + 공정 설계 변경으로 추가 노무 발생",
                "권장조치": "고객사와 추가 금액 협의 또는 대체 재료 검토 필요",
                "긴급도": "높음",
            },
            {
                "프로젝트": "현대로템 용접자동화",
                "초과율": "+13.3%",
                "원인": "시운전 기간 연장 (2주)로 인한 노무비 초과, 용접봉 소모 증가",
                "권장조치": "시운전 일정 최적화 및 추가 인력 투입 검토",
                "긴급도": "중간",
            },
            {
                "프로젝트": "현대차 CNC 라인",
                "초과율": "+5.9%",
                "원인": "고객 요구사항 추가 (안전 인터락 강화)로 인한 전기 부품 증가",
                "권장조치": "변경 사양서 작성 후 추가 청구 검토",
                "긴급도": "낮음",
            },
        ]
        for a in alerts:
            color = {"높음": "#EF4444", "중간": "#F59E0B", "낮음": "#3B82F6"}[a["긴급도"]]
            bg = {"높음": "#FEF2F2", "중간": "#FFFBEB", "낮음": "#EFF6FF"}[a["긴급도"]]
            st.markdown(
                f"<div style='background:{bg};border:1px solid {color};border-radius:8px;padding:14px;margin-bottom:12px'>"
                f"<div style='display:flex;justify-content:space-between'>"
                f"<b style='font-size:15px'>{a['프로젝트']}</b>"
                f"<span style='background:{color};color:white;padding:2px 10px;border-radius:12px;font-size:12px'>초과 {a['초과율']} | {a['긴급도']} 긴급</span>"
                f"</div>"
                f"<p style='margin:8px 0 4px 0;color:#374151'><b>원인:</b> {a['원인']}</p>"
                f"<p style='margin:0;color:#374151'><b>권장 조치:</b> {a['권장조치']}</p>"
                f"</div>",
                unsafe_allow_html=True,
            )


# ══════════════════════════════════════════════════════
# TAB 3 — 수주/계약 관리
# ══════════════════════════════════════════════════════
with tab3:
    # KPI Row
    ok1, ok2, ok3, ok4 = st.columns(4)
    with ok1:
        render_kpi_card("이번년도 수주", "23건 / ₩45억", delta="+18% 전년대비", icon="📦")
    with ok2:
        render_kpi_card("진행중", "12건", delta="₩28.5억 규모", icon="⚙️")
    with ok3:
        render_kpi_card("완료", "8건", delta="₩13.1억 납품", icon="✅")
    with ok4:
        render_kpi_card("취소", "3건", delta="₩11.9억 취소", icon="❌")

    st.divider()

    # 수주 파이프라인 시각화
    st.subheader("수주 파이프라인 현황")
    pipeline_stages = ["수주", "설계", "생산", "FAT", "납품"]
    pipeline_counts = {s: sum(1 for o in ORDERS if o["진행상태"] == s) for s in pipeline_stages}
    pipeline_amounts = {s: sum(o["수주금액"] for o in ORDERS if o["진행상태"] == s) for s in pipeline_stages}

    pcols = st.columns(len(pipeline_stages))
    for i, (stage, col) in enumerate(zip(pipeline_stages, pcols)):
        color = ORDER_STATUS_COLOR[stage]
        with col:
            st.markdown(
                f"<div style='text-align:center;background:{color}22;border:2px solid {color};"
                f"border-radius:8px;padding:12px'>"
                f"<div style='font-size:20px;font-weight:bold;color:{color}'>{pipeline_counts[stage]}건</div>"
                f"<div style='font-size:13px;font-weight:600'>{stage}</div>"
                f"<div style='font-size:12px;color:#6B7280'>₩{pipeline_amounts[stage]:.1f}억</div>"
                f"</div>",
                unsafe_allow_html=True,
            )
        if i < len(pipeline_stages) - 1:
            pass

    st.divider()

    osub1, osub2, osub3 = st.tabs(["수주 목록", "수주 등록", "계약서 관리"])

    # ── 수주 목록 ──────────────────────────────────────
    with osub1:
        stage_filter = st.multiselect(
            "진행상태 필터",
            options=["수주", "설계", "생산", "FAT", "납품", "취소"],
            default=["수주", "설계", "생산", "FAT", "납품"],
        )
        filtered_orders = [o for o in ORDERS if o["진행상태"] in stage_filter]

        df_orders = pd.DataFrame(filtered_orders)
        for _, row in df_orders.iterrows():
            color = ORDER_STATUS_COLOR.get(row["진행상태"], "#9CA3AF")
            st.markdown(
                f"<div style='border-left:4px solid {color};padding:8px 12px;margin-bottom:6px;background:#F9FAFB;border-radius:4px'>"
                f"<b>{row['수주번호']}</b> &nbsp; {row['고객사']} &nbsp;|&nbsp; {row['설비명']}<br>"
                f"₩{row['수주금액']:.1f}억 &nbsp;|&nbsp; 계약일: {row['계약일']} &nbsp;|&nbsp; 납기: {row['납기']} &nbsp;|&nbsp; "
                f"<span style='background:{color};color:white;padding:1px 8px;border-radius:10px;font-size:12px'>{row['진행상태']}</span>"
                f"</div>",
                unsafe_allow_html=True,
            )
        st.caption(f"총 {len(filtered_orders)}건 표시")

    # ── 수주 등록 ──────────────────────────────────────
    with osub2:
        st.subheader("신규 수주 등록")
        with st.form("order_form"):
            col_o1, col_o2 = st.columns(2)
            with col_o1:
                o_customer = st.text_input("고객사 *", placeholder="예: 삼성SDI㈜")
                o_contact = st.text_input("고객 담당자", placeholder="예: 홍길동 부장")
                o_contact_tel = st.text_input("연락처", placeholder="예: 02-1234-5678")
                o_equip = st.selectbox(
                    "설비 유형 *",
                    ["자동화 조립 설비", "CNC 가공 라인", "용접 자동화", "검사/측정 설비", "이송/물류 자동화", "기타"],
                )
            with col_o2:
                o_deadline = st.date_input("납기 요구일 *", value=datetime.today() + timedelta(days=180))
                o_amount = st.number_input("예상 금액 (백만원)", min_value=0, value=300, step=10)
                o_ref_quote = st.text_input("참조 견적서", placeholder="예: QT-2025-001")
                o_priority = st.selectbox("우선순위", ["일반", "긴급", "전략"])
            o_special = st.text_area("특수 요구사항", placeholder="CE 인증 필요, 방폭 구조 적용, 클린룸 환경 등")
            col_os1, col_os2 = st.columns(2)
            with col_os1:
                if st.form_submit_button("💾 저장", use_container_width=True, type="primary"):
                    st.success(f"수주 등록 완료: SO-2025-{len(ORDERS)+1:03d}")
            with col_os2:
                if st.form_submit_button("취소", use_container_width=True):
                    st.info("취소되었습니다.")

    # ── 계약서 관리 ────────────────────────────────────
    with osub3:
        st.subheader("계약서 관리")
        contracts = [
            {"계약번호": "CT-2025-001", "수주번호": "SO-2025-001", "계약일": "2025-01-15", "금액": "₩4.5억", "첨부파일": "계약서_현대차_CNC.pdf"},
            {"계약번호": "CT-2025-002", "수주번호": "SO-2025-002", "계약일": "2025-02-01", "금액": "₩7.2억", "첨부파일": "계약서_삼성SDI_배터리팩.pdf"},
            {"계약번호": "CT-2025-003", "수주번호": "SO-2025-003", "계약일": "2025-02-20", "금액": "₩3.8억", "첨부파일": "계약서_LG에너지_전극코팅.pdf"},
            {"계약번호": "CT-2025-004", "수주번호": "SO-2025-004", "계약일": "2025-03-05", "금액": "₩2.3억", "첨부파일": "계약서_SK하이닉스_이송로봇.pdf"},
            {"계약번호": "CT-2025-005", "수주번호": "SO-2025-006", "계약일": "2025-03-25", "금액": "₩6.0억", "첨부파일": "계약서_한화에어로_항공부품.pdf"},
        ]
        df_ct = pd.DataFrame(contracts)
        st.dataframe(df_ct, use_container_width=True, hide_index=True)

        st.markdown("#### 계약서 업로드")
        col_ct1, col_ct2 = st.columns(2)
        with col_ct1:
            ct_order = st.selectbox("수주번호 연결", [o["수주번호"] for o in ORDERS[:8]])
        with col_ct2:
            ct_file = st.file_uploader("계약서 파일 (PDF, DOCX)", type=["pdf", "docx"])
        if ct_file and st.button("업로드", type="primary"):
            st.success(f"{ct_file.name} 업로드 완료 ({ct_order}에 연결)")


# ══════════════════════════════════════════════════════
# TAB 4 — 재무 리포트
# ══════════════════════════════════════════════════════
with tab4:
    period_type = st.radio("기간 선택", ["월별", "분기별", "연간"], horizontal=True)
    st.divider()

    fsub1, fsub2, fsub3 = st.tabs(["매출 현황", "이익률 분석", "월별/분기별 리포트"])

    # ── 매출 현황 ──────────────────────────────────────
    with fsub1:
        fk1, fk2, fk3, fk4 = st.columns(4)
        with fk1:
            render_kpi_card("이번달 매출", "₩12.4억", delta="+22% 전년동월", icon="📈")
        with fk2:
            render_kpi_card("이번년도 누계", "₩54.3억", delta="+18% 전년대비", icon="💹")
        with fk3:
            render_kpi_card("전년도 동기", "₩45.8억", delta="비교 기준", icon="📊")
        with fk4:
            render_kpi_card("목표 달성율", "87.5%", delta="목표 ₩62억", icon="🎯")

        # 월별 매출 bar chart
        df_monthly = pd.DataFrame({"월": MONTHS, "매출(억원)": MONTHLY_REVENUE})
        df_monthly_actual = df_monthly[df_monthly["매출(억원)"] > 0]

        fig_monthly = go.Figure()
        fig_monthly.add_trace(
            go.Bar(
                x=df_monthly_actual["월"],
                y=df_monthly_actual["매출(억원)"],
                marker_color=["#3B82F6"] * 5 + ["#10B981"],
                text=[f"₩{v:.1f}억" for v in df_monthly_actual["매출(억원)"]],
                textposition="outside",
            )
        )
        fig_monthly.add_hline(y=df_monthly_actual["매출(억원)"].mean(), line_dash="dash", line_color="#EF4444",
                              annotation_text=f"평균 ₩{df_monthly_actual['매출(억원)'].mean():.1f}억")
        fig_monthly.update_layout(title="월별 매출 현황 (2025년)", height=350, yaxis_title="매출(억원)")
        st.plotly_chart(fig_monthly, use_container_width=True)

        # 고객사별 매출 pie
        customer_revenue = pd.DataFrame(
            {
                "고객사": ["현대자동차그룹", "삼성그룹", "LG그룹", "SK그룹", "한화그룹", "포스코그룹", "두산그룹", "기타"],
                "매출(억원)": [12.3, 10.5, 7.8, 5.2, 6.0, 4.5, 4.5, 3.5],
            }
        )
        fig_pie = px.pie(
            customer_revenue,
            names="고객사",
            values="매출(억원)",
            title="고객사별 매출 비중 (2025년 상반기)",
            hole=0.4,
            color_discrete_sequence=px.colors.qualitative.Set3,
        )
        fig_pie.update_layout(height=380)
        st.plotly_chart(fig_pie, use_container_width=True)

    # ── 이익률 분석 ────────────────────────────────────
    with fsub2:
        profit_data = pd.DataFrame(
            {
                "프로젝트": ["현대차 CNC 라인", "삼성SDI 배터리팩", "LG에너지 전극코팅", "SK하이닉스 이송로봇",
                            "한화에어로 항공부품", "두산 발전기조립", "현대로템 용접자동화", "기아차 프레스 라인"],
                "수주금액(억)": [4.5, 7.2, 3.8, 2.3, 6.0, 7.8, 5.2, 3.6],
                "원가(억)": [3.4, 5.2, 2.9, 1.75, 4.5, 5.7, 4.1, 2.6],
                "이익률(%)": [24.4, 27.8, 23.7, 23.9, 25.0, 26.9, 21.2, 27.8],
            }
        )

        fig_profit = px.bar(
            profit_data.sort_values("이익률(%)"),
            x="이익률(%)",
            y="프로젝트",
            orientation="h",
            title="프로젝트별 이익률",
            color="이익률(%)",
            color_continuous_scale=["#EF4444", "#F59E0B", "#10B981"],
            text="이익률(%)",
        )
        fig_profit.update_traces(texttemplate="%{text:.1f}%", textposition="outside")
        fig_profit.add_vline(x=25.0, line_dash="dash", line_color="#6366F1", annotation_text="목표 25%")
        fig_profit.update_layout(height=380, showlegend=False)
        st.plotly_chart(fig_profit, use_container_width=True)

        # 이익률 트렌드 line chart
        trend_months = ["2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
                        "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"]
        trend_profit = [24.1, 24.8, 25.3, 26.1, 27.2, 28.0, 28.5, 29.1, 30.2, 30.8, 31.5, 32.1]

        fig_trend = go.Figure()
        fig_trend.add_trace(
            go.Scatter(x=trend_months, y=trend_profit, mode="lines+markers", name="실제 이익률",
                       line=dict(color="#3B82F6", width=2), marker=dict(size=6))
        )
        fig_trend.add_hline(y=25.0, line_dash="dash", line_color="#EF4444", annotation_text="목표 이익률 25%")
        fig_trend.update_layout(title="월별 이익률 트렌드 (%)", height=320, yaxis_title="이익률 (%)")
        st.plotly_chart(fig_trend, use_container_width=True)

        avg_profit = sum(trend_profit[-6:]) / 6
        ip1, ip2, ip3 = st.columns(3)
        ip1.metric("최근 6개월 평균 이익률", f"{avg_profit:.1f}%", delta=f"+{avg_profit-25:.1f}%p vs 목표")
        ip2.metric("이번달 이익률", "32.1%", delta="+1.2%p 전월대비")
        ip3.metric("목표 이익률", "25.0%", delta="목표 달성 ✅")

    # ── 월별/분기별 리포트 ─────────────────────────────
    with fsub3:
        st.subheader("분기별 요약")
        df_qtr = pd.DataFrame(QUARTERLY_DATA)

        # YoY / QoQ
        col_yoy, col_qoq = st.columns(2)
        with col_yoy:
            st.metric("YoY 매출 성장", "+18.2%", delta="2024 vs 2025 상반기 비교")
        with col_qoq:
            st.metric("QoQ 매출 성장", "+11.5%", delta="Q1 → Q2 2025")

        # 분기 테이블
        st.dataframe(
            df_qtr.style.format(
                {"매출": "₩{:.1f}억", "원가": "₩{:.1f}억", "이익": "₩{:.1f}억", "이익률": "{:.1f}%"}
            ).background_gradient(subset=["이익률"], cmap="Greens"),
            use_container_width=True,
            hide_index=True,
        )

        # 분기별 매출/이익 bar+line combo
        fig_qtr = go.Figure()
        fig_qtr.add_trace(go.Bar(name="매출", x=df_qtr["분기"], y=df_qtr["매출"], marker_color="#3B82F6", opacity=0.8))
        fig_qtr.add_trace(go.Bar(name="원가", x=df_qtr["분기"], y=df_qtr["원가"], marker_color="#F59E0B", opacity=0.8))
        fig_qtr.add_trace(
            go.Scatter(name="이익률(%)", x=df_qtr["분기"], y=df_qtr["이익률"], mode="lines+markers",
                       yaxis="y2", line=dict(color="#10B981", width=2), marker=dict(size=7))
        )
        fig_qtr.update_layout(
            barmode="group",
            title="분기별 매출/원가/이익률",
            height=380,
            yaxis=dict(title="금액(억원)"),
            yaxis2=dict(title="이익률(%)", overlaying="y", side="right", range=[20, 40]),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        )
        st.plotly_chart(fig_qtr, use_container_width=True)

        # 다운로드
        report_csv = df_qtr.to_csv(index=False, encoding="utf-8-sig")
        st.download_button(
            label="📥 리포트 다운로드 (CSV)",
            data=report_csv.encode("utf-8-sig"),
            file_name=f"재무리포트_{datetime.today().strftime('%Y%m%d')}.csv",
            mime="text/csv",
            use_container_width=False,
        )
