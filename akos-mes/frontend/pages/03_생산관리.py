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
from components.charts import render_oee_gauge, render_gantt, render_defect_bar

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

st.set_page_config(page_title="생산관리 | Akos AI MES", page_icon="🏭", layout="wide")

st.title("🏭 생산관리")
st.markdown("---")

# ─────────────────────────────────────────────────────────────────────────────
# Helper: status badge HTML
# ─────────────────────────────────────────────────────────────────────────────
def status_badge(label: str, color: str) -> str:
    return (
        f'<span style="background:{color};color:#fff;padding:2px 10px;'
        f'border-radius:12px;font-size:0.78rem;font-weight:600;">{label}</span>'
    )

STATUS_COLORS = {
    "진행중": "#1976d2",
    "완료":   "#388e3c",
    "대기":   "#757575",
    "지연":   "#d32f2f",
}

# ─────────────────────────────────────────────────────────────────────────────
# Mock data generators
# ─────────────────────────────────────────────────────────────────────────────
def _orders():
    random.seed(42)
    customers = ["현대모비스", "삼성전자", "LG화학", "SK하이닉스", "한화에어로스페이스"]
    machines  = ["CNC-01", "CNC-02", "사출기-A", "용접기-B", "조립라인-1", "도장라인-2"]
    workers   = ["김철수", "이영희", "박민준", "정수빈", "최우진", "한소영"]
    statuses  = ["진행중", "완료", "대기", "지연"]
    weights   = [4, 5, 2, 1]
    base_date = datetime(2026, 6, 1)
    rows = []
    for i in range(1, 13):
        plan = random.randint(100, 500)
        status = random.choices(statuses, weights=weights)[0]
        done = plan if status == "완료" else (random.randint(0, plan - 1) if status != "대기" else 0)
        start = base_date + timedelta(days=random.randint(0, 10))
        end   = start + timedelta(days=random.randint(5, 20))
        rows.append({
            "오더번호": f"WO-2026{i:03d}",
            "설비명":   random.choice(machines),
            "고객사":   random.choice(customers),
            "계획수량": plan,
            "완료수량": done,
            "착수일":   start.strftime("%Y-%m-%d"),
            "완료예정일": end.strftime("%Y-%m-%d"),
            "상태":     status,
            "담당자":   random.choice(workers),
        })
    return pd.DataFrame(rows)

def _gantt_tasks():
    random.seed(7)
    base = datetime(2026, 6, 1)
    tasks = []
    names = [
        "WO-2026001 현대모비스 브라켓",
        "WO-2026002 삼성전자 하우징",
        "WO-2026003 LG화학 커버",
        "WO-2026004 SK 플레이트",
        "WO-2026005 한화 샤프트",
        "WO-2026006 현대 기어박스",
        "WO-2026007 삼성 프레임",
        "WO-2026008 LG 노즐",
        "WO-2026009 SK 볼트세트",
        "WO-2026010 한화 베어링",
    ]
    for nm in names:
        s = base + timedelta(days=random.randint(0, 15))
        e = s + timedelta(days=random.randint(3, 12))
        tasks.append({"Task": nm, "Start": s, "Finish": e,
                      "Status": random.choice(["진행중", "완료", "대기", "지연"])})
    return tasks

def _workers_assignment():
    workers = ["김철수", "이영희", "박민준", "정수빈", "최우진", "한소영",
               "오태양", "윤미래", "장도현", "신예나"]
    random.seed(3)
    rows = []
    for w in workers:
        rows.append({
            "작업자": w,
            "담당설비": random.choice(["CNC-01", "CNC-02", "사출기-A", "용접기-B", "조립라인-1"]),
            "현재오더": f"WO-2026{random.randint(1,12):03d}",
            "금일작업시간(h)": round(random.uniform(2, 9), 1),
            "상태": random.choice(["작업중", "휴식", "대기"]),
        })
    return pd.DataFrame(rows)

def _processes():
    return [
        {"공정명": "원자재 투입",    "진행률": 92, "담당자": "김철수", "상태": "정상", "예상완료": "14:30"},
        {"공정명": "CNC 가공",       "진행률": 78, "담당자": "이영희", "상태": "정상", "예상완료": "16:00"},
        {"공정명": "표면 처리",      "진행률": 55, "담당자": "박민준", "상태": "경고", "예상완료": "17:45"},
        {"공정명": "조립",           "진행률": 40, "담당자": "정수빈", "상태": "정상", "예상완료": "18:30"},
        {"공정명": "품질 검사",      "진행률": 88, "담당자": "최우진", "상태": "정상", "예상완료": "15:00"},
        {"공정명": "출하 준비",      "진행률": 20, "담당자": "한소영", "상태": "지연", "예상완료": "익일 09:00"},
    ]

