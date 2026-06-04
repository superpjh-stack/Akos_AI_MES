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

st.set_page_config(page_title="관리자 | Akos AI MES", layout="wide")

st.markdown("""
<style>
.admin-header {
    background: linear-gradient(135deg, #1a1f35 0%, #2d1b4e 100%);
    border-left: 5px solid #8b5cf6;
    border-radius: 8px;
    padding: 16px 24px;
    margin-bottom: 20px;
}
.admin-header h1 { color: #f0f2f6; margin: 0; font-size: 1.6rem; }
.admin-header p  { color: #9ba3af; margin: 4px 0 0; font-size: 0.85rem; }
.section-divider { border-top: 1px solid #2d3551; margin: 16px 0; }
.role-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}
.badge-admin    { background:#4c1d95; color:#ddd6fe; }
.badge-manager  { background:#1e3a5f; color:#bae6fd; }
.badge-engineer { background:#14532d; color:#bbf7d0; }
.badge-operator { background:#3f3f00; color:#fef08a; }
.log-fail   { background: rgba(220,38,38,0.15); }
.log-error  { background: rgba(220,38,38,0.15); }
.log-warn   { background: rgba(234,179,8,0.12); }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="admin-header">
  <h1>🛡️ 관리자 콘솔</h1>
  <p>사용자 관리 · 역할/권한 · 코드 관리 · 시스템 설정 · 감사 로그</p>
</div>
""", unsafe_allow_html=True)

# ── Mock data ──────────────────────────────────────────────────────────────────

USERS = [
    {"ID": "USR001", "이름": "김민준", "부서": "생산팀",   "역할": "생산관리자",  "이메일": "minjun.kim@akos.co.kr",    "최종접속일": "2026-06-04 09:12", "상태": "활성"},
    {"ID": "USR002", "이름": "이서연", "부서": "품질팀",   "역할": "품질담당자",  "이메일": "seoyeon.lee@akos.co.kr",   "최종접속일": "2026-06-04 08:47", "상태": "활성"},
    {"ID": "USR003", "이름": "박지훈", "부서": "IT팀",     "역할": "관리자",      "이메일": "jihoon.park@akos.co.kr",   "최종접속일": "2026-06-04 07:30", "상태": "활성"},
    {"ID": "USR004", "이름": "최수아", "부서": "설계팀",   "역할": "설계자",      "이메일": "sua.choi@akos.co.kr",      "최종접속일": "2026-06-03 17:55", "상태": "활성"},
    {"ID": "USR005", "이름": "정도현", "부서": "경영진",   "역할": "경영진",      "이메일": "dohyun.jung@akos.co.kr",   "최종접속일": "2026-06-04 10:05", "상태": "활성"},
    {"ID": "USR006", "이름": "한예진", "부서": "생산팀",   "역할": "현장작업자",  "이메일": "yejin.han@akos.co.kr",     "최종접속일": "2026-06-04 06:00", "상태": "활성"},
    {"ID": "USR007", "이름": "오준혁", "부서": "설계팀",   "역할": "PM",          "이메일": "junhyuk.oh@akos.co.kr",    "최종접속일": "2026-06-03 16:20", "상태": "활성"},
    {"ID": "USR008", "이름": "신가은", "부서": "품질팀",   "역할": "품질담당자",  "이메일": "gaeun.shin@akos.co.kr",    "최종접속일": "2026-06-02 14:33", "상태": "활성"},
    {"ID": "USR009", "이름": "임태양", "부서": "생산팀",   "역할": "현장작업자",  "이메일": "taeyang.lim@akos.co.kr",   "최종접속일": "2026-06-04 05:55", "상태": "활성"},
    {"ID": "USR010", "이름": "윤채원", "부서": "IT팀",     "역할": "설계자",      "이메일": "chaewon.yoon@akos.co.kr",  "최종접속일": "2026-06-03 11:10", "상태": "활성"},
    {"ID": "USR011", "이름": "강민서", "부서": "생산팀",   "역할": "생산관리자",  "이메일": "minseo.kang@akos.co.kr",   "최종접속일": "2026-06-03 09:00", "상태": "활성"},
    {"ID": "USR012", "이름": "조하은", "부서": "경영진",   "역할": "경영진",      "이메일": "haeun.jo@akos.co.kr",      "최종접속일": "2026-06-01 18:45", "상태": "활성"},
    {"ID": "USR013", "이름": "배성준", "부서": "설계팀",   "역할": "PM",          "이메일": "sungjun.bae@akos.co.kr",   "최종접속일": "2026-05-30 10:22", "상태": "비활성"},
    {"ID": "USR014", "이름": "권나연", "부서": "품질팀",   "역할": "품질담당자",  "이메일": "nayeon.kwon@akos.co.kr",   "최종접속일": "2026-05-28 15:11", "상태": "비활성"},
    {"ID": "USR015", "이름": "송현우", "부서": "생산팀",   "역할": "현장작업자",  "이메일": "hyunwoo.song@akos.co.kr",  "최종접속일": "2026-05-25 07:30", "상태": "비활성"},
]

