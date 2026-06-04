# Akos AI MES — 디자인 시스템 & 컴포넌트 가이드라인 v1.0

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [컬러 시스템](#2-컬러-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [컴포넌트 목록 & 스펙](#4-컴포넌트-목록--스펙)
5. [반응형 레이아웃 전략](#5-반응형-레이아웃-전략)
6. [Streamlit 구현 가이드라인](#6-streamlit-구현-가이드라인)
7. [접근성 기준](#7-접근성-기준)

---

## 1. 디자인 원칙

### 1.1 핵심 철학: "현장에서 3초 안에 판단 가능해야 한다"

제조 현장은 일반 사무 환경과 근본적으로 다릅니다. 소음, 진동, 저조도, 장갑 착용, 시간 압박이 동시에 존재합니다. Akos AI MES의 모든 UI 결정은 이 환경을 최우선으로 고려합니다.

---

### 1.2 5대 디자인 원칙

#### 원칙 1. Clarity First — 즉각적 명료성
- 상태(PASS/FAIL/WARNING)는 색상 + 아이콘 + 텍스트 3중 표현으로 색맹·저조도 환경에서도 인지 가능
- 핵심 수치는 화면당 최대 5개로 제한 (인지 과부하 방지)
- 여백(Whitespace)을 적극 활용하여 데이터 분리
- 모든 상태 변화는 시각적 피드백이 500ms 이내 제공

#### 원칙 2. Touch-Tolerant — 장갑 착용 대응
- 최소 터치 영역: **48×48px** (WCAG AA 기준 초과 적용)
- 현장 POP 화면 터치 영역: **64×64px** 이상
- 인접 버튼 간격: 최소 **16px** (오터치 방지)
- 스와이프·핀치 제스처 의존 UI 배제, 단일 탭으로 완결되는 액션 설계

#### 원칙 3. Dark-Mode Native — 저조도·야간 환경
- 기본 테마: Dark Mode (공장 야간 조명, 모니터 반사 최소화)
- 배경 휘도: 밝기 기준 최대 15% (눈부심 방지)
- 모든 텍스트 대비 비율: WCAG AAA 기준 **7:1 이상** 적용
- 오퍼레이터 화면은 라이트 모드 선택 가능 (사용자 설정 토글)

#### 원칙 4. AI Transparency — AI 신뢰도 가시화
- 모든 AI 예측값에는 **신뢰도(Confidence %)** 와 **근거 요약** 필수 표시
- 신뢰도 70% 미만 예측값은 자동으로 WARNING 스타일 적용
- AI 추천과 사람 판단의 시각적 구분 유지 (아이콘 및 색상 구분)
- "AI가 틀릴 수 있다"는 메시지를 자연스럽게 UI에 내재화

#### 원칙 5. Progressive Disclosure — 역할별 정보 계층
- 경영진: 요약 KPI 카드 → 드릴다운 (2단계)
- 생산관리자: 공정 현황 → 세부 작업 (3단계)
- 현장작업자: 현재 작업만 전면 표시 (1단계, 최대 단순화)
- 불필요한 설정·고급 기능은 접어서 숨김 (Collapsible Panel)

---

### 1.3 원칙 적용 우선순위 매트릭스

| 화면 유형 | Clarity | Touch-Tolerant | Dark-Mode | AI Transparency | Progressive |
|-----------|---------|----------------|-----------|-----------------|-------------|
| 현장 POP (작업자) | ★★★★★ | ★★★★★ | ★★★★☆ | ★★☆☆☆ | ★★★★★ |
| 대시보드 (관리자) | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |
| AI 분석 화면 | ★★★★☆ | ★★☆☆☆ | ★★★☆☆ | ★★★★★ | ★★★☆☆ |
| FAT 체크리스트 | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |
| 경영 보고 | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ |

---

## 2. 컬러 시스템

### 2.1 컬러 토큰 아키텍처

3계층 구조로 관리합니다: **Primitive → Semantic → Component**

```
Primitive (원시값)      →  Semantic (의미)        →  Component (적용)
blue-600 (#2563EB)     →  color-primary          →  button-bg
red-500 (#EF4444)      →  color-status-fail      →  status-card-fail-border
```

---

### 2.2 Primary 팔레트 — Industrial Blue

제조업의 신뢰성, 정밀성, 기술력을 표현하는 Industrial Blue 계열입니다.

| 토큰 이름 | HEX | RGB | 용도 |
|-----------|-----|-----|------|
| `primary-900` | `#0C1A2E` | 12, 26, 46 | Dark 배경 기반 |
| `primary-800` | `#1E3A5F` | 30, 58, 95 | 사이드바, 헤더 배경 |
| `primary-700` | `#1D4ED8` | 29, 78, 216 | 주요 버튼 Hover |
| `primary-600` | `#2563EB` | 37, 99, 235 | Primary 버튼, 링크 |
| `primary-500` | `#3B82F6` | 59, 130, 246 | 아이콘, 강조 텍스트 |
| `primary-400` | `#60A5FA` | 96, 165, 250 | Dark 모드 링크 |
| `primary-300` | `#93C5FD` | 147, 197, 253 | Dark 모드 보조 텍스트 |
| `primary-100` | `#DBEAFE` | 219, 234, 254 | Light 모드 배경 강조 |

---

### 2.3 Secondary 팔레트 — Steel Gray

공장 기계/철강 이미지에서 추출한 중립 계열입니다.

| 토큰 이름 | HEX | RGB | 용도 |
|-----------|-----|-----|------|
| `gray-950` | `#0A0F1E` | 10, 15, 30 | 최상위 Dark 배경 |
| `gray-900` | `#111827` | 17, 24, 39 | 기본 Dark 배경 |
| `gray-800` | `#1F2937` | 31, 41, 55 | 카드 배경 (Dark) |
| `gray-700` | `#374151` | 55, 65, 81 | 보더, 구분선 |
| `gray-600` | `#4B5563` | 75, 85, 99 | 비활성 아이콘 |
| `gray-400` | `#9CA3AF` | 156, 163, 175 | 보조 텍스트 |
| `gray-200` | `#E5E7EB` | 229, 231, 235 | Light 모드 배경 |
| `gray-50` | `#F9FAFB` | 249, 250, 251 | Light 모드 최상위 배경 |

---

### 2.4 Status 컬러 시스템 — 핵심

제조 현장의 생명선인 상태 표시 컬러입니다. **색맹 대응을 위해 모양·텍스트와 항상 병행** 사용합니다.

#### PASS (합격/정상)

| 토큰 | HEX | 명도비(Dark bg 기준) | 용도 |
|------|-----|---------------------|------|
| `status-pass-500` | `#22C55E` | 8.2:1 | 주요 PASS 표시 |
| `status-pass-400` | `#4ADE80` | 10.1:1 | Dark 모드 텍스트 |
| `status-pass-bg` | `#052E16` | — | PASS 카드 배경 |
| `status-pass-border` | `#16A34A` | — | PASS 카드 보더 |

#### FAIL (불합격/이상)

| 토큰 | HEX | 명도비(Dark bg 기준) | 용도 |
|------|-----|---------------------|------|
| `status-fail-500` | `#EF4444` | 5.9:1 | 주요 FAIL 표시 |
| `status-fail-400` | `#F87171` | 7.8:1 | Dark 모드 텍스트 |
| `status-fail-bg` | `#2D0707` | — | FAIL 카드 배경 |
| `status-fail-border` | `#DC2626` | — | FAIL 카드 보더 |

#### WARNING (경고/주의)

| 토큰 | HEX | 명도비(Dark bg 기준) | 용도 |
|------|-----|---------------------|------|
| `status-warn-500` | `#F59E0B` | 8.7:1 | 주요 WARNING 표시 |
| `status-warn-400` | `#FCD34D` | 12.3:1 | Dark 모드 텍스트 |
| `status-warn-bg` | `#1C1202` | — | WARNING 카드 배경 |
| `status-warn-border` | `#D97706` | — | WARNING 카드 보더 |

#### IN_PROGRESS (진행 중)

| 토큰 | HEX | 용도 |
|------|-----|------|
| `status-progress-500` | `#06B6D4` | 작업 진행 표시 |
| `status-progress-400` | `#22D3EE` | Dark 모드 텍스트 |
| `status-progress-bg` | `#042F2E` | 진행 카드 배경 |

#### IDLE (대기/유휴)

| 토큰 | HEX | 용도 |
|------|-----|------|
| `status-idle-500` | `#6B7280` | 대기 상태 |
| `status-idle-400` | `#9CA3AF` | Dark 모드 텍스트 |

---

### 2.5 AI 신뢰도 컬러 그라디언트

AI 예측 신뢰도를 직관적으로 표현하는 연속 스펙트럼입니다.

| 신뢰도 구간 | 토큰 | HEX | 레이블 | 의미 |
|------------|------|-----|--------|------|
| 90% ~ 100% | `ai-confidence-high` | `#22C55E` | HIGH | 강한 신뢰, 즉시 적용 권장 |
| 75% ~ 89% | `ai-confidence-good` | `#84CC16` | GOOD | 신뢰 양호, 검토 후 적용 |
| 60% ~ 74% | `ai-confidence-moderate` | `#F59E0B` | MODERATE | 주의 필요, 추가 검증 권장 |
| 45% ~ 59% | `ai-confidence-low` | `#F97316` | LOW | 낮은 신뢰, 사람 판단 우선 |
| 0% ~ 44% | `ai-confidence-uncertain` | `#EF4444` | UNCERTAIN | 매우 불확실, AI 무시 권고 |

---

### 2.6 컬러 사용 규칙

```
DO:
  - 상태 컬러는 항상 배경 + 보더 + 텍스트 세트로 사용
  - 동일 화면에 4가지 이상의 Status 컬러 혼재 금지
  - Primary 버튼은 primary-600 단독 사용

DO NOT:
  - status-fail 컬러를 장식 목적으로 사용 금지
  - primary와 status-pass (양쪽 다 녹색 계열) 혼용 금지
  - 텍스트에 status-warn-500 직접 사용 금지 (명도비 미달 가능)
```

---

## 3. 타이포그래피

### 3.1 폰트 패밀리

#### 한글 기본 폰트: Pretendard

```css
font-family: 'Pretendard Variable', 'Pretendard', 
             -apple-system, BlinkMacSystemFont, 
             'Noto Sans KR', sans-serif;
```

선정 이유:
- 가변 폰트(Variable Font)로 단일 파일로 모든 굵기 커버
- 제조업 UI에 적합한 중성적이고 기계적인 조형
- 저해상도 산업용 모니터에서 가독성 검증됨
- 한글 낱자 간격 최적화로 숫자-한글 혼용 시 균형 유지

#### 영문/숫자 보조 폰트: JetBrains Mono (수치 전용)

```css
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
/* 적용 대상: 수치 데이터, 코드, 시리얼 번호, 타임스탬프 */
```

선정 이유:
- 고정폭(Monospace)으로 수치 정렬이 명확
- 0(영)과 O(오), 1(일)과 l(엘) 혼동 방지 — 제조 현장 필수
- 숫자 변화 시 레이아웃 유동 없음 (KPI 대시보드 필수 조건)

---

### 3.2 타입 스케일

현장 가독성을 위해 최소 크기를 일반 웹 기준보다 상향 조정합니다.

| 토큰 | px | rem | 용도 | 행간(line-height) |
|------|-----|-----|------|-------------------|
| `text-display` | 48px | 3rem | 대형 KPI 수치, 경고 메시지 | 1.1 |
| `text-headline` | 32px | 2rem | 페이지 제목, 섹션 헤더 | 1.2 |
| `text-title-lg` | 24px | 1.5rem | 카드 제목, 모달 헤더 | 1.3 |
| `text-title-md` | 20px | 1.25rem | 서브섹션 제목 | 1.4 |
| `text-title-sm` | 18px | 1.125rem | 테이블 컬럼 헤더 | 1.4 |
| `text-body-lg` | 16px | 1rem | 기본 본문 (데스크탑) | 1.6 |
| `text-body-md` | 14px | 0.875rem | 보조 설명, 라벨 | 1.6 |
| `text-body-sm` | 12px | 0.75rem | 캡션, 타임스탬프 | 1.5 |
| `text-micro` | 10px | 0.625rem | 뱃지 텍스트 (최소값, 이하 금지) | 1.4 |

> 현장 POP 화면(태블릿)에서는 전체 스케일을 **1.25배** 상향 적용합니다.

---

### 3.3 폰트 웨이트 시스템

| 웨이트 | 값 | 용도 |
|--------|-----|------|
| `font-regular` | 400 | 일반 본문, 설명 텍스트 |
| `font-medium` | 500 | 라벨, 네비게이션 항목 |
| `font-semibold` | 600 | 카드 제목, 버튼 텍스트 |
| `font-bold` | 700 | KPI 수치, 상태 텍스트, 경고 |
| `font-extrabold` | 800 | 대형 디스플레이 수치 전용 |

---

### 3.4 현장 가독성 기준

```
최소 본문 크기:
  - 데스크탑 (설계자/관리자): 14px
  - 태블릿 POP (현장작업자): 18px
  - 경고/에러 메시지: 16px 이상 + Bold 필수

글자 간격 (letter-spacing):
  - 한글 본문: -0.01em (Pretendard 기본 최적화)
  - 영문 제목: 0.02em (가독성 향상)
  - 수치 데이터: 0 (JetBrains Mono 자체 최적화)
  - ALL CAPS 텍스트: 0.08em (강제 규칙)

단어 간격:
  - 모든 버튼 라벨: normal
  - 테이블 헤더: 0.05em

줄 길이 (line-length):
  - 최적: 60~80자 (한글 기준 30~40자)
  - 최대: 100자 (이상 시 컬럼 분리 권고)
```

---

### 3.5 수치 표시 포맷 규칙

```
생산 수량:    1,234개    (천 단위 콤마, Monospace)
불량률:       6.3%       (소수점 1자리, % 단위 붙여쓰기)
신뢰도:       87.5%      (소수점 1자리)
금액:         ₩1,234,000 (원화 기호, 천 단위 콤마)
온도:         72.3°C     (소수점 1자리, 단위 붙여쓰기)
타임스탬프:   2025-10-15 14:32:07  (ISO 8601 기반 24시간)
공정 시간:    02h 34m    (0 패딩, 시/분 단위)
```

---

## 4. 컴포넌트 목록 & 스펙

### 4.1 StatusCard

현장 설비 또는 공정의 현재 상태를 한눈에 보여주는 핵심 카드 컴포넌트입니다.

#### 해부도

```
┌─────────────────────────────────────────┐  ← 보더: 3px, status-color
│  [상태 아이콘 32px]  상태 텍스트         │  ← 헤더 영역 (48px 높이)
│                      PASS / FAIL / WARN  │
├─────────────────────────────────────────┤
│                                         │
│  [메인 수치]         [단위]              │  ← 수치 영역
│  48px Bold           16px               │
│                                         │
│  [서브 라벨]         [변화량 ±x.x%]     │  ← 보조 정보
│  14px Gray-400       12px               │
│                                         │
├─────────────────────────────────────────┤
│  타임스탬프: 2025-10-15 14:32           │  ← 풋터 (32px 높이)
└─────────────────────────────────────────┘
```

#### 스펙

| 속성 | 값 |
|------|-----|
| 최소 너비 | 200px |
| 최소 높이 | 160px |
| 패딩 | 16px (상하), 20px (좌우) |
| 보더 반경 | 8px |
| 보더 두께 | 3px (상단), 1px (나머지) |
| 배경 (Dark) | `gray-800` |
| 배경 (PASS) | `status-pass-bg` |
| 배경 (FAIL) | `status-fail-bg` |
| 배경 (WARNING) | `status-warn-bg` |
| 그림자 | `0 4px 16px rgba(0,0,0,0.4)` |
| 호버 트랜지션 | `transform: scale(1.02), 150ms ease` |

#### 상태 아이콘 매핑

```
PASS      →  ✓  (체크마크, status-pass-400)
FAIL      →  ✗  (X마크, status-fail-400)
WARNING   →  ⚠  (삼각경고, status-warn-400)
PROGRESS  →  ⟳  (회전화살표, status-progress-400, 애니메이션)
IDLE      →  ○  (빈 원, status-idle-400)
```

#### Streamlit 구현 예시

```python
def render_status_card(
    title: str,
    value: str | float,
    unit: str = "",
    status: Literal["PASS", "FAIL", "WARNING", "PROGRESS", "IDLE"] = "IDLE",
    delta: float | None = None,
    timestamp: str | None = None,
    sub_label: str = ""
) -> None:
    status_config = {
        "PASS":     {"icon": "✓", "color": "#22C55E", "bg": "#052E16", "border": "#16A34A"},
        "FAIL":     {"icon": "✗", "color": "#F87171", "bg": "#2D0707", "border": "#DC2626"},
        "WARNING":  {"icon": "⚠", "color": "#FCD34D", "bg": "#1C1202", "border": "#D97706"},
        "PROGRESS": {"icon": "⟳", "color": "#22D3EE", "bg": "#042F2E", "border": "#0891B2"},
        "IDLE":     {"icon": "○", "color": "#9CA3AF", "bg": "#1F2937", "border": "#374151"},
    }
    cfg = status_config[status]
    delta_html = ""
    if delta is not None:
        delta_color = "#22C55E" if delta >= 0 else "#F87171"
        delta_sign  = "▲" if delta >= 0 else "▼"
        delta_html  = f'<span style="color:{delta_color};font-size:12px">{delta_sign} {abs(delta):.1f}%</span>'

    st.markdown(f"""
    <div style="
        background:{cfg['bg']};
        border:1px solid {cfg['border']};
        border-top:3px solid {cfg['color']};
        border-radius:8px;
        padding:16px 20px;
        min-height:160px;
        font-family:'Pretendard Variable',sans-serif;
    ">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span style="color:{cfg['color']};font-size:24px;font-weight:700">{cfg['icon']}</span>
            <span style="color:{cfg['color']};font-size:14px;font-weight:600;
                         letter-spacing:0.08em">{status}</span>
        </div>
        <div style="font-size:48px;font-weight:800;color:#F9FAFB;
                    font-family:'JetBrains Mono',monospace;line-height:1.1">
            {value}<span style="font-size:16px;font-weight:400;
                                color:#9CA3AF;margin-left:4px">{unit}</span>
        </div>
        <div style="display:flex;justify-content:space-between;
                    align-items:center;margin-top:8px">
            <span style="color:#9CA3AF;font-size:14px">{sub_label}</span>
            {delta_html}
        </div>
        {'<div style="border-top:1px solid #374151;margin-top:12px;padding-top:8px;' +
         'color:#6B7280;font-size:12px">' + (timestamp or "") + '</div>' if timestamp else ''}
    </div>
    """, unsafe_allow_html=True)
```

---

### 4.2 KPIGauge

생산성, 불량률, 달성률 등 핵심 지표를 게이지 형태로 표시합니다.

#### 해부도

```
         목표치 레이블
              ↓
     ┌───────────────┐
     │   75%  [목표] │
     │  ╔═══════╗   │   ← 반원 게이지
     │  ║███░░░ ║   │   ← 달성 부분 (색상 채움)
     │  ╚═══════╝   │
     │  현재: 1,234  │   ← 현재값 (JetBrains Mono)
     │  목표: 1,600  │   ← 목표값
     │  달성률: 77%  │   ← 퍼센트
     └───────────────┘
```

#### 스펙

| 속성 | 값 |
|------|-----|
| 게이지 유형 | 반원형 Arc Gauge (SVG 기반) |
| 최소 크기 | 200×140px |
| 두께 | 16px (배경), 18px (진행) |
| 게이지 색상 분기 | 90%+ : `status-pass-500`, 70~89% : `status-warn-500`, ~69% : `status-fail-500` |
| 애니메이션 | Arc sweep 800ms ease-out (초기 로드 시) |
| 내부 수치 | `text-display` (48px), JetBrains Mono |
| 레이블 | `text-body-sm` (12px), Gray-400 |

#### 임계값 설정 가이드

```python
# KPI별 기본 임계값 (프로젝트 KPI 기반)
KPI_THRESHOLDS = {
    "생산성":  {"warning": 70, "fail": 50, "unit": "%"},
    "불량률":  {"warning": 5,  "fail": 8,  "unit": "%",  "invert": True},
    # invert=True: 낮을수록 좋은 지표 (불량률, 납기지연 등)
    "AI정확도": {"warning": 80, "fail": 70, "unit": "%"},
    "납기준수율": {"warning": 85, "fail": 70, "unit": "%"},
    "설비가동률": {"warning": 75, "fail": 60, "unit": "%"},
}
```

---

### 4.3 BOMTree

자재 명세서(Bill of Materials)의 계층 구조를 탐색 가능한 트리로 표시합니다.

#### 해부도

```
▼ ASM-0001 | 자동화 설비 본체         [재고: 1] [단가: ₩45,000,000]
  ▼ SUB-0010 | 구동 모듈              [재고: 3] [단가: ₩8,200,000]
    ▶ PART-0101 | 서보모터 200W       [재고: 12] [단가: ₩450,000]
    ▶ PART-0102 | 감속기 1/10         [재고: 8]  [단가: ₩280,000] ⚠ 재고부족
    ▶ PART-0103 | 커플링              [재고: 20] [단가: ₩35,000]
  ▼ SUB-0020 | 제어 모듈              [재고: 2] [단가: ₩3,100,000]
    ▶ PART-0201 | PLC 컨트롤러        [재고: 5]  [단가: ₩1,200,000]
    ▶ PART-0202 | HMI 터치패널        [재고: 2]  [단가: ₩680,000]  ✗ 단종
```

#### 스펙

| 속성 | 값 |
|------|-----|
| 인덴트 깊이 | 24px per level |
| 최대 표시 깊이 | 5단계 (이후 "더 보기" 처리) |
| 행 높이 | 40px (데스크탑), 52px (태블릿) |
| 펼침 아이콘 | ▼/▶ (12px, primary-400) |
| 재고 경고 | ⚠ 아이콘 + 노란 하이라이트 |
| 단종 표시 | ✗ 아이콘 + 취소선 + 빨간 텍스트 |
| 검색 | 인라인 필터 (실시간 하이라이트) |
| 드래그앤드롭 | 지원 안 함 (실수 방지) |
| 선택 모드 | 단일 선택, 선택 시 primary-800 배경 |
| 컨텍스트 메뉴 | 우클릭 → 이력 조회 / 수정 / PDF 출력 |

#### 컬럼 구성

```python
BOM_COLUMNS = [
    {"id": "code",      "label": "품번",    "width": "140px", "align": "left",  "monospace": True},
    {"id": "name",      "label": "품명",    "width": "flex",  "align": "left"},
    {"id": "qty",       "label": "수량",    "width": "80px",  "align": "right", "monospace": True},
    {"id": "unit",      "label": "단위",    "width": "60px",  "align": "center"},
    {"id": "stock",     "label": "재고",    "width": "80px",  "align": "right", "monospace": True, "status": True},
    {"id": "unit_cost", "label": "단가",    "width": "120px", "align": "right", "monospace": True, "format": "currency"},
    {"id": "total_cost","label": "금액",    "width": "140px", "align": "right", "monospace": True, "format": "currency"},
    {"id": "lead_time", "label": "리드타임","width": "100px", "align": "center"},
]
```

---

### 4.4 GanttBar

프로젝트/생산 일정의 간트 차트 컴포넌트입니다.

#### 해부도

```
공정명         | 담당자 | 9/1  9/8  9/15  9/22  9/29 10/6
───────────────┼────────┼────────────────────────────────
설계 검토      | 김PM   | ████████░░░░░░░░░░░░░░░░░░░░░
               |        |      ↑ 오늘
도면 작업      | 이설계 | ░░░░░████████████░░░░░░░░░░░░
BOM 확정       | 박생산 | ░░░░░░░░░░░████░░░░░░░░░░░░░░  ⚠ 지연
생산 착수      | 생산팀 | ░░░░░░░░░░░░░░░████████████░░
FAT 테스트     | 품질팀 | ░░░░░░░░░░░░░░░░░░░░░███████
```

#### 스펙

| 속성 | 값 |
|------|-----|
| 바 높이 | 28px |
| 행 높이 | 48px |
| 헤더 높이 | 56px |
| 오늘선 | 2px, primary-400, 점선 |
| 완료 바 | `status-pass-500`, 투명도 90% |
| 진행 바 | `status-progress-500`, 줄무늬 애니메이션 |
| 지연 바 | `status-fail-500` + `⚠` 아이콘 |
| 계획 바 | `gray-600`, 점선 보더 |
| 마일스톤 | 다이아몬드 ◆ (16×16px) |
| 스크롤 | 수평 스크롤 (가로축), 수직 고정 |
| 줌 레벨 | 일간 / 주간 / 월간 토글 |
| 클릭 액션 | 작업 상세 패널 슬라이드 인 |

---

### 4.5 FATChecklist

공장 인수 테스트(Factory Acceptance Test) 항목 체크리스트입니다.

#### 해부도

```
┌──────────────────────────────────────────────────────┐
│  FAT 체크리스트  [프로젝트: AKS-2025-087]            │
│  진행률: ━━━━━━━━━━━━░░░░░░  68%  (17/25 항목)      │
├──────────────────────────────────────────────────────┤
│  카테고리: 전기 안전 검사                             │
│                                                      │
│  ✓  1. 절연저항 측정  ≥ 1MΩ        실측: 4.7 MΩ    │  ← PASS (녹색)
│  ✓  2. 접지저항 측정  ≤ 0.1Ω       실측: 0.03 Ω   │  ← PASS
│  ✗  3. 과전류 보호    60A           실측: 72 A      │  ← FAIL (빨간)
│  ⚠  4. 비상정지 응답  ≤ 0.5s       실측: 0.47 s    │  ← 경계값 (노란)
│  ○  5. 접촉기 동작    -             미측정           │  ← 미완료 (회색)
│                                                      │
│  [측정값 입력]  [사진 첨부]  [서명]  [다음 항목 ▶]  │
└──────────────────────────────────────────────────────┘
```

#### 스펙

| 속성 | 값 |
|------|-----|
| 항목 행 높이 | 56px (태블릿 터치 최적화) |
| 체크박스 크기 | 24×24px |
| 입력 필드 너비 | 120px (측정값) |
| 진행바 높이 | 8px, 둥근 모서리 |
| 첨부 버튼 | 64×64px (카메라 아이콘, 장갑 착용 대응) |
| 서명 영역 | 200×80px (터치 서명 패드) |
| 자동 저장 | 항목 완료 시 즉시 (낙관적 업데이트) |
| 오프라인 지원 | 로컬 캐시 후 연결 복구 시 동기화 |
| AI 보조 | 측정값 이상 감지 시 자동 WARNING 전환 |
| PDF 출력 | 완료 후 A4 포맷 자동 생성 |

#### 항목 상태 전환 규칙

```python
def evaluate_fat_item(measured: float, spec: dict) -> str:
    """
    spec = {
        "min": float | None,
        "max": float | None,
        "warn_min": float | None,  # 경고 하한
        "warn_max": float | None,  # 경고 상한
    }
    """
    if spec.get("min") and measured < spec["min"]: return "FAIL"
    if spec.get("max") and measured > spec["max"]: return "FAIL"
    if spec.get("warn_min") and measured < spec["warn_min"]: return "WARNING"
    if spec.get("warn_max") and measured > spec["warn_max"]: return "WARNING"
    return "PASS"
```

---

### 4.6 AIConfidenceBadge

AI 예측/추천 결과의 신뢰도를 뱃지 형태로 표시합니다.

#### 해부도 (크기 변형)

```
작은 크기 (인라인):
  [AI 87%]   ← 배경 colored, 텍스트 흰색

중간 크기 (카드 내):
  ┌─────────────────┐
  │ 🤖 AI 예측       │
  │ ████████░░  87% │  ← 미니 진행바
  │ HIGH CONFIDENCE │
  └─────────────────┘

큰 크기 (전용 패널):
  ┌──────────────────────────────────┐
  │  AI 예측 신뢰도                  │
  │                                  │
  │  87.3%  HIGH                    │  ← 메인 수치
  │  ████████████░░░░                │  ← 게이지
  │                                  │
  │  근거: XGBoost 모델 (v2.1)       │
  │  유사 사례: 최근 30일 내 124건   │
  │  주요 피처: 온도 편차, 압력 변동 │
  │                                  │
  │  ⚠ AI 예측은 참고용입니다.       │
  │    최종 판단은 담당자가 합니다.  │
  └──────────────────────────────────┘
```

#### 스펙

| 속성 | 값 |
|------|-----|
| Small 크기 | 높이 24px, 패딩 4px 8px, 반경 12px |
| Medium 크기 | 높이 64px, 패딩 12px 16px, 반경 8px |
| Large 크기 | 너비 280px, 패딩 20px, 반경 12px |
| 로봇 아이콘 | `🤖` 또는 SVG 커스텀 아이콘 16px |
| 게이지 높이 | 6px (medium), 10px (large) |
| 툴팁 | 근거 요약 (호버 시, 700ms 딜레이) |
| 깜빡임 | 신뢰도 45% 미만 시 pulse 애니메이션 |

#### Streamlit 구현 예시

```python
def render_ai_confidence_badge(
    confidence: float,
    model_name: str = "XGBoost",
    basis_count: int = 0,
    size: Literal["sm", "md", "lg"] = "md"
) -> None:
    thresholds = [
        (90, "#22C55E", "HIGH"),
        (75, "#84CC16", "GOOD"),
        (60, "#F59E0B", "MODERATE"),
        (45, "#F97316", "LOW"),
        (0,  "#EF4444", "UNCERTAIN"),
    ]
    color, label = next(
        (c, l) for t, c, l in thresholds if confidence >= t
    )
    bar_width = int(confidence)
    pulse = "animation: pulse 1.5s infinite;" if confidence < 45 else ""

    if size == "sm":
        st.markdown(f"""
        <span style="background:{color};color:white;padding:4px 8px;
                     border-radius:12px;font-size:12px;font-weight:600;{pulse}">
            🤖 AI {confidence:.0f}%
        </span>""", unsafe_allow_html=True)
    elif size == "lg":
        disclaimer = (
            '<div style="background:#1C1202;border:1px solid #D97706;'
            'border-radius:6px;padding:8px;margin-top:12px;'
            'color:#FCD34D;font-size:11px">'
            '⚠ AI 예측은 참고용입니다. 최종 판단은 담당자가 합니다.</div>'
        )
        st.markdown(f"""
        <div style="background:#1F2937;border:1px solid {color};
                    border-radius:12px;padding:20px;width:280px">
            <div style="color:#9CA3AF;font-size:12px;margin-bottom:8px">🤖 AI 예측 신뢰도</div>
            <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px">
                <span style="font-size:40px;font-weight:800;color:{color};
                             font-family:'JetBrains Mono',monospace">
                    {confidence:.1f}%
                </span>
                <span style="color:{color};font-size:14px;font-weight:600">{label}</span>
            </div>
            <div style="background:#374151;border-radius:5px;height:10px;overflow:hidden">
                <div style="background:{color};width:{bar_width}%;height:100%;
                            border-radius:5px;transition:width 0.8s ease-out"></div>
            </div>
            <div style="margin-top:12px;color:#9CA3AF;font-size:12px;line-height:1.6">
                <div>모델: {model_name}</div>
                <div>유사 사례: {basis_count:,}건</div>
            </div>
            {disclaimer}
        </div>
        """, unsafe_allow_html=True)
```

---

### 4.7 ChatBubble

RAG AI Agent / FAT AI Agent와의 대화 인터페이스 컴포넌트입니다.

#### 해부도

```
┌──────────────────────────────────────────────────────┐
│  💬 AI Assistant (RAG Agent)           [축소] [설정] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────┐           │
│  │ 🤖                                   │  AI 버블   │
│  │ PART-0102 감속기의 최근 불량 이력을  │  (좌측 정렬)│
│  │ 분석했습니다.                         │           │
│  │                                      │           │
│  │ • 최근 30일: 3건 (2.4%)             │           │
│  │ • 주요 원인: 오일씰 마모 (67%)       │           │
│  │ • 권장 조치: 예방 교체 주기 단축     │           │
│  │                                      │           │
│  │ [87% 신뢰도]  근거 보기 ▼           │           │
│  └──────────────────────────────────────┘           │
│                                                      │
│                    ┌──────────────────────────────┐  │
│  사용자 버블        │                  교체 주기는? │  │
│  (우측 정렬)        └──────────────────────────────┘  │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [입력창: 메시지를 입력하세요...]       [전송 ▶]    │
└──────────────────────────────────────────────────────┘
```

#### 스펙

| 속성 | 값 |
|------|-----|
| AI 버블 배경 | `gray-800` |
| AI 버블 보더 | 1px `primary-700` |
| 사용자 버블 배경 | `primary-800` |
| 버블 최대 너비 | 컨테이너의 75% |
| 버블 패딩 | 12px 16px |
| 버블 반경 | 12px (일반), 4px (말풍선 꼭지 쪽) |
| 아이콘 크기 | 32×32px (AI), 28×28px (사용자) |
| 타임스탬프 | 12px, Gray-600, 버블 아래 |
| 로딩 상태 | 점 3개 펄스 애니메이션 (타이핑 표시) |
| 입력 필드 높이 | 48px (기본), 최대 120px (자동 확장) |
| 전송 버튼 | 48×48px (터치 대응) |
| 참고 문서 | 인용 출처 토글 (접기/펴기) |
| 피드백 | 버블당 👍/👎 버튼 (AI 학습 피드백) |
| 컨텍스트 유지 | 최근 10턴 기억 (토큰 절약) |

---

## 5. 반응형 레이아웃 전략

### 5.1 브레이크포인트 정의

| 브레이크포인트 | 범위 | 주요 사용 환경 | 대상 사용자 |
|--------------|------|--------------|------------|
| `xs` | ~ 480px | 스마트폰 | 경영진 모바일 확인 |
| `sm` | 481 ~ 768px | 소형 태블릿 | 이동 중 현장 확인 |
| `md` | 769 ~ 1024px | 태블릿 (10~12인치) | 현장 POP, 작업자 |
| `lg` | 1025 ~ 1440px | 노트북 | 설계자, 생산관리자 |
| `xl` | 1441px ~ | 와이드 모니터 | 대시보드, 경영진 TV |

---

### 5.2 데스크탑 대시보드 레이아웃 (xl / lg)

```
┌────────────────────────────────────────────────────────────┐
│  [로고] Akos AI MES    [알림 3]  [사용자: 김PM]  [설정]    │  ← 헤더 60px
├──────────────┬─────────────────────────────────────────────┤
│              │  KPI 카드 영역 (4 컬럼 그리드)              │
│  사이드바    │  [생산달성률]  [불량률]  [가동률]  [AI정확도]│  ← 120px
│  240px       ├─────────────────────────────────────────────┤
│              │  메인 콘텐츠 영역                           │
│  - 대시보드  │                                             │
│  - 생산관리  │  [간트차트 / 공정현황 / BOM트리]           │  ← 가변
│  - BOM       │                                             │
│  - FAT       │                                             │
│  - AI분석    ├─────────────────────────────────────────────┤
│  - 견적      │  [AI 채팅]  [최근 알림]  [빠른 액션]        │  ← 320px
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

그리드 설정:
```css
.dashboard-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    grid-template-rows: 60px 1fr;
    height: 100vh;
    overflow: hidden; /* 외부 스크롤 방지 */
}

.kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 16px;
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 320px; /* 메인 + 사이드 패널 */
    gap: 16px;
    padding: 16px;
    overflow-y: auto;
}
```

---

### 5.3 태블릿 현장 POP 레이아웃 (md)

현장 작업자용 최우선 화면. 정보 최소화, 터치 최대화.

```
┌────────────────────────────────────┐
│  [◀] 작업 지시 #AKS-2025-087  [≡] │  ← 헤더 56px (햄버거 메뉴)
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │  현재 공정: 배선 작업 (3/8)  │  │  ← 현재 작업 카드 (큰 폰트)
│  │  작업자: 이현장               │  │
│  │  경과: 01h 23m               │  │
│  └──────────────────────────────┘  │
│                                    │
│  다음 단계:                        │  ← 다음 작업 미리보기
│  ┌──────────────────────────────┐  │
│  │  4. 토크 체결 확인           │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────┐  ┌────────────────┐  │
│  │  ✓ 완료  │  │  ⚠ 이상 보고  │  │  ← 주요 액션 버튼 (64px)
│  └──────────┘  └────────────────┘  │
│                                    │
│  [AI 도움말 요청]                  │  ← 보조 버튼
└────────────────────────────────────┘
```

POP 레이아웃 설정:
```css
.pop-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 0;
    font-size: 18px; /* 기본 폰트 1.25배 */
}

.pop-action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px;
}