def _work_orders():
    random.seed(11)
    machines = ["CNC-01", "CNC-02", "사출기-A", "용접기-B", "조립라인-1", "도장라인-2"]
    workers  = ["김철수", "이영희", "박민준", "정수빈", "최우진", "한소영"]
    rows = []
    base = datetime(2026, 6, 4, 8, 0)
    for i in range(1, 9):
        rows.append({
            "WO번호":    f"WO-2026{i:03d}",
            "공정명":    random.choice(["CNC가공", "용접", "조립", "검사", "도장"]),
            "설비":      random.choice(machines),
            "작업자":    random.choice(workers),
            "계획수량":  random.randint(50, 300),
            "완료수량":  random.randint(0, 200),
            "시작시간":  (base + timedelta(hours=random.randint(0, 4))).strftime("%H:%M"),
            "종료예정":  (base + timedelta(hours=random.randint(5, 10))).strftime("%H:%M"),
            "상태":      random.choice(["진행중", "완료", "대기", "지연"]),
        })
    return pd.DataFrame(rows)

def _anomalies():
    random.seed(22)
    machines = ["CNC-01", "CNC-02", "사출기-A", "용접기-B", "조립라인-1", "도장라인-2"]
    types    = ["진동 이상", "온도 과열", "압력 저하", "속도 이탈", "전류 과부하", "소음 발생"]
    actions  = ["조치완료", "조치중", "미조치"]
    rows = []
    base = datetime(2026, 6, 4, 6, 0)
    for i in range(1, 11):
        rows.append({
            "이상코드":   f"ANO-{2026000+i}",
            "설비":       random.choice(machines),
            "발생시간":   (base + timedelta(minutes=random.randint(0, 600))).strftime("%Y-%m-%d %H:%M"),
            "유형":       random.choice(types),
            "조치상태":   random.choice(actions),
            "긴급여부":   random.choice(["긴급", "일반"]),
        })
    return pd.DataFrame(rows)

def _inventory(warehouse: str):
    random.seed({"A창고": 5, "B창고": 9}[warehouse])
    parts = [
        "BOLT-M8x25", "NUT-M8", "BEARING-6204", "SHAFT-40MM", "GEAR-24T",
        "BRACKET-A", "COVER-B", "FRAME-C", "NOZZLE-D", "PLATE-E",
        "SPRING-F", "SEAL-G", "BUSHING-H", "PIN-I", "WASHER-J",
        "HOUSING-K", "FLANGE-L", "COUPLING-M", "VALVE-N", "SENSOR-O",
    ]
    rows = []
    for p in parts:
        min_qty = random.randint(50, 200)
        qty = random.randint(10, 500)
        rows.append({
            "부품코드":   p,
            "부품명":     f"{p} 부품",
            "재고수량":   qty,
            "최소재고":   min_qty,
            "단위":       "EA",
            "위치":       f"{warehouse}-{random.randint(1,5):02d}-{random.randint(1,10):02d}",
            "최종입고일": (datetime(2026, 5, 1) + timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d"),
            "재고상태":   "부족" if qty < min_qty else "정상",
        })
    return pd.DataFrame(rows)

def _daily_production(start: datetime, end: datetime):
    random.seed(99)
    rows = []
    cur = start
    while cur <= end:
        plan = random.randint(200, 400)
        actual = random.randint(150, plan + 20)
        defect = random.randint(0, int(actual * 0.05))
        rows.append({
            "날짜":    cur.strftime("%Y-%m-%d"),
            "계획수량": plan,
            "실적수량": actual,
            "달성률(%)": round(actual / plan * 100, 1),
            "불량수":   defect,
            "불량률(%)": round(defect / actual * 100, 2) if actual else 0,
        })
        cur += timedelta(days=1)
    return pd.DataFrame(rows)

def _worker_performance():
    random.seed(77)
    workers = ["김철수", "이영희", "박민준", "정수빈", "최우진",
               "한소영", "오태양", "윤미래", "장도현", "신예나"]
    rows = []
    for w in workers:
        plan = random.randint(150, 300)
        actual = random.randint(100, plan + 30)
        rows.append({
            "작업자":     w,
            "계획수량":   plan,
            "실적수량":   actual,
            "달성률(%)":  round(actual / plan * 100, 1),
            "작업시간(h)": round(random.uniform(7, 9.5), 1),
            "불량건수":   random.randint(0, 5),
        })
    return pd.DataFrame(rows)

def _machine_oee():
    random.seed(55)
    machines = ["CNC-01", "CNC-02", "사출기-A", "용접기-B", "조립라인-1", "도장라인-2"]
    rows = []
    for m in machines:
        avail = round(random.uniform(0.80, 0.98), 3)
        perf  = round(random.uniform(0.75, 0.95), 3)
        qual  = round(random.uniform(0.90, 0.99), 3)
        rows.append({
            "설비명":    m,
            "가동률":    avail,
            "성능률":    perf,
            "품질률":    qual,
            "OEE":       round(avail * perf * qual, 3),
        })
    return rows

def _alarms():
    random.seed(33)
    machines   = ["CNC-01", "CNC-02", "사출기-A", "용접기-B", "조립라인-1", "도장라인-2"]
    alarm_types= ["온도 경보", "진동 이상", "압력 저하", "과부하 경보", "비상정지", "오일부족"]
    severities = ["긴급", "주의", "정보"]
    base = datetime(2026, 6, 4, 0, 0)
    rows = []
    for i in range(10):
        rows.append({
            "발생시간":  (base + timedelta(hours=random.randint(0, 23), minutes=random.randint(0, 59))).strftime("%Y-%m-%d %H:%M"),
            "설비":      random.choice(machines),
            "알람유형":  random.choice(alarm_types),
            "심각도":    random.choice(severities),
            "조치여부":  random.choice(["조치완료", "미조치", "조치중"]),
        })
    return pd.DataFrame(sorted(rows, key=lambda x: x["발생시간"], reverse=True))

def _maintenance_schedule():
    base = datetime(2026, 7, 1)
    items = [
        ("CNC-01",      "오일 교환 및 윤활",   3),
        ("사출기-A",    "금형 점검",            7),
        ("용접기-B",    "토치 교체",           12),
        ("조립라인-1",  "벨트 장력 조정",      18),
        ("도장라인-2",  "필터 교체",           25),
    ]
    rows = []
    for machine, work, day in items:
        rows.append({
            "설비명":   machine,
            "보전작업": work,
            "예정일":   (base + timedelta(days=day - 1)).strftime("%Y-%m-%d"),
            "담당자":   random.choice(["정비팀A", "정비팀B", "외주업체"]),
            "상태":     "예정",
        })
    return pd.DataFrame(rows)

# ─────────────────────────────────────────────────────────────────────────────
# MAIN TABS
# ─────────────────────────────────────────────────────────────────────────────
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📋 생산 계획",
    "⚙️ 공정 관리",
    "📦 자재/재고",
    "📊 실적 집계",
    "🔧 OEE/설비 모니터링",
])

