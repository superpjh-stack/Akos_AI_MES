# Akos AI MES — 기술 사양서 (Spec)

## 시스템 아키텍처 개요

5계층 레이어 구조:

```
[Presentation Layer]  웹 대시보드, 모바일 POP, 현장 단말
        ↕
[AI Agent Layer]      RAG AI Agent, FAT AI Agent, 예측 AI
        ↕
[Application Layer]   FastAPI, MES 비즈니스 로직
        ↕
[Data Layer]          RDBMS (PostgreSQL) + Vector DB (pgvector)
        ↕
[Edge/Physical Layer] Edge Collector, PLC/HMI, IoT 센서, 설비
```

---

## 하드웨어 구성

### 서버 스펙

| 서버 | vCPU | RAM | Storage | 역할 |
|------|------|-----|---------|------|
| AP 서버 | 4 | 8GB | 100GB SSD | Web/API, AI Chat UI |
| DB 서버 | 4 | 16GB | 300GB SSD | PostgreSQL (운영 데이터) |
| Vector DB | 4 | 16GB | 200GB SSD | PostgreSQL + pgvector (RAG) |
| AI 서버 | 8 | 16GB | 200GB SSD | LangChain, LangGraph, Prophet, ML |

### Edge Collector (Mini PC)
- **프로토콜**: OPC-UA, Modbus TCP/IP, RS-485, MQTT, Kafka
- **역할**: PLC/HMI 실시간 데이터 수집 → Edge Buffer → MES 전송
- **설비 연결**: CNC, 선반, 밀링, MCT, Conveyor, Lifter, FAT 테스트베드

### 기타 HW
- 데이터 게이트웨이 1식
- 스마트 공장 통합 서버 1식 (AI 추론 서버)
- RFID/QR 리더기, 터치 단말, POP 디바이스

---

## 소프트웨어 스택

| 구분 | 기술 |
|------|------|
| Web Framework | Streamlit, FastAPI |
| Web Server | Nginx |
| Container | Docker |
| DB | PostgreSQL |
| Vector DB | pgvector (PostgreSQL extension) |
| AI/ML | LangChain, LangGraph, XGBoost, Random Forest, LightGBM, Prophet |
| AI 설명성 | SHAP |
| 프로토콜 | OPC-UA, Modbus TCP/IP, MQTT, Kafka, REST API |
| 기존 연동 | SCM, ERP, PLM, APS, FEMS (API/DB 연동) |

---

## 핵심 기능 모듈

### 1. 설계/BOM 모듈
- PDM 연동으로 CAD 도면 → BOM 자동 생성
- BOM 변경 이력 관리 및 버전 관리
- 부품 표준화 및 중복 제거
- **AI**: 설계 데이터 기반 불량 예측 Feature Engineering

### 2. 생산/공정 모듈
- 프로젝트별 생산 스케줄 관리 (수주 → 설계 → 구매 → 제조)
- 작업지시 발행 및 실적 집계
- 설비별 OEE, 가동률, 불량률 실시간 모니터링
- **AI Agent**: RAG 기반 공정 이상 탐지 및 일정 최적화 제안

### 3. FAT 모듈 (공장 인수 검사)
- FAT 결과 데이터 자동 수집 (PASS/FAIL, 측정값, PLC 로그, 이상 온도)
- 불합격 항목 자동 분류 및 재작업 지시
- **FAT AI Agent**: 과거 FAT 이력 RAG 검색 → 원인 분석 → 조치 권고
- FAT 완료율 KPI 실시간 추적

### 4. 납품/SAT 모듈
- 현장 설치 진행 현황 관리
- 출하 검사, 현장 조건 검사, 최종 성능 검사 기록
- SAT 결과 → BOM 설계 피드백 루프
- 납품 이력 및 고객사별 품질 이력 관리

### 5. 원가/견적 모듈
- 과거 프로젝트 원가 DB 기반 자동 견적
- PM 시스템 연동 (인력·자재·일정 데이터)
- 납기 예측 및 리스크 알림

---

## AI 컴포넌트 상세