.pop-action-btn {
    height: 64px;
    font-size: 18px;
    font-weight: 700;
    border-radius: 12px;
}
```

---

### 5.4 모바일 확인 레이아웃 (xs / sm)

경영진 또는 관리자가 외부에서 현황을 빠르게 확인하는 용도.

```
┌─────────────────────┐
│  Akos MES      [☰] │  ← 헤더 48px
├─────────────────────┤
│  오늘 생산 현황     │
│  ┌─────────────────┐│
│  │생산달성률        ││
│  │  78%  ⚠ 주의   ││  ← 스와이프 가능 카드
│  └─────────────────┘│
│  < ●○○○ >          │  ← 페이지 인디케이터
├─────────────────────┤
│  알림 (3건)         │
│  • FAIL: 압력 초과  │
│  • AI: 예측 불량    │
│  • 승인 요청        │
├─────────────────────┤
│  [대시보드] [알림]  │  ← 하단 탭바 (56px)
│  [작업]    [설정]   │
└─────────────────────┘
```

---

### 5.5 Streamlit 반응형 전략

Streamlit은 기본 반응형을 일부 지원하지만 제조 현장 요구를 충족하려면 커스텀이 필요합니다.

```python
import streamlit as st

def get_device_layout() -> str:
    """
    JavaScript로 화면 너비를 감지하여 레이아웃 모드 반환.
    Streamlit session_state에 저장.
    """
    st.markdown("""
    <script>
    const width = window.innerWidth;
    const layoutMode = width >= 1441 ? 'xl' :
                       width >= 1025 ? 'lg' :
                       width >= 769  ? 'md' :
                       width >= 481  ? 'sm' : 'xs';
    // Streamlit에 값 전달
    window.parent.postMessage({
        type: 'streamlit:setComponentValue',
        value: layoutMode
    }, '*');
    </script>
    """, unsafe_allow_html=True)
    return st.session_state.get("layout_mode", "lg")