ROLES = [
    {"역할명": "관리자",     "설명": "시스템 전체 관리 권한",          "사용자수": 2,  "최종수정일": "2026-05-01"},
    {"역할명": "PM",         "설명": "프로젝트 계획/진행 관리",        "사용자수": 2,  "최종수정일": "2026-05-01"},
    {"역할명": "설계자",     "설명": "BOM 및 설계 문서 작성/승인",     "사용자수": 3,  "최종수정일": "2026-05-10"},
    {"역할명": "생산관리자", "설명": "생산 계획 및 작업지시 관리",     "사용자수": 4,  "최종수정일": "2026-05-10"},
    {"역할명": "품질담당자", "설명": "FAT/품질 검사 및 승인",          "사용자수": 3,  "최종수정일": "2026-05-15"},
    {"역할명": "현장작업자", "설명": "작업 실행 및 실적 입력",         "사용자수": 6,  "최종수정일": "2026-05-15"},
    {"역할명": "경영진",     "설명": "전체 현황 조회 (읽기 전용)",     "사용자수": 2,  "최종수정일": "2026-04-20"},
]

MENUS = ["대시보드", "BOM 관리", "생산 관리", "FAT 관리", "AI 에이전트", "설비 모니터링", "품질 관리", "관리자"]
ROLE_NAMES = [r["역할명"] for r in ROLES]

# Default permission matrix  (row=menu, col=role)
DEFAULT_PERMISSIONS = {
    "대시보드":      {"관리자":"A","PM":"R","설계자":"R","생산관리자":"R","품질담당자":"R","현장작업자":"R","경영진":"R"},
    "BOM 관리":      {"관리자":"A","PM":"W","설계자":"W","생산관리자":"R","품질담당자":"R","현장작업자":"—","경영진":"R"},
    "생산 관리":     {"관리자":"A","PM":"W","설계자":"R","생산관리자":"W","품질담당자":"R","현장작업자":"W","경영진":"R"},
    "FAT 관리":      {"관리자":"A","PM":"R","설계자":"R","생산관리자":"R","품질담당자":"W","현장작업자":"R","경영진":"R"},
    "AI 에이전트":   {"관리자":"A","PM":"W","설계자":"W","생산관리자":"R","품질담당자":"R","현장작업자":"—","경영진":"R"},
    "설비 모니터링": {"관리자":"A","PM":"R","설계자":"R","생산관리자":"W","품질담당자":"R","현장작업자":"R","경영진":"R"},
    "품질 관리":     {"관리자":"A","PM":"R","설계자":"R","생산관리자":"R","품질담당자":"W","현장작업자":"R","경영진":"R"},
    "관리자":        {"관리자":"A","PM":"—","설계자":"—","생산관리자":"—","품질담당자":"—","현장작업자":"—","경영진":"—"},
}

COMMON_CODES = [
    {"코드그룹": "STATUS",   "코드값": "DRAFT",       "코드명": "초안",      "설명": "작성 중",            "순서": 1, "사용여부": "Y"},
    {"코드그룹": "STATUS",   "코드값": "IN_REVIEW",   "코드명": "검토 중",   "설명": "검토 진행 중",       "순서": 2, "사용여부": "Y"},
    {"코드그룹": "STATUS",   "코드값": "APPROVED",    "코드명": "승인됨",    "설명": "최종 승인 완료",     "순서": 3, "사용여부": "Y"},
    {"코드그룹": "PRIORITY", "코드값": "HIGH",        "코드명": "높음",      "설명": "긴급 처리 필요",     "순서": 1, "사용여부": "Y"},
    {"코드그룹": "PRIORITY", "코드값": "MEDIUM",      "코드명": "보통",      "설명": "일반 처리",          "순서": 2, "사용여부": "Y"},
    {"코드그룹": "PRIORITY", "코드값": "LOW",         "코드명": "낮음",      "설명": "여유 처리 가능",     "순서": 3, "사용여부": "Y"},
]

PROCESS_CODES = [
    {"코드값": "PROC001", "코드명": "조립",   "설명": "부품 조립 공정",       "순서": 1, "사용여부": "Y"},
    {"코드값": "PROC002", "코드명": "용접",   "설명": "금속 용접 공정",       "순서": 2, "사용여부": "Y"},
    {"코드값": "PROC003", "코드명": "도장",   "설명": "표면 도장 공정",       "순서": 3, "사용여부": "Y"},
    {"코드값": "PROC004", "코드명": "검사",   "설명": "품질 검사 공정",       "순서": 4, "사용여부": "Y"},
    {"코드값": "PROC005", "코드명": "포장",   "설명": "완제품 포장 공정",     "순서": 5, "사용여부": "Y"},
    {"코드값": "PROC006", "코드명": "절단",   "설명": "소재 절단 공정",       "순서": 6, "사용여부": "Y"},
    {"코드값": "PROC007", "코드명": "성형",   "설명": "프레스 성형 공정",     "순서": 7, "사용여부": "Y"},
    {"코드값": "PROC008", "코드명": "열처리", "설명": "열처리 강화 공정",     "순서": 8, "사용여부": "Y"},
    {"코드값": "PROC009", "코드명": "세척",   "설명": "부품 세척/탈지 공정",  "순서": 9, "사용여부": "Y"},
    {"코드값": "PROC010", "코드명": "출하",   "설명": "완제품 출하 공정",     "순서": 10, "사용여부": "Y"},
]