# ═════════════════════════════════════════════════════════════════════════════
# TAB 1: 생산 계획
# ═════════════════════════════════════════════════════════════════════════════
with tab1:
    st.subheader("📋 생산 계획")

    # Top KPIs
    kpi_cols = st.columns(4)
    kpi_data = [
        ("이번달 계획 수량", "120 건", "📋", "#1565c0"),
        ("완료",            "87 건",  "✅", "#2e7d32"),
        ("진행중",          "18 건",  "⚙️", "#f57f17"),
        ("지연",            "4 건",   "⚠️", "#c62828"),
    ]
    for col, (title, val, icon, color) in zip(kpi_cols, kpi_data):
        with col:
            st.markdown(
                f"""<div style="background:#fff;border-left:5px solid {color};
                padding:16px 20px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.08);">
                <div style="font-size:1.6rem;">{icon}</div>
                <div style="font-size:0.85rem;color:#666;margin-top:4px;">{title}</div>
                <div style="font-size:1.8rem;font-weight:700;color:{color};">{val}</div>
                </div>""",
                unsafe_allow_html=True,
            )

    st.markdown("<br>", unsafe_allow_html=True)

    plan_tabs = st.tabs(["생산 오더 목록", "오더 등록", "Gantt 일정", "자원 배정"])

    # ── 생산 오더 목록 ──────────────────────────────────────────────────────
    with plan_tabs[0]:
        st.markdown("##### 생산 오더 목록")
        df_orders = _orders()

        f1, f2, f3, f4 = st.columns([1, 1, 1, 1])
        with f1:
            status_filter = st.multiselect("상태 필터", ["진행중", "완료", "대기", "지연"],
                                           default=["진행중", "완료", "대기", "지연"],
                                           key="ord_status")
        with f2:
            cust_filter = st.multiselect("고객사 필터",
                                         df_orders["고객사"].unique().tolist(),
                                         default=df_orders["고객사"].unique().tolist(),
                                         key="ord_cust")
        with f3:
            date_start = st.date_input("착수일 시작", value=datetime(2026, 6, 1), key="ord_ds")
        with f4:
            date_end = st.date_input("착수일 종료", value=datetime(2026, 6, 30), key="ord_de")

        mask = (
            df_orders["상태"].isin(status_filter) &
            df_orders["고객사"].isin(cust_filter) &
            (pd.to_datetime(df_orders["착수일"]) >= pd.to_datetime(date_start)) &
            (pd.to_datetime(df_orders["착수일"]) <= pd.to_datetime(date_end))
        )
        df_filtered = df_orders[mask].copy()

        def _color_status(val):
            colors = {"진행중": "background-color:#e3f2fd;color:#1565c0",
                      "완료":   "background-color:#e8f5e9;color:#2e7d32",
                      "대기":   "background-color:#f5f5f5;color:#424242",
                      "지연":   "background-color:#ffebee;color:#c62828"}
            return colors.get(val, "")

        styled = df_filtered.style.applymap(_color_status, subset=["상태"])
        st.dataframe(styled, use_container_width=True, hide_index=True)
        st.caption(f"총 {len(df_filtered)}건 표시 중")

    # ── 오더 등록 ───────────────────────────────────────────────────────────
    with plan_tabs[1]:
        st.markdown("##### 생산 오더 등록")
        with st.form("order_register"):
            c1, c2 = st.columns(2)
            with c1:
                bom = st.selectbox("BOM 선택", ["BOM-001 현대모비스 브라켓", "BOM-002 삼성전자 하우징",
                                                 "BOM-003 LG화학 커버", "BOM-004 SK 플레이트"])
                qty = st.number_input("계획 수량", min_value=1, value=100, step=10)
                priority = st.selectbox("우선순위", ["긴급", "높음", "보통", "낮음"])
            with c2:
                start_dt = st.date_input("착수일", value=datetime(2026, 6, 5))
                end_dt   = st.date_input("완료 예정일", value=datetime(2026, 6, 20))
                worker   = st.selectbox("작업자 배정", ["김철수", "이영희", "박민준",
                                                        "정수빈", "최우진", "한소영"])
            note = st.text_area("비고", placeholder="특이사항 입력...", height=80)
            submitted = st.form_submit_button("오더 등록", type="primary")
            if submitted:
                st.success(f"오더가 등록되었습니다. (BOM: {bom}, 수량: {qty}개)")

    # ── Gantt 일정 ──────────────────────────────────────────────────────────
    with plan_tabs[2]:
        st.markdown("##### Gantt 생산 일정 (30일)")
        tasks = _gantt_tasks()
        color_map = {"진행중": "#1976d2", "완료": "#388e3c", "대기": "#9e9e9e", "지연": "#d32f2f"}
        fig_gantt = px.timeline(
            tasks,
            x_start="Start", x_end="Finish", y="Task",
            color="Status",
            color_discrete_map=color_map,
            title="생산 오더 Gantt 차트 (2026년 6월)",
        )
        fig_gantt.update_yaxes(autorange="reversed")
        fig_gantt.update_layout(height=420, margin=dict(l=10, r=10, t=40, b=10))
        st.plotly_chart(fig_gantt, use_container_width=True)

    # ── 자원 배정 ───────────────────────────────────────────────────────────
    with plan_tabs[3]:
        st.markdown("##### 작업자 배정 현황")
        df_workers = _workers_assignment()

        def _color_worker_status(val):
            return ("background-color:#e8f5e9;color:#2e7d32" if val == "작업중"
                    else "background-color:#fff3e0;color:#e65100" if val == "휴식"
                    else "background-color:#f5f5f5;color:#424242")

        styled_w = df_workers.style.applymap(_color_worker_status, subset=["상태"])
        st.dataframe(styled_w, use_container_width=True, hide_index=True)

        st.markdown("##### 설비별 작업자 현황")
        machine_counts = df_workers.groupby("담당설비").size().reset_index(name="배정인원")
        fig_bar = px.bar(machine_counts, x="담당설비", y="배정인원",
                         color="배정인원", color_continuous_scale="Blues",
                         title="설비별 배정 작업자 수")
        fig_bar.update_layout(height=300, margin=dict(l=10, r=10, t=40, b=10))
        st.plotly_chart(fig_bar, use_container_width=True)

