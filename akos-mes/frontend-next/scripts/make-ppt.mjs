/**
 * Akos AI MES 화면정의서 생성 스크립트
 * - Playwright로 모든 화면 스크린샷 캡처
 * - pptxgenjs로 PowerPoint 화면정의서 생성
 */

import { chromium } from 'playwright';
import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');
const BASE_URL = 'http://localhost:3000';
const OUTPUT_FILE = path.join(__dirname, '..', '..', '..', '..', '화면정의서_akos.pptx');

// ── 화면 목록 (사이드바 기준, 사업계획서 p39-42) ──────────────────────────────
const SCREENS = [
  // AI 대시보드
  { section: 'AI 대시보드', name: '생산현황 분석',    route: '/',                        desc: '프로젝트별 제작 진행률, 공정별 작업 실적, 납기 위험 현황 통합 분석. 수주부터 FAT, 설치까지 진행 상태 시각화.' },
  { section: 'AI 대시보드', name: '품질현황 분석',    route: '/dashboard/quality',       desc: 'FAT 품질 데이터의 불량 및 리워크 현황 분석. 반복 품질 이슈와 공정 품질 편차 확인.' },
  { section: 'AI 대시보드', name: '설비상태 모니터링', route: '/production/oee',          desc: 'CNC, 용접기 등 주요 설비 상태 모니터링. OEE(가동률·성능률·품질률) 실시간 표시.' },
  { section: 'AI 대시보드', name: '프로젝트현황분석', route: '/dashboard/projects',      desc: '프로젝트별 원가, 납기, 공정진척, 품질이슈 통합 조회. 고위험 프로젝트 조기 식별.' },

  // 수주견적관리
  { section: '수주견적관리', name: '수익성/리스크분석',    route: '/quotation/risk',     desc: '예상 원가, 목표마진, 납기 지연 가능성 기반 프로젝트 리스크 산정. 저수익 수주 사전 식별.' },
  { section: '수주견적관리', name: '유사 프로젝트 조회',   route: '/quotation/similar',  desc: '신규 견적 조건과 유사한 과거 프로젝트 검색. 설비유형·BOM규모·공정난이도 기준 비교.' },
  { section: '수주견적관리', name: '원가납기 예측관리',    route: '/quotation/forecast', desc: '설계·제작·구매·설치 데이터 반영 예상 원가와 납기 예측. 견적 담당자 경험 의존도 감소.' },
  { section: '수주견적관리', name: '견적데이터관리',       route: '/orders/quotes',      desc: '견적서, 견적 조건, 산출 근거, 승인 이력 체계적 관리. 완료 프로젝트와 비교하여 정확도 지속 개선.' },
  { section: '수주견적관리', name: '제품별 견적자동화 AI', route: '/quotation/ai-auto',  desc: '과거 프로젝트·BOM·공수·자재비 기반 견적 자동 산출. XGBoost·RF 모델 원가·납기·리스크 예측.' },

  // 구매조달관리
  { section: '구매조달관리', name: '발주관리',          route: '/procurement/orders',       desc: 'BOM 기반 발주 대상 자재 확인 및 발주 진행 상태 관리. 장기납기 품목 우선 관리.' },
  { section: '구매조달관리', name: '자재이력조회',      route: '/bom/materials',            desc: '자재코드·LOT·공급사·입고일·사용 프로젝트 이력 조회. FAT 및 설치 문제 발생 시 자재 원인 추적.' },
  { section: '구매조달관리', name: '납기리스크분석',    route: '/procurement/risk',         desc: '공급사별 리드타임·지연이력·발주잔량 분석으로 납기 위험 예측. 프로젝트 일정 지연 사전 경고.' },
  { section: '구매조달관리', name: '대체품 추천',       route: '/procurement/alternatives', desc: '공급 지연·단종 자재 발생 시 대체 가능 품목 추천. BOM·규격·과거 적용 사례 기준 검토.' },
  { section: '구매조달관리', name: '구매조달 AI Agent', route: '/procurement/ai-agent',     desc: '자재발주·공급사·리드타임·납기지연 이력 기반 조달 의사결정 지원. 자연어 질의 조회.' },

  // FAT관리
  { section: 'FAT관리', name: 'FAT 시험결과관리', route: '/fat/results',    desc: '시험항목·PASS/FAIL·수정횟수·시험일자·담당자 이력 관리. 프로젝트별 FAT 품질 수준 분석.' },
  { section: 'FAT관리', name: '반복 Fail 분석',   route: '/fat/fail',       desc: '반복적으로 발생하는 실패 항목과 주요 원인 자동 분류. 출하 전 품질 안정성 확보.' },
  { section: 'FAT관리', name: 'PLC/알람로그분석', route: '/fat/plc',        desc: 'FAT 중 발생한 I/O 오류·인터록 이력 분석. PLC 알람 패턴 기반 원인 파악.' },
  { section: 'FAT관리', name: '사전점검 추천',    route: '/fat/pre-check',  desc: '과거 FAT 실패 패턴 기반 프로젝트별 사전 점검 리스트 제안. FAT 리드타임 단축 지원.' },
  { section: 'FAT관리', name: 'FAT AI Agent',     route: '/fat/ai-agent',   desc: 'FAT 시험결과·알람로그·수정이력·조립품질 기반 시운전 이슈 분석. 반복 FAIL 항목 자연어 추천.' },

  // 공정관리
  { section: '공정관리', name: '공정실적관리',         route: '/production/results',        desc: '제관·가공·조립·전장 공정 작업 실적과 공수 데이터 관리. 프로젝트별 생산 진척·병목 확인.' },
  { section: '공정관리', name: '공정 데이터 모니터링', route: '/production/process-status', desc: 'CNC·용접 등 설비 데이터 수집·조회. 공정별 가동상태·작업시간 모니터링.' },
  { section: '공정관리', name: '작업조건관리',         route: '/process/conditions',        desc: '절단속도·용접전류 등 주요 작업조건 관리. 공정별 최적 조건 표준화.' },
  { section: '공정관리', name: '공정이력조회',         route: '/production/process',        desc: '프로젝트·부품·작업자·설비 기준 공정 이력 조회. 이력 기반 품질 추적.' },
  { section: '공정관리', name: '공정데이터분석',       route: '/process/analysis',          desc: '공정별 리드타임·재작업률·품질 편차 분석. 생산성 개선과 품질 안정화 개선점 도출.' },

  // AI Agent 통합관리
  { section: 'AI Agent 통합관리', name: '통합 AI 질의',   route: '/ai-mgmt/chat',     desc: '자연어로 생산·품질·출하 등 전 공정 정보 조회. 복잡한 데이터도 쉽게 접근 가능.' },
  { section: 'AI Agent 통합관리', name: '생산/품질 분석', route: '/ai-mgmt/analysis', desc: 'AI가 데이터를 자동 분석하여 문제점 및 개선 방향 제시. 관리자 의사결정 지원.' },
  { section: 'AI Agent 통합관리', name: '의사결정 지원',  route: '/ai-mgmt/decision', desc: '공정 및 품질 관련 의사결정을 위한 추천 정보 제공. AI 기반 판단 지원.' },
  { section: 'AI Agent 통합관리', name: '알림 및 추천',   route: '/ai-mgmt/alerts',   desc: '이상 발생 시 알림 및 개선 조건 추천 제공. 실시간 대응 체계 구축.' },
  { section: 'AI Agent 통합관리', name: '사용자 질문이력', route: '/ai-mgmt/history', desc: '사용자 질의 내용 저장하여 반복 학습 및 개선 활용. AI 성능 지속 향상.' },

  // KPI관리
  { section: 'KPI관리', name: '생산성 KPI 조회', route: '/kpi/productivity', desc: '생산량·설비가동률·공정 리드타임 등 생산성 지표 조회.' },
  { section: 'KPI관리', name: '품질 KPI 조회',   route: '/kpi/quality',      desc: '불량률·공정별 불량 유형·출하 품질 합격률·클레임 발생률 산출 제공.' },
  { section: 'KPI관리', name: 'KPI 관리',        route: '/kpi/management',   desc: 'KPI 목표값 설정·기준 변경·공정별 KPI 관리. 달성률 분석 및 AI 기반 개선 인사이트 연계.' },

  // 데이터관리
  { section: '데이터관리', name: '데이터통합관리',    route: '/data/integration',  desc: 'MES·IoT·공정 데이터 통합하여 단일 데이터 저장소 구축. 데이터 정합성 확보.' },
  { section: '데이터관리', name: '데이터조회',        route: '/data/query',        desc: 'LOT 기준으로 데이터 조회·분석. 공정–품질–출하 데이터 연계 분석 지원.' },
  { section: '데이터관리', name: '데이터시각화',      route: '/data/visualization', desc: '다양한 그래프·대시보드를 통해 데이터 트렌드 시각화. 의사결정에 필요한 인사이트 제공.' },
  { section: '데이터관리', name: '데이터 다운로드',   route: '/data/download',     desc: '분석 데이터를 엑셀 등으로 다운로드. 외부 보고 및 활용 지원.' },
  { section: '데이터관리', name: 'AI학습 데이터관리', route: '/data/ai-training',  desc: 'ML 모델 학습용 데이터셋 관리·업데이트. 데이터 품질 향상을 통한 AI 성능 개선.' },

  // 기준정보관리
  { section: '기준정보관리', name: '품질기준 관리',  route: '/master/quality',    desc: '제품별 품질 기준 및 검사 기준 관리. 품질 판정 기준 데이터로 활용.' },
  { section: '기준정보관리', name: '작업표준 관리',  route: '/master/standards',  desc: '공정별 작업 절차 및 조건 표준화. 작업자 간 편차 최소화.' },
  { section: '기준정보관리', name: '코드 관리',      route: '/master/codes',      desc: '품목·공정·설비 코드 등 기준 정보 관리. 데이터 정합성 확보.' },

  // 사용자/시스템관리
  { section: '사용자/시스템관리', name: '사용자 관리', route: '/admin/users',         desc: '사용자 권한 및 계정 관리. 역할 기반 접근 제어(RBAC)로 시스템 보안 강화.' },
  { section: '사용자/시스템관리', name: '로그 관리',   route: '/admin/logs',          desc: '시스템 사용 이력 및 작업 로그 기록. 문제 발생 시 원인 추적 가능.' },
  { section: '사용자/시스템관리', name: '알림 설정',   route: '/admin/notifications', desc: '알림 기준 및 수신 대상 설정. 사용자 맞춤 알림 제공.' },
  { section: '사용자/시스템관리', name: '시스템 설정', route: '/admin/settings',      desc: '시스템 환경 설정 및 인터페이스 관리. 운영 최적화 지원.' },
];