DEFECT_CODES = [
    {"코드값": "DEF001", "코드명": "납땜불량",   "설명": "솔더링 접합 불량",      "순서": 1,  "사용여부": "Y"},
    {"코드값": "DEF002", "코드명": "외관불량",   "설명": "스크래치/찍힘/변색",    "순서": 2,  "사용여부": "Y"},
    {"코드값": "DEF003", "코드명": "치수불량",   "설명": "규격 치수 벗어남",      "순서": 3,  "사용여부": "Y"},
    {"코드값": "DEF004", "코드명": "기능불량",   "설명": "동작 이상 또는 불작동", "순서": 4,  "사용여부": "Y"},
    {"코드값": "DEF005", "코드명": "조립불량",   "설명": "부품 미장착/오장착",    "순서": 5,  "사용여부": "Y"},
    {"코드값": "DEF006", "코드명": "용접불량",   "설명": "용접 균열/기공 발생",   "순서": 6,  "사용여부": "Y"},
    {"코드값": "DEF007", "코드명": "도장불량",   "설명": "도장 벗겨짐/기포",      "순서": 7,  "사용여부": "Y"},
    {"코드값": "DEF008", "코드명": "포장불량",   "설명": "포장재 파손/오포장",    "순서": 8,  "사용여부": "Y"},
    {"코드값": "DEF009", "코드명": "오염",       "설명": "이물질 혼입 또는 오염", "순서": 9,  "사용여부": "Y"},
    {"코드값": "DEF010", "코드명": "균열",       "설명": "소재 크랙 발생",        "순서": 10, "사용여부": "Y"},
    {"코드값": "DEF011", "코드명": "변형",       "설명": "소재 휨/비틀림",        "순서": 11, "사용여부": "Y"},
    {"코드값": "DEF012", "코드명": "누유/누수",  "설명": "유체 누설 불량",        "순서": 12, "사용여부": "Y"},
    {"코드값": "DEF013", "코드명": "마모",       "설명": "표면 과도 마모",        "순서": 13, "사용여부": "Y"},
    {"코드값": "DEF014", "코드명": "부식",       "설명": "산화/부식 발생",        "순서": 14, "사용여부": "Y"},
    {"코드값": "DEF015", "코드명": "미달",       "설명": "규격 미달 (중량/전류 등)", "순서": 15, "사용여부": "Y"},
]

EQUIP_CODES = [
    {"코드값": "EQP001", "코드명": "컨베이어",  "설명": "벨트 컨베이어 시스템",    "순서": 1, "사용여부": "Y"},
    {"코드값": "EQP002", "코드명": "로봇",      "설명": "산업용 다축 로봇",        "순서": 2, "사용여부": "Y"},
    {"코드값": "EQP003", "코드명": "CNC",       "설명": "CNC 가공 머신",           "순서": 3, "사용여부": "Y"},
    {"코드값": "EQP004", "코드명": "프레스",    "설명": "유압/기계식 프레스",      "순서": 4, "사용여부": "Y"},
    {"코드값": "EQP005", "코드명": "용접기",    "설명": "MIG/TIG 용접 장비",       "순서": 5, "사용여부": "Y"},
    {"코드값": "EQP006", "코드명": "검사장비",  "설명": "비전/CMM 검사 장비",      "순서": 6, "사용여부": "Y"},
    {"코드값": "EQP007", "코드명": "도장기",    "설명": "자동 도장/분무 장비",     "순서": 7, "사용여부": "Y"},
    {"코드값": "EQP008", "코드명": "AGV",       "설명": "자율주행 반송 차량",      "순서": 8, "사용여부": "Y"},
]

BACKUP_HISTORY = [
    {"날짜": "2026-06-04 02:00", "크기": "1.24 GB", "유형": "전체 백업",       "상태": "완료"},
    {"날짜": "2026-06-03 02:00", "크기": "1.21 GB", "유형": "전체 백업",       "상태": "완료"},
    {"날짜": "2026-06-02 02:00", "크기": "1.19 GB", "유형": "전체 백업",       "상태": "완료"},
    {"날짜": "2026-06-01 14:30", "크기": "0.32 GB", "유형": "증분 백업",       "상태": "완료"},
    {"날짜": "2026-05-31 02:00", "크기": "1.18 GB", "유형": "전체 백업",       "상태": "완료"},
]