# ═════════════════════════════════════════════════════════════════════════════
# TAB 2: 공정 관리
# ═════════════════════════════════════════════════════════════════════════════
with tab2:
    st.subheader("⚙️ 공정 관리")

    proc_tabs = st.tabs(["공정 현황판", "공정 등록", "작업 지시서", "이상 등록"])

    # ── 공정 현황판 ─────────────────────────────────────────────────────────
    with proc_tabs[0]:
        st.markdown("##### 공정 현황판")
        processes = _processes()
        rows_proc = [processes[:3], processes[3:]]
        for row in rows_proc:
            cols = st.columns(3)
            for col, proc in zip(cols, row):
                prog = proc["진행률"] / 100
                badge_color = {"정상": "#388e3c", "경고": "#f57f17", "지연": "#d32f2f"}.get(proc["상태"], "#757575")
                with col:
                    st.markdown(
                        f"""<div style="border:1px solid {badge_color};border-radius:10px;
                        padding:16px;margin-bottom:12px;background:#fff;
                        box-shadow:0 2px 8px rgba(0,0,0,.06);">
                        <div style="font-weight:700;font-size:1rem;margin-bottom:6px;">{proc['공정명']}</div>
                        <div style="font-size:0.8rem;color:#555;">담당자: {proc['담당자']}</div>
                        <div style="font-size:0.8rem;color:#555;">예상완료: {proc['예상완료']}</div>
                        <div style="margin-top:8px;">
                          <span style="background:{badge_color};color:#fff;padding:2px 8px;
                          border-radius:10px;font-size:0.75rem;">{proc['상태']}</span>
                        </div>
                        </div>""",
                        unsafe_allow_html=True,
                    )
                    st.progress(prog, text=f"{proc['진행률']}%")

    # ── 공정 등록 ───────────────────────────────────────────────────────────
    with proc_tabs[1]:
        st.markdown("##### 공정 등록")
        with st.form("proc_register"):
            c1, c2 = st.columns(2)
            with c1:
                proc_code = st.text_input("공정 코드", placeholder="예: PROC-010")
                proc_name = st.text_input("공정명", placeholder="예: CNC 정밀가공")
                machine   = st.selectbox("사용 설비", ["CNC-01", "CNC-02", "사출기-A",
                                                       "용접기-B", "조립라인-1", "도장라인-2"])
            with c2:
                std_time  = st.number_input("표준 작업시간 (분)", min_value=1, value=30)
                prev_proc = st.text_input("전공정 코드", placeholder="예: PROC-009")
                next_proc = st.text_input("후공정 코드", placeholder="예: PROC-011")
            proc_note = st.text_area("공정 설명", height=80)
            if st.form_submit_button("공정 등록", type="primary"):
                st.success(f"공정 '{proc_name}' ({proc_code})이(가) 등록되었습니다.")

    # ── 작업 지시서 ─────────────────────────────────────────────────────────
    with proc_tabs[2]:
        st.markdown("##### 작업 지시서 (WO)")
        df_wo = _work_orders()

        def _color_wo(val):
            return {"진행중": "background-color:#e3f2fd;color:#1565c0",
                    "완료":   "background-color:#e8f5e9;color:#2e7d32",
                    "대기":   "background-color:#f5f5f5;color:#424242",
                    "지연":   "background-color:#ffebee;color:#c62828"}.get(val, "")

        st.dataframe(df_wo.style.applymap(_color_wo, subset=["상태"]),
                     use_container_width=True, hide_index=True)

        wo_cols = st.columns([1, 1, 4])
        with wo_cols[0]:
            if st.button("🖨️ WO 출력", type="secondary"):
                st.info("작업 지시서 PDF 출력 준비 중...")
        with wo_cols[1]:
            if st.button("✅ 완료 처리", type="primary"):
                st.success("선택된 WO가 완료 처리되었습니다.")

    # ── 이상 등록 ───────────────────────────────────────────────────────────
    with proc_tabs[3]:
        st.markdown("##### 이상 등록")

        with st.form("anomaly_register"):
            c1, c2 = st.columns(2)
            with c1:
                anom_machine = st.selectbox("설비 선택", ["CNC-01", "CNC-02", "사출기-A",
                                                          "용접기-B", "조립라인-1", "도장라인-2"])
                anom_type    = st.selectbox("이상 유형", ["진동 이상", "온도 과열", "압력 저하",
                                                          "속도 이탈", "전류 과부하", "소음 발생"])
                urgent       = st.toggle("🚨 긴급 이상", value=False)
            with c2:
                anom_detail = st.text_area("이상 내용", placeholder="이상 증상을 상세히 기술하세요...", height=100)
                photo       = st.file_uploader("사진 첨부", type=["jpg", "jpeg", "png"])
            if urgent:
                st.error("⚠️ 긴급 이상으로 등록됩니다. 즉시 설비를 정지하고 정비팀에 연락하세요!")
            if st.form_submit_button("이상 등록", type="primary"):
                icon = "🚨" if urgent else "ℹ️"
                st.warning(f"{icon} 이상이 등록되었습니다. (설비: {anom_machine}, 유형: {anom_type})")

        st.markdown("---")
        st.markdown("##### 이상 이력")
        df_anom = _anomalies()

        def _color_action(val):
            return {"조치완료": "background-color:#e8f5e9;color:#2e7d32",
                    "조치중":   "background-color:#fff3e0;color:#e65100",
                    "미조치":   "background-color:#ffebee;color:#c62828"}.get(val, "")

        def _color_urgent(val):
            return "background-color:#ffebee;color:#c62828;font-weight:700;" if val == "긴급" else ""

        styled_anom = (df_anom.style
                       .applymap(_color_action, subset=["조치상태"])
                       .applymap(_color_urgent, subset=["긴급여부"]))
        st.dataframe(styled_anom, use_container_width=True, hide_index=True)