def render_responsive_kpi_grid(kpi_data: list[dict]) -> None:
    layout = get_device_layout()
    cols_map = {"xl": 4, "lg": 4, "md": 2, "sm": 1, "xs": 1}
    cols = st.columns(cols_map.get(layout, 4))
    for i, kpi in enumerate(kpi_data):
        with cols[i % cols_map.get(layout, 4)]:
            render_status_card(**kpi)
```

---

## 6. Streamlit 구현 가이드라인

### 6.1 커스텀 CSS 아키텍처

Streamlit의 기본 스타일을 덮어쓰는 전략적 CSS 구조입니다.

#### CSS 로드 순서

```
1. reset.css         (Streamlit 기본 스타일 초기화)
2. tokens.css        (CSS Custom Properties — 컬러/타이포 토큰)
3. layout.css        (그리드, 플렉스 레이아웃)
4. components.css    (컴포넌트별 스타일)
5. utilities.css     (헬퍼 클래스)
6. theme.dark.css    (다크 테마 오버라이드)
7. page-specific.css (페이지별 오버라이드 — 최후 수단)
```

---

### 6.2 CSS 토큰 파일 (tokens.css)

```css
/* tokens.css — Akos AI MES Design System v1.0 */
:root {
    /* === Primary === */
    --color-primary-900: #0C1A2E;
    --color-primary-800: #1E3A5F;
    --color-primary-700: #1D4ED8;
    --color-primary-600: #2563EB;
    --color-primary-500: #3B82F6;
    --color-primary-400: #60A5FA;
    --color-primary-300: #93C5FD;

    /* === Gray === */
    --color-gray-950:  #0A0F1E;
    --color-gray-900:  #111827;
    --color-gray-800:  #1F2937;
    --color-gray-700:  #374151;
    --color-gray-600:  #4B5563;
    --color-gray-400:  #9CA3AF;
    --color-gray-200:  #E5E7EB;
    --color-gray-50:   #F9FAFB;

    /* === Status === */
    --color-pass-500:     #22C55E;
    --color-pass-400:     #4ADE80;
    --color-pass-bg:      #052E16;
    --color-pass-border:  #16A34A;

    --color-fail-500:     #EF4444;
    --color-fail-400:     #F87171;
    --color-fail-bg:      #2D0707;
    --color-fail-border:  #DC2626;

    --color-warn-500:     #F59E0B;
    --color-warn-400:     #FCD34D;
    --color-warn-bg:      #1C1202;
    --color-warn-border:  #D97706;

    --color-progress-500: #06B6D4;
    --color-progress-400: #22D3EE;
    --color-progress-bg:  #042F2E;

    /* === Typography === */
    --font-base:   'Pretendard Variable', 'Pretendard', -apple-system,
                   BlinkMacSystemFont, 'Noto Sans KR', sans-serif;
    --font-mono:   'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

    --text-display:    3rem;     /* 48px */
    --text-headline:   2rem;     /* 32px */
    --text-title-lg:   1.5rem;   /* 24px */
    --text-title-md:   1.25rem;  /* 20px */
    --text-title-sm:   1.125rem; /* 18px */
    --text-body-lg:    1rem;     /* 16px */
    --text-body-md:    0.875rem; /* 14px */
    --text-body-sm:    0.75rem;  /* 12px */

    /* === Spacing === */
    --space-1:  4px;
    --space-2:  8px;
    --space-3:  12px;
    --space-4:  16px;
    --space-5:  20px;
    --space-6:  24px;
    --space-8:  32px;
    --space-10: 40px;
    --space-12: 48px;

    /* === Border === */
    --radius-sm:  4px;
    --radius-md:  8px;
    --radius-lg:  12px;
    --radius-xl:  16px;
    --radius-full: 9999px;

    /* === Shadow === */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);

    /* === Transition === */
    --trans-fast:   150ms ease;
    --trans-normal: 250ms ease;
    --trans-slow:   500ms ease;
}
```

---

### 6.3 Streamlit 전역 CSS 주입 전략

```python
# utils/style_injector.py
import streamlit as st
from pathlib import Path