_now = datetime.now()
ACCESS_LOGS = [
    {"일시": (_now - timedelta(minutes=i*18)).strftime("%Y-%m-%d %H:%M:%S"),
     "사용자": USERS[i % len(USERS)]["이름"],
     "IP": f"192.168.1.{10 + i}",
     "브라우저": ["Chrome/124", "Edge/122", "Firefox/125", "Chrome/124", "Safari/17"][i % 5],
     "성공여부": "성공" if i not in (3, 11, 19, 25) else "실패"}
    for i in range(30)
]

CHANGE_LOGS = [
    {"일시": (_now - timedelta(hours=i*3+1)).strftime("%Y-%m-%d %H:%M:%S"),
     "사용자": USERS[i % len(USERS)]["이름"],
     "대상테이블": ["bom_items", "work_orders", "quality_results", "users", "codes"][i % 5],
     "변경유형": ["INSERT", "UPDATE", "DELETE", "UPDATE", "INSERT"][i % 5],
     "이전값": f'{{"status":"DRAFT","qty":{10+i}}}' if i % 5 != 0 else "—",
     "이후값": f'{{"status":"APPROVED","qty":{10+i+1}}}' if i % 5 != 4 else "—"}
    for i in range(20)
]

API_LOGS = [
    {"일시": (_now - timedelta(minutes=i*7+2)).strftime("%Y-%m-%d %H:%M:%S"),
     "엔드포인트": ["/api/v1/projects/", "/api/v1/bom/", "/api/v1/work-orders/", "/api/v1/quality/", "/api/v1/ai/predict"][i % 5],
     "메서드": ["GET", "POST", "GET", "PUT", "POST"][i % 5],
     "응답코드": 200 if i not in (4, 9, 14, 20, 23) else ([500, 422, 404, 500, 401][i % 5]),
     "응답시간(ms)": [45, 132, 88, 210, 67, 503, 44, 91, 155, 88][i % 10],
     "사용자": USERS[i % len(USERS)]["이름"]}
    for i in range(25)
]

MQTT_TOPICS = [
    {"토픽": "akos/plant01/conveyor/+/status",  "QoS": 1, "활성": True},
    {"토픽": "akos/plant01/robot/+/alarm",       "QoS": 2, "활성": True},
    {"토픽": "akos/plant01/cnc/+/metrics",       "QoS": 1, "활성": True},
    {"토픽": "akos/plant01/quality/results",     "QoS": 2, "활성": False},
]

# ══════════════════════════════════════════════════════════════════════════════
# MAIN TABS
# ══════════════════════════════════════════════════════════════════════════════

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "👥 사용자 관리",
    "🔐 역할/권한",
    "📋 코드 관리",
    "⚙️ 시스템 설정",
    "📜 감사 로그",
])