# ═════════════════════════════════════════════════════════════════════════════
# TAB 3: 자재/재고 관리
# ═════════════════════════════════════════════════════════════════════════════
with tab3:
    st.subheader("📦 자재/재고 관리")

    # KPI
    inv_kpi = st.columns(4)
    inv_kpi_data = [
        ("총 부품 수",    "342 종", "#1565c0"),
        ("입고 대기",     "12 건",  "#f57f17"),
        ("출고 대기",     "8 건",   "#7b1fa2"),
        ("재고 부족",     "3 종",   "#c62828"),
    ]
    for col, (title, val, color) in zip(inv_kpi, inv_kpi_data):
        with col:
            st.markdown(
                f"""<div style="background:#fff;border-left:5px solid {color};
                padding:14px 18px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.08);">
                <div style="font-size:0.82rem;color:#666;">{title}</div>
                <div style="font-size:1.7rem;font-weight:700;color:{color};">{val}</div>
                </div>""",
                unsafe_allow_html=True,
            )

    st.markdown("<br>", unsafe_allow_html=True)

    inv_tabs = st.tabs(["재고 현황", "입고 처리", "출고 처리", "재고 조정"])

    # ── 재고 현황 ───────────────────────────────────────────────────────────
    with inv_tabs[0]:
        wh_tab_a, wh_tab_b = st.tabs(["🏪 A창고", "🏪 B창고"])
        for wh_tab, wh_name in [(wh_tab_a, "A창고"), (wh_tab_b, "B창고")]:
            with wh_tab:
                df_inv = _inventory(wh_name)

                def _color_inv(val):
                    return "background-color:#ffebee;color:#c62828;font-weight:700;" if val == "부족" else ""

                styled_inv = df_inv.style.applymap(_color_inv, subset=["재고상태"])
                st.dataframe(styled_inv, use_container_width=True, hide_index=True)

                shortage = df_inv[df_inv["재고상태"] == "부족"]
                if len(shortage):
                    st.error(f"⚠️ 재고 부족 품목 {len(shortage)}건: {', '.join(shortage['부품코드'].tolist())}")

    # ── 입고 처리 ───────────────────────────────────────────────────────────
    with inv_tabs[1]:
        st.markdown("##### 입고 처리")
        with st.form("inbound_form"):
            c1, c2 = st.columns(2)
            with c1:
                po_no    = st.text_input("발주 번호", placeholder="예: PO-2026001")
                part_code= st.text_input("부품 코드", placeholder="예: BOLT-M8x25")
                in_qty   = st.number_input("입고 수량", min_value=1, value=100)
            with c2:
                in_date  = st.date_input("입고일", value=datetime(2026, 6, 4))
                insp_res = st.selectbox("검사 결과", ["합격", "불합격", "부분합격"])
                in_note  = st.text_area("비고", height=68)
            if st.form_submit_button("입고 처리", type="primary"):
                st.success(f"입고 처리 완료: {part_code} {in_qty}EA (검사: {insp_res})")

        st.markdown("##### 입고 이력")
        in_history = pd.DataFrame([
            {"발주번호": f"PO-2026{i:03d}", "부품코드": f"BOLT-M8x{10+i*5}", "입고수량": random.randint(100,500),
             "입고일": (datetime(2026,5,20)+timedelta(days=i)).strftime("%Y-%m-%d"),
             "검사결과": random.choice(["합격","합격","불합격"]), "처리자": random.choice(["김철수","이영희"])}
            for i in range(1, 9)
        ])
        st.dataframe(in_history, use_container_width=True, hide_index=True)

    # ── 출고 처리 ───────────────────────────────────────────────────────────
    with inv_tabs[2]:
        st.markdown("##### 출고 처리")
        with st.form("outbound_form"):
            c1, c2 = st.columns(2)
            with c1:
                wo_no     = st.text_input("생산 오더 번호", placeholder="예: WO-2026001")
                out_part  = st.text_input("부품 코드", placeholder="예: BEARING-6204")
                out_qty   = st.number_input("출고 수량", min_value=1, value=50)
            with c2:
                out_worker= st.text_input("출고 담당자", placeholder="예: 박민준")
                out_note  = st.text_area("비고", height=68)
            if st.form_submit_button("출고 처리", type="primary"):
                st.success(f"출고 처리 완료: {out_part} {out_qty}EA → {wo_no}")

        st.markdown("##### 출고 이력")
        out_history = pd.DataFrame([
            {"생산오더": f"WO-2026{i:03d}", "부품코드": f"GEAR-{i*6}T", "출고수량": random.randint(10,100),
             "출고일": (datetime(2026,6,1)+timedelta(days=i-1)).strftime("%Y-%m-%d"),
             "출고자": random.choice(["박민준","정수빈","최우진"])}
            for i in range(1, 9)
        ])
        st.dataframe(out_history, use_container_width=True, hide_index=True)

    # ── 재고 조정 ───────────────────────────────────────────────────────────
    with inv_tabs[3]:
        st.markdown("##### 실사 결과 입력 (재고 조정)")
        with st.form("adj_form"):
            c1, c2 = st.columns(2)
            with c1:
                adj_part  = st.text_input("부품 코드", placeholder="예: WASHER-J")
                adj_sys   = st.number_input("시스템 재고", min_value=0, value=200)
                adj_real  = st.number_input("실사 재고",   min_value=0, value=195)
            with c2:
                adj_reason= st.selectbox("조정 사유", ["실사 차이", "불량 폐기", "분실", "오입력 수정"])
                adj_note  = st.text_area("비고", height=88)
            if st.form_submit_button("재고 조정 등록", type="primary"):
                diff = adj_real - adj_sys
                st.warning(f"재고 조정 완료: {adj_part} {adj_sys:+d}EA → {adj_real}EA (차이: {diff:+d})")

        st.markdown("##### 조정 이력")
        adj_history = pd.DataFrame([
            {"부품코드": f"PART-{i:03d}", "조정전": random.randint(180,250),
             "조정후": random.randint(170,240), "사유": random.choice(["실사 차이","불량 폐기"]),
             "조정일": (datetime(2026,5,15)+timedelta(days=i*2)).strftime("%Y-%m-%d"),
             "처리자": random.choice(["창고팀A","창고팀B"])}
            for i in range(1, 7)
        ])
        st.dataframe(adj_history, use_container_width=True, hide_index=True)