def inject_global_styles() -> None:
    """앱 최초 실행 시 전역 CSS 주입 — app.py에서 한 번만 호출"""
    css_files = [
        "assets/css/reset.css",
        "assets/css/tokens.css",
        "assets/css/layout.css",
        "assets/css/components.css",
        "assets/css/utilities.css",
        "assets/css/theme.dark.css",
    ]
    combined_css = ""
    for css_file in css_files:
        path = Path(css_file)
        if path.exists():
            combined_css += path.read_text(encoding="utf-8") + "\n"

    # Streamlit 기본 UI 요소 숨김/오버라이드
    streamlit_overrides = """
    /* Streamlit 기본 스타일 오버라이드 */
    #MainMenu, footer, header { visibility: hidden; }
    .stDeployButton { display: none; }

    /* 앱 기본 폰트 적용 */
    html, body, [class*="css"] {
        font-family: var(--font-base) !important;
        background-color: var(--color-gray-900) !important;
        color: var(--color-gray-50) !important;
    }

    /* 스크롤바 스타일 */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--color-gray-900); }
    ::-webkit-scrollbar-thumb {
        background: var(--color-gray-600);
        border-radius: var(--radius-full);
    }

    /* Streamlit 버튼 오버라이드 */
    .stButton > button {
        background-color: var(--color-primary-600) !important;
        color: white !important;
        border: none !important;
        border-radius: var(--radius-md) !important;
        font-family: var(--font-base) !important;
        font-weight: 600 !important;
        font-size: var(--text-body-lg) !important;
        min-height: 48px !important;
        padding: 0 var(--space-5) !important;
        transition: all var(--trans-fast) !important;
    }

    .stButton > button:hover {
        background-color: var(--color-primary-700) !important;
        transform: translateY(-1px) !important;
        box-shadow: var(--shadow-md) !important;
    }

    /* Streamlit 메트릭 카드 오버라이드 */
    [data-testid="metric-container"] {
        background: var(--color-gray-800) !important;
        border: 1px solid var(--color-gray-700) !important;
        border-radius: var(--radius-md) !important;
        padding: var(--space-4) !important;
    }

    /* Streamlit 데이터프레임 오버라이드 */
    .stDataFrame {
        background: var(--color-gray-800) !important;
        border-radius: var(--radius-md) !important;
    }

    /* 입력 필드 오버라이드 */
    .stTextInput > div > div > input,
    .stSelectbox > div > div > div,
    .stNumberInput > div > div > input {
        background-color: var(--color-gray-800) !important;
        color: var(--color-gray-50) !important;
        border-color: var(--color-gray-700) !important;
        border-radius: var(--radius-md) !important;
        min-height: 48px !important;
        font-size: var(--text-body-lg) !important;
    }

    /* 사이드바 오버라이드 */
    [data-testid="stSidebar"] {
        background-color: var(--color-primary-800) !important;
        border-right: 1px solid var(--color-gray-700) !important;
    }
    """

    st.markdown(
        f"<style>{combined_css}{streamlit_overrides}</style>",
        unsafe_allow_html=True
    )