# ══════════════════════════════════════════════════════════════════════════════
# TAB 1 — 사용자 관리
# ══════════════════════════════════════════════════════════════════════════════
with tab1:
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        render_kpi_card("전체 사용자", 24, color="#8b5cf6")
    with c2:
        render_kpi_card("활성 사용자", 21, color="#10b981")
    with c3:
        render_kpi_card("비활성 사용자", 3, color="#ef4444")
    with c4:
        render_kpi_card("금일 접속", 15, color="#3b82f6")

    st.markdown("<div class='section-divider'></div>", unsafe_allow_html=True)

    ut1, ut2, ut3 = st.tabs(["사용자 목록", "사용자 등록", "비밀번호 관리"])

    # ── 사용자 목록 ────────────────────────────────────────────────────────────
    with ut1:
        st.markdown("##### 검색 필터")
        sf1, sf2, sf3 = st.columns(3)
        with sf1:
            search_name = st.text_input("이름 검색", placeholder="이름 입력...", key="usr_name")
        with sf2:
            search_dept = st.selectbox("부서", ["전체", "생산팀", "품질팀", "IT팀", "설계팀", "경영진"], key="usr_dept")
        with sf3:
            search_role = st.selectbox("역할", ["전체"] + ROLE_NAMES, key="usr_role")

        df_users = pd.DataFrame(USERS)
        if search_name:
            df_users = df_users[df_users["이름"].str.contains(search_name)]
        if search_dept != "전체":
            df_users = df_users[df_users["부서"] == search_dept]
        if search_role != "전체":
            df_users = df_users[df_users["역할"] == search_role]

        st.markdown(f"**{len(df_users)}명** 조회됨")
        st.dataframe(df_users, use_container_width=True, hide_index=True)

        st.markdown("##### 사용자 작업")
        ua1, ua2, ua3 = st.columns(3)
        with ua1:
            edit_uid = st.selectbox("편집할 사용자 선택", [u["ID"] + " — " + u["이름"] for u in USERS], key="edit_uid")
            if st.button("✏️ 편집", key="btn_edit_user"):
                st.info(f"[Mock] {edit_uid} 편집 모달이 열립니다.")
        with ua2:
            deact_uid = st.selectbox("비활성화 대상", [u["ID"] + " — " + u["이름"] for u in USERS], key="deact_uid")
            if st.button("🚫 비활성화", key="btn_deact"):
                st.warning(f"[Mock] {deact_uid} 계정이 비활성화되었습니다.")
        with ua3:
            reset_uid = st.selectbox("비밀번호 초기화 대상", [u["ID"] + " — " + u["이름"] for u in USERS], key="reset_uid")
            if st.button("🔑 비밀번호 초기화", key="btn_reset_pw"):
                st.success(f"[Mock] {reset_uid} 비밀번호가 초기화되었습니다.")

    # ── 사용자 등록 ────────────────────────────────────────────────────────────
    with ut2:
        st.markdown("##### 신규 사용자 등록")
        with st.form("form_user_register"):
            rc1, rc2 = st.columns(2)
            with rc1:
                f_uid   = st.text_input("사용자 ID *", placeholder="USR016")
                f_name  = st.text_input("이름 *",      placeholder="홍길동")
                f_dept  = st.selectbox("부서 *", ["생산팀", "품질팀", "IT팀", "설계팀", "경영진"])
                f_title = st.text_input("직책",        placeholder="주임")
            with rc2:
                f_email = st.text_input("이메일 *",    placeholder="user@akos.co.kr")
                f_phone = st.text_input("전화번호",    placeholder="010-0000-0000")
                f_role  = st.selectbox("역할 배정 *", ROLE_NAMES)
                f_pw    = st.text_input("초기 비밀번호 *", type="password", placeholder="8자 이상")
            submitted = st.form_submit_button("✅ 사용자 등록")
            if submitted:
                if not f_uid or not f_name or not f_email or not f_pw:
                    st.error("필수 항목(*)을 모두 입력하세요.")
                elif len(f_pw) < 8:
                    st.error("비밀번호는 8자 이상이어야 합니다.")
                else:
                    st.success(f"[Mock] 사용자 **{f_name}** ({f_uid}) 이(가) 등록되었습니다.")

    # ── 비밀번호 관리 ─────────────────────────────────────────────────────────
    with ut3:
        st.markdown("##### 임시 비밀번호 발급")
        pw_user = st.selectbox("사용자 선택", [u["ID"] + " — " + u["이름"] + " (" + u["이메일"] + ")" for u in USERS], key="pw_user")
        send_email = st.checkbox("이메일로 임시 비밀번호 발송", value=True)
        if st.button("🔐 임시 비밀번호 발급", type="primary"):
            import random, string
            tmp_pw = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            st.success(f"[Mock] 임시 비밀번호 발급 완료: `{tmp_pw}`")
            if send_email:
                st.info(f"[Mock] 이메일 발송 완료: {pw_user.split('(')[-1].rstrip(')')}")
        st.markdown("---")
        st.markdown("##### 비밀번호 정책")
        st.markdown("""
        - 최소 **8자** 이상
        - 영문 대소문자 + 숫자 + 특수문자 포함
        - **90일** 마다 강제 변경
        - 최근 **5개** 비밀번호 재사용 불가
        - 로그인 **5회 연속 실패** 시 계정 잠금
        """)

# ══════════════════════════════════════════════════════════════════════════════
# TAB 2 — 역할/권한 관리 (RBAC)
# ══════════════════════════════════════════════════════════════════════════════
with tab2:
    st.markdown("#### 역할 기반 접근 제어 (RBAC)")
    rt1, rt2, rt3 = st.tabs(["역할 목록", "역할 등록/편집", "메뉴 권한 설정"])

    # ── 역할 목록 ─────────────────────────────────────────────────────────────
    with rt1:
        df_roles = pd.DataFrame(ROLES)
        st.dataframe(df_roles, use_container_width=True, hide_index=True)

    # ── 역할 등록/편집 ────────────────────────────────────────────────────────
    with rt2:
        edit_mode = st.radio("모드", ["신규 등록", "기존 역할 편집"], horizontal=True)
        if edit_mode == "기존 역할 편집":
            sel_role = st.selectbox("편집할 역할 선택", ROLE_NAMES)
        with st.form("form_role_edit"):
            r_name = st.text_input("역할명 *", value=sel_role if edit_mode == "기존 역할 편집" else "")
            r_desc = st.text_area("설명", height=80)
            st.markdown("**기본 권한 설정**")
            pc1, pc2, pc3 = st.columns(3)
            with pc1:
                p_read   = st.checkbox("데이터 조회 (R)", value=True)
                p_write  = st.checkbox("데이터 입력/수정 (W)")
            with pc2:
                p_approve = st.checkbox("결재/승인 (APPROVE)")
                p_delete  = st.checkbox("데이터 삭제 (DELETE)")
            with pc3:
                p_export  = st.checkbox("데이터 내보내기 (EXPORT)")
                p_admin   = st.checkbox("관리자 기능 (ADMIN)")
            if st.form_submit_button("💾 저장"):
                st.success(f"[Mock] 역할 **{r_name}** 이(가) 저장되었습니다.")

    # ── 메뉴 권한 설정 ────────────────────────────────────────────────────────
    with rt3:
        st.markdown("##### 메뉴별 역할 권한 매트릭스")
        st.caption("권한 레벨: — (없음) | R (읽기) | W (읽기+쓰기) | A (전체)")
        sel_role_matrix = st.selectbox("역할 선택 (미리보기)", ROLE_NAMES, key="matrix_role")
        matrix_data = {menu: DEFAULT_PERMISSIONS[menu][sel_role_matrix] for menu in MENUS}
        df_matrix = pd.DataFrame.from_dict(
            {m: {r: DEFAULT_PERMISSIONS[m][r] for r in ROLE_NAMES} for m in MENUS},
            orient="index"
        )
        df_matrix.index.name = "메뉴"
        df_matrix = df_matrix.reset_index()
        edited_matrix = st.data_editor(
            df_matrix,
            use_container_width=True,
            hide_index=True,
            column_config={
                r: st.column_config.SelectboxColumn(r, options=["—", "R", "W", "A"], width="small")
                for r in ROLE_NAMES
            },
            key="perm_matrix_editor"
        )
        if st.button("💾 권한 매트릭스 저장", type="primary"):
            st.success("[Mock] 권한 매트릭스가 저장되었습니다.")