# ═════════════════════════════════════════════════════════════════════════════
# TAB 4: 실적 집계
# ═════════════════════════════════════════════════════════════════════════════
with tab4:
    st.subheader("📊 실적 집계")

    date_col1, date_col2, _ = st.columns([1, 1, 2])
    with date_col1:
        perf_start = st.date_input("조회 시작일", value=datetime(2026, 5, 5), key="perf_s")
    with date_col2:
        perf_end   = st.date_input("조회 종료일",  value=datetime(2026, 6, 4), key="perf_e")

    perf_tabs = st.tabs(["일별 생산 실적", "작업자별 실적", "설비별 가동률"])

    # ── 일별 실적 ───────────────────────────────────────────────────────────
    with perf_tabs[0]:
        df_daily = _daily_production(
            datetime.combine(perf_start, datetime.min.time()),
            datetime.combine(perf_end,   datetime.min.time()),
        )
        fig_daily = go.Figure()
        fig_daily.add_bar(x=df_daily["날짜"], y=df_daily["계획수량"], name="계획",
                          marker_color="#90caf9")
        fig_daily.add_bar(x=df_daily["날짜"], y=df_daily["실적수량"], name="실적",
                          marker_color="#1976d2")
        fig_daily.update_layout(barmode="group", title="일별 생산 계획 vs 실적",
                                 height=350, margin=dict(l=10, r=10, t=40, b=10))
        st.plotly_chart(fig_daily, use_container_width=True)

        def _color_achieve(val):
            if isinstance(val, float):
                if val >= 100: return "color:#2e7d32;font-weight:700"
                if val >= 90:  return "color:#f57f17"
                return "color:#c62828;font-weight:700"
            return ""

        st.dataframe(
            df_daily.style.applymap(_color_achieve, subset=["달성률(%)"]),
            use_container_width=True, hide_index=True,
        )

    # ── 작업자별 실적 ────────────────────────────────────────────────────────
    with perf_tabs[1]:
        df_wp = _worker_performance()

        fig_wp = px.bar(df_wp, x="작업자", y="달성률(%)",
                        color="달성률(%)", color_continuous_scale="RdYlGn",
                        title="작업자별 달성률 (%)", text="달성률(%)")
        fig_wp.add_hline(y=100, line_dash="dash", line_color="red", annotation_text="목표 100%")
        fig_wp.update_layout(height=320, margin=dict(l=10, r=10, t=40, b=10))
        st.plotly_chart(fig_wp, use_container_width=True)

        st.dataframe(df_wp, use_container_width=True, hide_index=True)

    # ── 설비별 가동률 ────────────────────────────────────────────────────────
    with perf_tabs[2]:
        oee_data = _machine_oee()
        st.markdown("##### 설비별 OEE 현황")

        for i in range(0, len(oee_data), 3):
            row_machines = oee_data[i:i+3]
            cols = st.columns(3)
            for col, m in zip(cols, row_machines):
                with col:
                    st.markdown(f"**{m['설비명']}** — OEE: {m['OEE']*100:.1f}%")
                    sub_c1, sub_c2, sub_c3 = st.columns(3)
                    sub_c1.metric("가동률", f"{m['가동률']*100:.1f}%")
                    sub_c2.metric("성능률", f"{m['성능률']*100:.1f}%")
                    sub_c3.metric("품질률", f"{m['품질률']*100:.1f}%")

                    fig_oee = go.Figure(go.Indicator(
                        mode="gauge+number",
                        value=round(m["OEE"] * 100, 1),
                        number={"suffix": "%"},
                        gauge={
                            "axis": {"range": [0, 100]},
                            "bar":  {"color": "#1976d2"},
                            "steps": [
                                {"range": [0, 60],  "color": "#ffcdd2"},
                                {"range": [60, 80], "color": "#fff9c4"},
                                {"range": [80, 100],"color": "#c8e6c9"},
                            ],
                            "threshold": {"line": {"color": "red", "width": 3},
                                          "thickness": 0.75, "value": 85},
                        },
                    ))
                    fig_oee.update_layout(height=200, margin=dict(l=10, r=10, t=20, b=10))
                    st.plotly_chart(fig_oee, use_container_width=True, key=f"oee_{m['설비명']}")
                    st.markdown("---")