```

---

### 6.4 페이지 구조 표준 템플릿

```python
# pages/production_dashboard.py
import streamlit as st
from utils.style_injector import inject_global_styles
from components import render_status_card, render_kpi_gauge
from services import get_production_kpis

# 페이지 설정 — 반드시 첫 번째 Streamlit 호출
st.set_page_config(
    page_title="생산 대시보드 | Akos AI MES",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded",
)

# 전역 스타일 주입
inject_global_styles()

# 사이드바 렌더링
with st.sidebar:
    render_sidebar_nav(active="production")

# 페이지 헤더
col_title, col_refresh, col_export = st.columns([6, 1, 1])
with col_title:
    st.markdown(
        '<h1 style="font-size:var(--text-headline);font-weight:700;'
        'color:var(--color-gray-50);margin:0">생산 대시보드</h1>',
        unsafe_allow_html=True
    )
with col_refresh:
    if st.button("새로고침", key="btn_refresh"):
        st.cache_data.clear()
        st.rerun()

# KPI 구역
st.markdown("---")
kpis = get_production_kpis()
kpi_cols = st.columns(4)
for i, (col, kpi) in enumerate(zip(kpi_cols, kpis)):
    with col:
        render_status_card(**kpi)

# 메인 콘텐츠
main_col, side_col = st.columns([3, 1])
with main_col:
    render_gantt_chart()