# ══════════════════════════════════════════════════════════════════════════════
# TAB 3 — 코드 관리 (마스터 데이터)
# ══════════════════════════════════════════════════════════════════════════════
with tab3:
    st.markdown("#### 마스터 코드 관리")
    ct1, ct2, ct3, ct4 = st.tabs(["공통 코드", "공정 코드", "불량 코드", "설비 유형 코드"])

    def _render_code_tab(code_list: list, tab_key: str, show_group: bool = False):
        df = pd.DataFrame(code_list)
        st.dataframe(df, use_container_width=True, hide_index=True)
        with st.expander("➕ 코드 추가"):
            with st.form(f"form_code_add_{tab_key}"):
                ca1, ca2 = st.columns(2)
                with ca1:
                    if show_group:
                        new_group = st.text_input("코드 그룹 *")
                    new_code = st.text_input("코드값 *")
                    new_name = st.text_input("코드명 *")
                with ca2:
                    new_desc  = st.text_input("설명")
                    new_order = st.number_input("순서", min_value=1, value=len(code_list) + 1)
                    new_use   = st.selectbox("사용여부", ["Y", "N"])
                if st.form_submit_button("추가"):
                    st.success(f"[Mock] 코드 **{new_code}** ({new_name}) 추가되었습니다.")
        deact_code = st.selectbox("비활성화 코드 선택", [c.get("코드값", c.get("코드값")) for c in code_list], key=f"deact_{tab_key}")
        if st.button("🚫 선택 코드 비활성화", key=f"btn_deact_{tab_key}"):
            st.warning(f"[Mock] 코드 **{deact_code}** 이(가) 비활성화되었습니다.")

    with ct1:
        _render_code_tab(COMMON_CODES, "common", show_group=True)
    with ct2:
        _render_code_tab(PROCESS_CODES, "process")
    with ct3:
        _render_code_tab(DEFECT_CODES, "defect")
    with ct4:
        _render_code_tab(EQUIP_CODES, "equip")