// ── 색상 팔레트 ───────────────────────────────────────────────────────────────
const COLORS = {
  navy:   '1E3A5F',
  blue:   '2563EB',
  white:  'FFFFFF',
  gray:   'F1F5F9',
  dgray:  '64748B',
  border: 'CBD5E1',
  accent: '3B82F6',
};

const SECTION_COLORS = {
  'AI 대시보드':         '1E3A5F',
  '수주견적관리':        '1D4ED8',
  '구매조달관리':        '0369A1',
  'FAT관리':             '065F46',
  '공정관리':            '7C3AED',
  'AI Agent 통합관리':   'B45309',
  'KPI관리':             'BE185D',
  '데이터관리':          '0F766E',
  '기준정보관리':        '4338CA',
  '사용자/시스템관리':   '374151',
};

// ── 유틸 ─────────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function screenshotPath(index, name) {
  const safe = name.replace(/[/\\?%*:|"<>]/g, '_');
  return path.join(SCREENSHOT_DIR, `${String(index).padStart(3, '0')}_${safe}.png`);
}

function imgToBase64(filePath) {
  const buf = fs.readFileSync(filePath);
  return buf.toString('base64');
}

// ── STEP 1: 스크린샷 캡처 ────────────────────────────────────────────────────
async function captureScreenshots() {
  console.log('\n📸 스크린샷 캡처 시작...');
  ensureDir(SCREENSHOT_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  const results = [];

  for (let i = 0; i < SCREENS.length; i++) {
    const screen = SCREENS[i];
    const url = `${BASE_URL}${screen.route}`;
    const imgPath = screenshotPath(i + 1, screen.name);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(800); // 애니메이션 대기
      await page.screenshot({ path: imgPath, fullPage: false });
      console.log(`  ✅ [${i + 1}/${SCREENS.length}] ${screen.name}`);
      results.push({ ...screen, imgPath, success: true });
    } catch (err) {
      console.log(`  ⚠️  [${i + 1}/${SCREENS.length}] ${screen.name} - ${err.message.slice(0, 60)}`);
      results.push({ ...screen, imgPath: null, success: false });
    }
  }

  await browser.close();
  console.log(`\n✅ 캡처 완료: ${results.filter(r => r.success).length}/${SCREENS.length}개`);
  return results;
}

// ── STEP 2: PPT 생성 ──────────────────────────────────────────────────────────
async function createPPT(screenResults) {
  console.log('\n📊 PowerPoint 생성 중...');

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 16:9

  // 슬라이드 마스터 정의
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: COLORS.white },
    objects: [
      // 하단 풋터 라인
      { line: { x: 0, y: '94%', w: '100%', h: 0, line: { color: COLORS.border, width: 1 } } },
      { text: { text: '㈜ 아코스 · Akos AI MES 화면정의서 · Confidential', options: { x: 0.3, y: '95.5%', w: '70%', fontSize: 8, color: COLORS.dgray } } },
      { text: { text: `생성일: ${new Date().toLocaleDateString('ko-KR')}`, options: { x: '75%', y: '95.5%', w: '24%', fontSize: 8, color: COLORS.dgray, align: 'right' } } },
    ],
  });

  // ── 표지 슬라이드 ──────────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.navy };

    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: COLORS.navy } });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: '60%', w: '100%', h: '5%', fill: { color: COLORS.blue } });

    slide.addText('Akos AI MES', {
      x: 0.5, y: 1.5, w: '90%', h: 1.2,
      fontSize: 44, bold: true, color: COLORS.white, align: 'center',
    });
    slide.addText('화면정의서', {
      x: 0.5, y: 2.8, w: '90%', h: 0.8,
      fontSize: 32, color: 'A5B4FC', align: 'center',
    });
    slide.addText('AI 특화 스마트공장 제조실행시스템', {
      x: 0.5, y: 3.8, w: '90%', h: 0.6,
      fontSize: 18, color: 'CBD5E1', align: 'center',
    });
    slide.addShape(pptx.ShapeType.rect, { x: '35%', y: 4.6, w: '30%', h: 0.04, fill: { color: COLORS.blue } });
    slide.addText(`총 ${SCREENS.length}개 화면 · 사업계획서 p39-42 기능구조도 기준`, {
      x: 0.5, y: 4.9, w: '90%', h: 0.5,
      fontSize: 13, color: '94A3B8', align: 'center',
    });
    slide.addText('주식회사 아코스', {
      x: 0.5, y: 5.8, w: '90%', h: 0.4,
      fontSize: 14, color: '64748B', align: 'center',
    });
    slide.addText(new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }), {
      x: 0.5, y: 6.2, w: '90%', h: 0.35,
      fontSize: 12, color: '475569', align: 'center',
    });
  }

  // ── 목차 슬라이드 ──────────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.7, fill: { color: COLORS.navy } });
    slide.addText('목  차', { x: 0.4, y: 0.12, w: '90%', h: 0.46, fontSize: 22, bold: true, color: COLORS.white });

    const sections = [...new Set(SCREENS.map(s => s.section))];
    const cols = 2;
    const colW = 5.8;

    sections.forEach((sec, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 0.4 + col * (colW + 0.3);
      const y = 0.95 + row * 0.72;
      const count = SCREENS.filter(s => s.section === sec).length;
      const color = SECTION_COLORS[sec] || COLORS.navy;

      slide.addShape(pptx.ShapeType.rect, { x, y, w: colW, h: 0.58, fill: { color }, line: { color, width: 0 }, rounding: 0.05 });
      slide.addText(`${sec}  (${count}화면)`, {
        x: x + 0.15, y: y + 0.08, w: colW - 0.3, h: 0.42,
        fontSize: 13, bold: true, color: COLORS.white,
      });
    });

    slide.addText(`* 사업계획서 p39-42 기능구조도 기준  |  총 ${SCREENS.length}개 화면`, {
      x: 0.4, y: 6.6, w: '90%', h: 0.3, fontSize: 9, color: COLORS.dgray,
    });
  }

  // ── 섹션 구분자 + 화면 슬라이드 ───────────────────────────────────────────
  let currentSection = '';
  let slideNo = 1;

  for (const screen of screenResults) {
    // 새 섹션 시작 시 섹션 구분 슬라이드
    if (screen.section !== currentSection) {
      currentSection = screen.section;
      const sColor = SECTION_COLORS[currentSection] || COLORS.navy;
      const sScreens = SCREENS.filter(s => s.section === currentSection);

      const divSlide = pptx.addSlide();
      divSlide.background = { color: sColor };

      divSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '8%', h: '100%', fill: { color: 'FFFFFF', transparency: 90 } });
      divSlide.addText(currentSection, {
        x: 0.8, y: 2.4, w: '88%', h: 1.2,
        fontSize: 36, bold: true, color: COLORS.white, align: 'left',
      });
      divSlide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 3.65, w: 2, h: 0.05, fill: { color: COLORS.white } });
      divSlide.addText(`${sScreens.length}개 화면`, {
        x: 0.8, y: 3.85, w: '80%', h: 0.5,
        fontSize: 18, color: 'E2E8F0', align: 'left',
      });

      // 화면 목록
      sScreens.forEach((s, idx) => {
        divSlide.addText(`${idx + 1}.  ${s.name}`, {
          x: 0.8, y: 4.5 + idx * 0.35, w: '88%', h: 0.32,
          fontSize: 12, color: 'CBD5E1',
        });
      });
    }

    // 화면 정의 슬라이드
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    const sColor = SECTION_COLORS[screen.section] || COLORS.navy;

    // 상단 헤더
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.62, fill: { color: sColor } });
    slide.addText(screen.section, {
      x: 0.3, y: 0.05, w: 3, h: 0.28,
      fontSize: 9, color: 'A5B4FC', bold: false,
    });
    slide.addText(screen.name, {
      x: 0.3, y: 0.28, w: 8, h: 0.3,
      fontSize: 16, bold: true, color: COLORS.white,
    });
    slide.addText(`${String(slideNo).padStart(2, '0')} / ${String(SCREENS.length).padStart(2, '0')}`, {
      x: '85%', y: 0.18, w: '13%', h: 0.3,
      fontSize: 11, color: 'A5B4FC', align: 'right',
    });
    slideNo++;

    // 좌측: 스크린샷
    if (screen.success && screen.imgPath && fs.existsSync(screen.imgPath)) {
      slide.addImage({
        path: screen.imgPath,
        x: 0.2, y: 0.75, w: 7.8, h: 4.9,
      });
      // 이미지 테두리
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.2, y: 0.75, w: 7.8, h: 4.9,
        fill: { type: 'none' },
        line: { color: COLORS.border, width: 1 },
      });
    } else {
      slide.addShape(pptx.ShapeType.rect, { x: 0.2, y: 0.75, w: 7.8, h: 4.9, fill: { color: 'F8FAFC' }, line: { color: COLORS.border, width: 1 } });
      slide.addText('[ 스크린샷 캡처 실패 ]', {
        x: 0.2, y: 2.8, w: 7.8, h: 0.8,
        fontSize: 14, color: COLORS.dgray, align: 'center',
      });
      slide.addText(screen.route, { x: 0.2, y: 3.6, w: 7.8, h: 0.4, fontSize: 11, color: COLORS.dgray, align: 'center' });
    }

    // 우측 하단: 화면 설명 패널
    slide.addShape(pptx.ShapeType.rect, { x: 8.1, y: 0.75, w: 4.7, h: 4.9, fill: { color: COLORS.gray }, line: { color: COLORS.border, width: 1 } });

    slide.addText('화면 설명', { x: 8.25, y: 0.85, w: 4.3, h: 0.3, fontSize: 10, bold: true, color: sColor });
    slide.addShape(pptx.ShapeType.rect, { x: 8.25, y: 1.18, w: 4.3, h: 0.03, fill: { color: sColor } });
    slide.addText(screen.desc, {
      x: 8.25, y: 1.28, w: 4.3, h: 1.6,
      fontSize: 10, color: '334155', valign: 'top',
      wrap: true,
    });

    slide.addText('URL 경로', { x: 8.25, y: 3.0, w: 4.3, h: 0.28, fontSize: 10, bold: true, color: sColor });
    slide.addShape(pptx.ShapeType.rect, { x: 8.25, y: 3.3, w: 4.3, h: 0.35, fill: { color: COLORS.white }, line: { color: COLORS.border, width: 1 } });
    slide.addText(screen.route, { x: 8.35, y: 3.33, w: 4.1, h: 0.3, fontSize: 9.5, color: COLORS.blue, bold: true });

    slide.addText('메뉴 경로', { x: 8.25, y: 3.8, w: 4.3, h: 0.28, fontSize: 10, bold: true, color: sColor });
    slide.addText(`${screen.section} > ${screen.name}`, {
      x: 8.25, y: 4.12, w: 4.3, h: 0.4,
      fontSize: 9.5, color: '475569',
    });

    slide.addText('참조 문서', { x: 8.25, y: 4.6, w: 4.3, h: 0.28, fontSize: 10, bold: true, color: sColor });
    slide.addText('사업계획서 p39-42 기능구조도', { x: 8.25, y: 4.9, w: 4.3, h: 0.3, fontSize: 9, color: COLORS.dgray });
  }

  // ── 저장 ──────────────────────────────────────────────────────────────────
  await pptx.writeFile({ fileName: OUTPUT_FILE });
  console.log(`\n✅ PPT 저장 완료: ${OUTPUT_FILE}`);
  console.log(`   총 슬라이드: ${2 + Object.keys(SECTION_COLORS).length + SCREENS.length}장`);
}

// ── 메인 ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('=================================================');
  console.log('  Akos AI MES 화면정의서 생성 스크립트');
  console.log('=================================================');

  const results = await captureScreenshots();
  await createPPT(results);

  console.log('\n🎉 완료! 파일을 확인하세요:');
  console.log(`   ${OUTPUT_FILE}`);
  console.log(`   스크린샷: ${SCREENSHOT_DIR}`);
})();