with side_col:
    render_ai_chat_panel()
```

---

### 6.5 성능 최적화 가이드

```python
# 데이터 캐싱 전략
@st.cache_data(ttl=30)  # 30초 캐시 — 실시간성과 성능 균형
def get_production_kpis() -> list[dict]:
    """KPI 데이터는 30초 캐시"""
    ...

@st.cache_data(ttl=300)  # 5분 캐시
def get_bom_tree(project_id: str) -> dict:
    """BOM은 자주 변경되지 않으므로 5분 캐시"""
    ...

@st.cache_resource  # 앱 생명주기 동안 유지
def get_ai_model():
    """AI 모델은 한 번만 로드"""
    ...

# 비동기 로딩 패턴 (Streamlit의 동기 특성 우회)
def render_with_loading(render_fn, data_fn, loading_msg="로딩 중..."):
    """데이터 로딩 중 스켈레톤 UI 표시"""
    with st.spinner(loading_msg):
        data = data_fn()
    render_fn(data)
```

---

## 7. 접근성 기준

### 7.1 공장 환경 특화 접근성 체크리스트

일반 웹 접근성(WCAG 2.1)을 기반으로 제조 현장 환경에 맞게 강화한 기준입니다.

---

### 7.2 시각적 접근성

#### 색상 대비 기준

| 요소 유형 | 최소 대비 비율 | 목표 대비 비율 | 기준 |
|---------|--------------|--------------|------|
| 일반 본문 텍스트 | 4.5:1 | 7:1 | WCAG AA → AAA 상향 |
| 대형 텍스트 (18px+) | 3:1 | 4.5:1 | WCAG AA |
| KPI 수치 (48px+) | 3:1 | 5:1 | 현장 특화 |
| 상태 아이콘 | 3:1 | 4.5:1 | WCAG AA |
| 버튼 텍스트 | 4.5:1 | 7:1 | WCAG AAA |
| 입력 필드 플레이스홀더 | 3:1 | 4.5:1 | 현장 특화 |

#### 색맹 대응 (필수)

```
Red-Green 색맹 (가장 흔함, 인구의 8%) 대응:
  - PASS: 녹색 + ✓ 체크마크 아이콘 + "PASS" 텍스트 (색상만으로 의존 금지)
  - FAIL: 빨간색 + ✗ X마크 아이콘 + "FAIL" 텍스트
  - 추가: PASS 녹색(#22C55E)과 FAIL 빨간색(#EF4444)은
          명도(Luminance) 차이를 3:1 이상 유지

Blue-Yellow 색맹 대응:
  - WARNING 노란색 + ⚠ 경고 삼각형 아이콘 필수 병행
  - AI 신뢰도 게이지에 수치 텍스트 필수 표시

전맹(전색맹) 대응:
  - 모든 상태 정보는 텍스트로도 전달 (아이콘 alt text 포함)
```

---

### 7.3 청각적 접근성

```
공장 소음 환경 (평균 85dB 이상) 대응:

필수 사항:
  - 경고 알림은 시각(플래시/배너) + 진동(태블릿) 병행
  - 음성 알림 사용 금지 (소음 환경에서 불가청)
  - 중요 알림은 화면 전체를 덮는 풀스크린 오버레이 사용

권장 사항:
  - 태블릿 진동 패턴:
    FAIL 알림:    ─ ─ ─  (3회 짧은 진동)
    WARNING 알림: ─ ───  (짧은 후 긴 진동)
    완료 확인:    ───     (1회 긴 진동)
```

---

### 7.4 운동/조작 접근성

```
장갑 착용 환경 대응:

터치 영역:
  - 최소: 48×48px (WCAG 2.1 AA)
  - 현장 POP 버튼: 64×64px (장갑 착용 기준)
  - 인접 요소 간격: 최소 16px (8px 이하 금지)
  - 스와이프 제스처 의존 기능 배제

입력 인터페이스:
  - 소형 키보드 입력 최소화 → 선택 입력 (드롭다운, 버튼) 우선
  - 수치 입력 시 큰 숫자패드 (NumPad) 팝업 제공
  - 바코드/QR 스캔 입력 지원 (카메라 연동)
  - 음성 입력 지원 (조용한 환경 한정, 선택 사항)

오류 방지:
  - 파괴적 액션 (삭제, 취소)은 확인 대화상자 필수 (2단계 확인)
  - 실수로 누르기 쉬운 위치에 위험 버튼 배치 금지
  - 폼 제출 전 미리보기 화면 제공
```

---

### 7.5 인지적 접근성

```
현장 작업자 인지 부하 최소화:

정보 설계:
  - 화면당 핵심 정보 최대 5~7개 (Miller의 법칙)
  - 작업 단계를 1~2~3 순서로 명확히 표시
  - 현재 위치 (브레드크럼, 진행률) 항상 표시
  - 이전 화면으로 돌아가는 버튼 항상 좌상단 고정

오류 메시지:
  - 기술 용어 사용 금지 (예: "500 Internal Server Error" → "서버에 문제가 발생했습니다")
  - 오류 원인 + 해결 방법을 함께 표시
  - 오류 발생 시 자동 IT 지원 요청 버튼 제공

언어:
  - 기술 약어는 초회 등장 시 전체 표기 (예: FAT = Factory Acceptance Test)
  - 영문 전용 표기 지양, 한글 병기 원칙
  - 숫자와 단위 사이 공백 없음 (72.3°C, 87.5%, 1,234개)
```

---

### 7.6 접근성 검증 체크리스트

모든 화면 배포 전 필수 검토 항목입니다.

#### 시각 검증

```
□ 모든 텍스트 대비 비율 ≥ 4.5:1 (dev 도구 또는 WebAIM Contrast Checker)
□ 상태 표시에 색상 + 아이콘 + 텍스트 3중 표현 적용
□ Dark 모드와 Light 모드 양쪽 검증
□ 브라우저 200% 확대 시 레이아웃 깨짐 없음
□ 색맹 시뮬레이터(Coblis 등)로 상태 색상 구분 가능 여부 확인
```

#### 터치/입력 검증

```
□ 모든 인터랙티브 요소 터치 영역 ≥ 48×48px
□ POP 화면 주요 버튼 ≥ 64×64px
□ 키보드 탭 순서가 논리적 흐름과 일치
□ 모든 폼 입력 필드에 레이블 연결 (label for 또는 aria-label)
□ 오류 입력 시 명확한 피드백 (빨간 보더 + 오류 메시지)
```

#### 성능/신뢰성 검증

```
□ 3G 네트워크(1Mbps) 환경에서 핵심 화면 3초 내 로드
□ 오프라인 상태에서 캐시 데이터 표시 및 안내 메시지 출력
□ 30초 이상 작업 시 자동 저장 또는 경고
□ 세션 만료 시 작업 내용 로컬 저장 후 재로그인 복구
□ 실시간 데이터 업데이트 실패 시 "마지막 업데이트 시간" 표시
```

#### AI 관련 접근성

```
□ 모든 AI 예측에 신뢰도 수치 표시
□ 신뢰도 < 70% 시 자동 WARNING 표시 및 사람 검토 유도
□ AI 추천과 사람 입력이 시각적으로 명확히 구분
□ AI 오류/불확실 시 "AI 판단 불가, 담당자 확인 필요" 메시지
□ AI 응답 지연 시 로딩 인디케이터 + 최대 대기 시간 안내
```

---

### 7.7 접근성 자동 테스트 통합

```python
# tests/test_accessibility.py
# axe-core 기반 자동 접근성 테스트 (CI/CD 파이프라인 통합)

import pytest
from playwright.sync_api import Page

PAGES_TO_TEST = [
    "/",
    "/production",
    "/bom",
    "/fat",
    "/ai-analysis",
]

@pytest.mark.parametrize("path", PAGES_TO_TEST)
def test_accessibility(page: Page, path: str) -> None:
    page.goto(f"http://localhost:8501{path}")
    page.wait_for_load_state("networkidle")

    # axe-core 실행
    violations = page.evaluate("""
        async () => {
            const results = await axe.run();
            return results.violations;
        }
    """)

    # Critical/Serious 위반은 빌드 실패
    critical = [v for v in violations if v['impact'] in ('critical', 'serious')]
    assert len(critical) == 0, (
        f"접근성 위반 {len(critical)}건 발견:\n" +
        "\n".join(f"  - [{v['impact']}] {v['description']}" for v in critical)
    )
```

---

## 부록 A. 컴포넌트 임포트 구조

```
src/
├── assets/
│   ├── css/
│   │   ├── tokens.css
│   │   ├── reset.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   ├── utilities.css
│   │   └── theme.dark.css
│   └── fonts/
│       ├── Pretendard-Variable.woff2
│       └── JetBrainsMono.woff2
├── components/
│   ├── __init__.py
│   ├── status_card.py
│   ├── kpi_gauge.py
│   ├── bom_tree.py
│   ├── gantt_bar.py
│   ├── fat_checklist.py
│   ├── ai_confidence_badge.py
│   └── chat_bubble.py
├── utils/
│   ├── style_injector.py
│   ├── color_utils.py       # 대비 비율 계산
│   └── responsive.py        # 반응형 레이아웃 헬퍼
└── pages/
    ├── dashboard.py
    ├── production.py
    ├── bom.py
    ├── fat.py
    └── ai_analysis.py
```

---

## 부록 B. 컬러 빠른 참조표

| 상황 | 배경 | 보더 | 텍스트 | 아이콘 |
|------|------|------|--------|--------|
| PASS | `#052E16` | `#16A34A` | `#4ADE80` | ✓ |
| FAIL | `#2D0707` | `#DC2626` | `#F87171` | ✗ |
| WARNING | `#1C1202` | `#D97706` | `#FCD34D` | ⚠ |
| IN PROGRESS | `#042F2E` | `#0891B2` | `#22D3EE` | ⟳ |
| AI HIGH | `#052E16` | `#16A34A` | `#22C55E` | 🤖 |
| AI MODERATE | `#1C1202` | `#D97706` | `#F59E0B` | 🤖 |
| AI UNCERTAIN | `#2D0707` | `#DC2626` | `#EF4444` | 🤖 |

---

*Akos AI MES Design System v1.0 — 주식회사 아코스*
*최종 업데이트: 2025-09 | 작성: AI MES 프로젝트팀*
*다음 리뷰: v1.1 (2025-11, 베타 테스트 피드백 반영 예정)*