# ══════════════════════════════════════════════════════════════════════════════
# TAB 4 — 시스템 설정
# ══════════════════════════════════════════════════════════════════════════════
with tab4:
    st.markdown("#### 시스템 설정")
    st1, st2, st3, st4 = st.tabs(["알림 설정", "OPC-UA/MQTT 설정", "AI 파라미터", "백업/복구"])

    # ── 알림 설정 ─────────────────────────────────────────────────────────────
    with st1:
        st.markdown("##### 이메일 서버 (SMTP) 설정")
        with st.form("form_smtp"):
            sm1, sm2 = st.columns(2)
            with sm1:
                smtp_host = st.text_input("SMTP 서버",   value="smtp.akos.co.kr")
                smtp_port = st.number_input("포트",       value=587, min_value=1)
            with sm2:
                smtp_user = st.text_input("계정",         value="noreply@akos.co.kr")
                smtp_pass = st.text_input("비밀번호",     type="password", value="••••••••")
            smtp_tls = st.checkbox("TLS 사용", value=True)
            if st.form_submit_button("💾 SMTP 설정 저장"):
                st.success("[Mock] SMTP 설정이 저장되었습니다.")

        st.markdown("##### 알림 유형 설정")
        ac1, ac2 = st.columns(2)
        with ac1:
            n_defect   = st.toggle("불량 발생 알림",  value=True)
            n_deadline = st.toggle("납기 위험 알림",  value=True)
        with ac2:
            n_ai       = st.toggle("AI 경보 알림",    value=True)
            n_approval = st.toggle("승인 요청 알림",  value=True)

        st.markdown("##### 알림 임계값")
        defect_threshold = st.slider("불량률 알림 임계 (%)", min_value=1, max_value=20, value=5,
                                     help="이 수치 이상일 때 알림 발송")
        st.caption(f"현재 설정: 불량률 **{defect_threshold}%** 이상 시 알림")
        if st.button("💾 알림 설정 저장", key="save_notif"):
            st.success("[Mock] 알림 설정이 저장되었습니다.")

    # ── OPC-UA/MQTT 설정 ──────────────────────────────────────────────────────
    with st2:
        oc1, oc2 = st.columns(2)
        with oc1:
            st.markdown("##### OPC-UA 연결 설정")
            with st.form("form_opcua"):
                opc_url  = st.text_input("서버 URL",    value="opc.tcp://192.168.1.100")
                opc_port = st.number_input("포트",       value=4840, min_value=1)
                opc_auth = st.selectbox("인증 방식",    ["Anonymous", "Username/Password", "Certificate"])
                if opc_auth == "Username/Password":
                    st.text_input("사용자명")
                    st.text_input("비밀번호", type="password")
                if st.form_submit_button("💾 OPC-UA 저장"):
                    st.success("[Mock] OPC-UA 설정 저장됨.")
            if st.button("🔌 OPC-UA 연결 테스트", key="test_opc"):
                with st.spinner("연결 테스트 중..."):
                    import time; time.sleep(1)
                st.success("[Mock] OPC-UA 연결 성공 — 응답 시간: 23ms")

        with oc2:
            st.markdown("##### MQTT 브로커 설정")
            with st.form("form_mqtt"):
                mqtt_host   = st.text_input("브로커 주소",    value="192.168.1.101")
                mqtt_port   = st.number_input("포트",          value=1883, min_value=1)
                mqtt_prefix = st.text_input("토픽 Prefix",    value="akos/plant01")
                mqtt_user   = st.text_input("사용자명",        value="mes_client")
                mqtt_pass   = st.text_input("비밀번호",        type="password", value="••••••")
                if st.form_submit_button("💾 MQTT 저장"):
                    st.success("[Mock] MQTT 설정 저장됨.")
            if st.button("🔌 MQTT 연결 테스트", key="test_mqtt"):
                with st.spinner("브로커 연결 테스트 중..."):
                    import time; time.sleep(1)
                st.error("[Mock] MQTT 브로커 연결 실패 — Connection refused (port 1883)")

        st.markdown("##### 구독 토픽 목록")
        df_topics = pd.DataFrame(MQTT_TOPICS)
        edited_topics = st.data_editor(
            df_topics, use_container_width=True, hide_index=True,
            num_rows="dynamic", key="mqtt_topics_editor"
        )
        if st.button("💾 토픽 목록 저장", key="save_topics"):
            st.success("[Mock] 구독 토픽 목록이 저장되었습니다.")

    # ── AI 파라미터 ───────────────────────────────────────────────────────────
    with st3:
        st.markdown("##### XGBoost 불량 예측 모델 파라미터")
        with st.form("form_ai_params"):
            ap1, ap2 = st.columns(2)
            with ap1:
                xgb_depth = st.slider("max_depth", min_value=2, max_value=12, value=6)
                xgb_lr    = st.number_input("learning_rate", min_value=0.001, max_value=0.5,
                                             value=0.1, step=0.01, format="%.3f")
                xgb_n     = st.number_input("n_estimators", min_value=50, max_value=1000, value=200, step=50)
            with ap2:
                pred_threshold = st.slider("불량 예측 임계값 (threshold)",
                                           min_value=0.50, max_value=0.90, value=0.65, step=0.05)
                retrain_cycle  = st.selectbox("재학습 주기", ["매일", "주간", "월간"])
                st.markdown(f"""
                **현재 설정 요약**
                - max_depth: `{xgb_depth}` / lr: `{xgb_lr}` / n_estimators: `{xgb_n}`
                - 예측 임계값: `{pred_threshold}` / 재학습: `{retrain_cycle}`
                """)
            if st.form_submit_button("💾 AI 파라미터 저장", type="primary"):
                st.success("[Mock] AI 파라미터가 저장되었습니다. 다음 재학습 시 적용됩니다.")

    # ── 백업/복구 ─────────────────────────────────────────────────────────────
    with st4:
        st.markdown("##### 최근 백업 이력")
        df_backup = pd.DataFrame(BACKUP_HISTORY)
        st.dataframe(df_backup, use_container_width=True, hide_index=True)

        bc1, bc2 = st.columns(2)
        with bc1:
            if st.button("💾 지금 백업 실행", type="primary", key="btn_backup_now"):
                prog = st.progress(0, text="백업 준비 중...")
                import time
                for pct in range(0, 101, 20):
                    time.sleep(0.3)
                    prog.progress(pct, text=f"백업 진행 중... {pct}%")
                st.success("[Mock] 백업 완료 — 생성 파일: backup_20260604_manual.tar.gz (1.25 GB)")
        with bc2:
            restore_target = st.selectbox("복구 시점 선택", [b["날짜"] for b in BACKUP_HISTORY])
            confirm_restore = st.checkbox("⚠️ 복구 시 현재 데이터가 덮어쓰여집니다. 확인했습니다.", key="confirm_restore")
            if st.button("♻️ 복구 실행", key="btn_restore", disabled=not confirm_restore):
                st.warning(f"[Mock] {restore_target} 시점으로 복구가 시작되었습니다. 시스템이 재시작됩니다.")