# ═════════════════════════════════════════════════════════════════════════════
# TAB 5: OEE/설비 모니터링
# ═════════════════════════════════════════════════════════════════════════════
with tab5:
    st.subheader("🔧 OEE/설비 실시간 모니터링")

    last_update = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    st.markdown(
        f'<div style="text-align:right;font-size:0.8rem;color:#888;">최종 갱신: {last_update}</div>',
        unsafe_allow_html=True,
    )

    # ── 6개 설비 그리드 ─────────────────────────────────────────────────────
    random.seed(42)
    machines_mon = [
        {"name": "CNC-01",      "status": "가동", "oee": 88.4, "temp": 42, "vib": 1.2, "pres": 102},
        {"name": "CNC-02",      "status": "경보", "oee": 61.2, "temp": 78, "vib": 3.8, "pres": 98},
        {"name": "사출기-A",    "status": "가동", "oee": 82.7, "temp": 55, "vib": 0.9, "pres": 145},
        {"name": "용접기-B",    "status": "정지", "oee": 0.0,  "temp": 25, "vib": 0.1, "pres": 0},
        {"name": "조립라인-1",  "status": "가동", "oee": 91.3, "temp": 38, "vib": 1.5, "pres": 115},
        {"name": "도장라인-2",  "status": "가동", "oee": 77.9, "temp": 47, "vib": 2.1, "pres": 108},
    ]

    STATUS_BORDER = {"가동": "#388e3c", "경보": "#d32f2f", "정지": "#757575"}
    STATUS_BG     = {"가동": "#f1f8e9", "경보": "#fff3e3", "정지": "#f5f5f5"}

    rows_mon = [machines_mon[:3], machines_mon[3:]]
    for row in rows_mon:
        cols = st.columns(3)
        for col, m in zip(cols, row):
            border_c = STATUS_BORDER.get(m["status"], "#9e9e9e")
            bg_c     = STATUS_BG.get(m["status"], "#fff")
            status_emoji = {"가동": "🟢", "경보": "🔴", "정지": "⚫"}.get(m["status"], "⚪")

            with col:
                st.markdown(
                    f"""<div style="border:2px solid {border_c};border-radius:10px;
                    background:{bg_c};padding:14px;margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-weight:700;font-size:1rem;">{m['name']}</span>
                      <span style="font-size:1.1rem;">{status_emoji}
                        <span style="font-size:0.78rem;font-weight:600;color:{border_c};">{m['status']}</span>
                      </span>
                    </div>
                    <div style="margin-top:8px;font-size:0.82rem;color:#444;">
                      🌡️ 온도: <b>{m['temp']}°C</b> &nbsp;|&nbsp;
                      📳 진동: <b>{m['vib']} mm/s</b> &nbsp;|&nbsp;
                      💨 압력: <b>{m['pres']} kPa</b>
                    </div>
                    </div>""",
                    unsafe_allow_html=True,
                )
                if m["status"] != "정지":
                    fig_m = go.Figure(go.Indicator(
                        mode="gauge+number",
                        value=m["oee"],
                        number={"suffix": "%"},
                        title={"text": "OEE", "font": {"size": 13}},
                        gauge={
                            "axis": {"range": [0, 100]},
                            "bar":  {"color": border_c},
                            "steps": [
                                {"range": [0, 60],  "color": "#ffcdd2"},
                                {"range": [60, 80], "color": "#fff9c4"},
                                {"range": [80, 100],"color": "#c8e6c9"},
                            ],
                        },
                    ))
                    fig_m.update_layout(height=190, margin=dict(l=5, r=5, t=30, b=5))
                    st.plotly_chart(fig_m, use_container_width=True, key=f"mon_{m['name']}")
                else:
                    st.markdown(
                        '<div style="text-align:center;padding:40px 0;color:#9e9e9e;font-size:1.2rem;">⚫ 설비 정지</div>',
                        unsafe_allow_html=True,
                    )

    # ── 알람 이력 ───────────────────────────────────────────────────────────
    st.markdown("---")
    st.markdown("##### 🔔 알람 이력")
    df_alarms = _alarms()

    def _color_severity(val):
        return {"긴급": "background-color:#ffebee;color:#c62828;font-weight:700",
                "주의": "background-color:#fff3e0;color:#e65100",
                "정보": "background-color:#e3f2fd;color:#1565c0"}.get(val, "")

    def _color_action2(val):
        return {"조치완료": "color:#2e7d32;font-weight:700",
                "조치중":   "color:#e65100",
                "미조치":   "color:#c62828;font-weight:700"}.get(val, "")

    styled_alarms = (df_alarms.style
                     .applymap(_color_severity, subset=["심각도"])
                     .applymap(_color_action2,  subset=["조치여부"]))
    st.dataframe(styled_alarms, use_container_width=True, hide_index=True)

    # ── 예방보전 일정 ────────────────────────────────────────────────────────
    st.markdown("---")
    st.markdown("##### 🛠️ 예방보전 일정 (다음달)")
    df_maint = _maintenance_schedule()
    st.dataframe(df_maint, use_container_width=True, hide_index=True)

    # 갱신 버튼
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🔄 데이터 갱신", type="secondary"):
        st.rerun()