### A. 예측 AI (Predictive AI Engine)
```
목적: 불량 예측, 원가 예측, 납기 예측
알고리즘: XGBoost + Random Forest + LightGBM + Feature Engineering
설명성: SHAP (Top-N 기여 변수 시각화)

입력 데이터:
  - 설비 데이터 (BOM 구성, 설비 사양, 납품 이력)
  - 설계 데이터 (BOM, 설계 변경 횟수, 공차 등급)
  - 생산 데이터 (공정 이상, 자재 수급, OEE)
  - 납품 데이터 (고객 조건, 운송 방식, 현장 환경)

출력:
  - 원가 예측 (Cost Prediction) → 목표 정확도 ≥ 90%
  - 납기 예측 (Lead Time Prediction) → 목표 정확도 ≥ 85%
  - 불량 위험 스코어 (1~10) → 불량률 50% 감소 기여
  - 불량 예상 원인 Top-3
```

### B. 생산/공정 AI Agent (RAG Agent)
```
목적: 공정 의사결정 지원, 이상 탐지, 일정 최적화
기술: LLM + RAG + Vector DB (pgvector)

지식 베이스:
  - 공정 이상 이력 (SOP, 조치 방법)
  - 설비 매뉴얼 및 유지보수 기록
  - BOM/설계 변경 이력

기능:
  - 자연어 질의로 공정 문제 원인 검색
  - 유사 이상 사례 자동 매핑
  - 일정 지연 예상 시 대안 제안
```

### C. FAT AI Agent
```
목적: FAT 불합격 원인 자동 분석 및 재작업 최소화
기술: LLM + 맥락 분석 + 데이터 기반 ML

기능:
  - FAT 데이터(측정값, PASS/FAIL, PLC 로그) 실시간 분석
  - 불합격 패턴 자동 분류 및 근본 원인 추론
  - 재작업 지시 자동 생성
  - FAT 통과율 KPI 실시간 추적
```

---

## AI 성능 목표 (KPI)

| 지표 | 측정 방법 | 목표 |
|------|-----------|------|
| 원가 예측 정확도 | MAPE (Mean Absolute Percentage Error) | ≥ 90% (MAPE ≤ 10%) |
| 납기 예측 정확도 | 실제 대비 ±5일 이내 비율 | ≥ 85% |
| 견적 생성 시간 | 직접 측정 | 30~60분 |
| 납기 오차 마진 | MAE (일 단위) | ≤ 5일 |
| AI 설명 가능성 | SHAP Top-N 일치율 (Spearman Rank) | ≥ 90% |
| 불량률 감소 | ppm 기준 | 427 → 400 ppm (-6.3%) |
| 생산성 향상 | 단위 기준 | 835 → 780 재작업 감소 (-6.5%) |

---

## 데이터 아키텍처

### RDBMS (PostgreSQL)
- 프로젝트/설비 마스터 데이터
- BOM 및 설계 변경 이력
- 생산 실적 (LOT, 공정, 작업자)
- FAT 결과 (PASS/FAIL, 측정값, 이상 온도)
- 납품/SAT 데이터

### Vector DB (pgvector)
- 설계 도면 및 BOM 임베딩
- SOP/조치 방법 문서 임베딩
- FAT 불합격 이력 임베딩
- 납품 후 AS 기록 임베딩
- 설비 매뉴얼 임베딩

### Data Pipeline
```
Edge Collector → MQTT/Kafka → Data Gateway → ETL → Data Lake
                                                      ↓
                                              RDBMS + Vector DB
                                                      ↓
                                            AI Engine + AI Agent
```

---

## 외부 시스템 연동

| 시스템 | 연동 방식 | 데이터 |
|--------|-----------|--------|
| PDM (설계) | API + 파일 동기화 | BOM, 도면, 설계 변경 |
| ERP | REST API / DB | 수주, 구매, 원가 |
| PLC/HMI | OPC-UA, Modbus | 실시간 설비 상태 |
| FAT 테스트베드 | IoT/TCP | 측정값, PASS/FAIL |
| SCM/APS | API | 자재 수급, 생산 계획 |

---

## 구현 범위 (Phase 1 — 3개월)

| 단계 | 기간 | 내용 |
|------|------|------|
| Phase 1 | 2025.09 | 인프라 구축, Edge Collector 연결, DB 설계 |
| Phase 2 | 2025.10 | MES 핵심 기능 (BOM, 생산, FAT) 개발 |
| Phase 3 | 2025.11 | AI 모듈 통합, 검증, KPI 측정 |