# ══════════════════════════════════════════════════════════════════════════════
# TAB 5 — 감사 로그
# ══════════════════════════════════════════════════════════════════════════════
with tab5:
    st.markdown("#### 감사 로그 (Audit Log)")

    # Global filters
    lf1, lf2, lf3 = st.columns(3)
    with lf1:
        date_from = st.date_input("조회 시작일", value=(_now - timedelta(days=7)).date())
    with lf2:
        date_to   = st.date_input("조회 종료일", value=_now.date())
    with lf3:
        log_user  = st.selectbox("사용자 필터", ["전체"] + [u["이름"] for u in USERS])

    lt1, lt2, lt3 = st.tabs(["접속 이력", "데이터 변경 이력", "API 호출 로그"])

    # ── 접속 이력 ─────────────────────────────────────────────────────────────
    with lt1:
        df_access = pd.DataFrame(ACCESS_LOGS)
        if log_user != "전체":
            df_access = df_access[df_access["사용자"] == log_user]

        fail_count = (df_access["성공여부"] == "실패").sum()
        st.markdown(f"**{len(df_access)}건** 조회 | 로그인 실패: **{fail_count}건**")

        def _color_access(row):
            if row["성공여부"] == "실패":
                return ["background-color: rgba(220,38,38,0.20)"] * len(row)
            return [""] * len(row)

        st.dataframe(
            df_access.style.apply(_color_access, axis=1),
            use_container_width=True, hide_index=True
        )

        st.markdown("##### 시간대별 접속 현황")
        df_access["시간"] = pd.to_datetime(df_access["일시"]).dt.hour
        hour_counts = df_access.groupby("시간").size().reset_index(name="접속수")
        fig_hour = px.bar(
            hour_counts, x="시간", y="접속수",
            title="시간대별 접속 수",
            color_discrete_sequence=["#8b5cf6"],
            template="plotly_dark"
        )
        fig_hour.update_layout(height=280, margin=dict(t=40, b=20, l=20, r=20))
        st.plotly_chart(fig_hour, use_container_width=True)

    # ── 데이터 변경 이력 ──────────────────────────────────────────────────────
    with lt2:
        df_changes = pd.DataFrame(CHANGE_LOGS)
        if log_user != "전체":
            df_changes = df_changes[df_changes["사용자"] == log_user]

        st.markdown(f"**{len(df_changes)}건** 조회")
        st.dataframe(
            df_changes[["일시", "사용자", "대상테이블", "변경유형"]],
            use_container_width=True, hide_index=True
        )

        st.markdown("##### 변경 상세 (Diff)")
        for idx, row in df_changes.iterrows():
            with st.expander(f"[{row['일시']}] {row['사용자']} — {row['대상테이블']} ({row['변경유형']})"):
                d1, d2 = st.columns(2)
                with d1:
                    st.markdown("**이전값**")
                    st.code(row["이전값"], language="json")
                with d2:
                    st.markdown("**이후값**")
                    st.code(row["이후값"], language="json")

    # ── API 호출 로그 ─────────────────────────────────────────────────────────
    with lt3:
        df_api = pd.DataFrame(API_LOGS)
        if log_user != "전체":
            df_api = df_api[df_api["사용자"] == log_user]

        avg_resp = int(df_api["응답시간(ms)"].mean())
        error_count = df_api[df_api["응답코드"] >= 400].shape[0]

        kc1, kc2, kc3 = st.columns(3)
        with kc1:
            render_kpi_card("총 API 호출", len(df_api), color="#3b82f6")
        with kc2:
            render_kpi_card("평균 응답 시간", f"{avg_resp} ms",
                            color="#10b981" if avg_resp < 200 else "#f59e0b")
        with kc3:
            render_kpi_card("에러 (4xx/5xx)", error_count,
                            color="#ef4444" if error_count > 0 else "#10b981")

        st.markdown("---")
        st.markdown(f"**{len(df_api)}건** 조회")

        def _color_api(row):
            if row["응답코드"] >= 500:
                return ["background-color: rgba(220,38,38,0.20)"] * len(row)
            if row["응답코드"] >= 400:
                return ["background-color: rgba(234,179,8,0.15)"] * len(row)
            return [""] * len(row)

        st.dataframe(
            df_api.style.apply(_color_api, axis=1),
            use_container_width=True, hide_index=True
        )
