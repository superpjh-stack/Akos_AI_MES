'use client';

import { useState } from 'react';

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────
interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  timezone: string;
  language: string;
  dateFormat: string;
}

interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireMfa: boolean;
  allowedIpRanges: string;
}

interface AISettings {
  modelProvider: string;
  apiEndpoint: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  enableAutoAnalysis: boolean;
  analysisInterval: number;
}

interface DataRetentionSettings {
  logRetentionDays: number;
  backupRetentionDays: number;
  auditLogRetentionDays: number;
  autoDeleteEnabled: boolean;
  backupSchedule: string;
}

// ─────────────────────────────────────────────
// 섹션 탭 목록
// ─────────────────────────────────────────────
type SettingSection = 'general' | 'security' | 'ai' | 'data';

const SECTIONS: { id: SettingSection; label: string }[] = [
  { id: 'general', label: '일반' },
  { id: 'security', label: '보안' },
  { id: 'ai', label: 'AI 설정' },
  { id: 'data', label: '데이터 보존' },
];

// ─────────────────────────────────────────────
// 기본값
// ─────────────────────────────────────────────
const defaultGeneral: GeneralSettings = {
  siteName: 'Akos AI MES',
  siteDescription: 'AI 특화 스마트 공장 제조 실행 시스템',
  timezone: 'Asia/Seoul',
  language: 'ko',
  dateFormat: 'YYYY-MM-DD',
};

const defaultSecurity: SecuritySettings = {
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireMfa: false,
  allowedIpRanges: '',
};

const defaultAI: AISettings = {
  modelProvider: 'anthropic',
  apiEndpoint: 'https://api.anthropic.com',
  apiKey: '',
  maxTokens: 4096,
  temperature: 0.7,
  enableAutoAnalysis: true,
  analysisInterval: 60,
};

const defaultData: DataRetentionSettings = {
  logRetentionDays: 90,
  backupRetentionDays: 30,
  auditLogRetentionDays: 365,
  autoDeleteEnabled: false,
  backupSchedule: '0 2 * * *',
};

// ─────────────────────────────────────────────
// 공통 입력 컴포넌트
// ─────────────────────────────────────────────
function FieldRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 섹션별 폼 컴포넌트
// ─────────────────────────────────────────────
function GeneralForm({
  data,
  onChange,
}: {
  data: GeneralSettings;
  onChange: (d: GeneralSettings) => void;
}) {
  const set = (k: keyof GeneralSettings, v: string) => onChange({ ...data, [k]: v });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">일반 설정</h2>

      <FieldRow label="시스템 이름">
        <input
          type="text"
          className="input-base"
          value={data.siteName}
          onChange={(e) => set('siteName', e.target.value)}
        />
      </FieldRow>

      <FieldRow label="시스템 설명">
        <textarea
          className="input-base resize-none h-20"
          value={data.siteDescription}
          onChange={(e) => set('siteDescription', e.target.value)}
        />
      </FieldRow>

      <FieldRow label="타임존">
        <select
          className="input-base"
          value={data.timezone}
          onChange={(e) => set('timezone', e.target.value)}
        >
          <option value="Asia/Seoul">Asia/Seoul (KST, UTC+9)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York (EST)</option>
          <option value="Europe/London">Europe/London (GMT)</option>
        </select>
      </FieldRow>

      <FieldRow label="언어">
        <select
          className="input-base"
          value={data.language}
          onChange={(e) => set('language', e.target.value)}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
        </select>
      </FieldRow>

      <FieldRow label="날짜 형식" hint="예: YYYY-MM-DD → 2026-06-03">
        <select
          className="input-base"
          value={data.dateFormat}
          onChange={(e) => set('dateFormat', e.target.value)}
        >
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
        </select>
      </FieldRow>
    </div>
  );
}

function SecurityForm({
  data,
  onChange,
}: {
  data: SecuritySettings;
  onChange: (d: SecuritySettings) => void;
}) {
  const setNum = (k: keyof SecuritySettings, v: number) => onChange({ ...data, [k]: v });
  const setBool = (k: keyof SecuritySettings, v: boolean) => onChange({ ...data, [k]: v });
  const setStr = (k: keyof SecuritySettings, v: string) => onChange({ ...data, [k]: v });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">보안 설정</h2>

      <FieldRow label="세션 만료 시간 (분)" hint="비활성 상태 지속 시 자동 로그아웃">
        <input
          type="number"
          className="input-base"
          min={5}
          max={480}
          value={data.sessionTimeout}
          onChange={(e) => setNum('sessionTimeout', Number(e.target.value))}
        />
      </FieldRow>

      <FieldRow label="최대 로그인 시도 횟수" hint="초과 시 계정 잠금">
        <input
          type="number"
          className="input-base"
          min={1}
          max={10}
          value={data.maxLoginAttempts}
          onChange={(e) => setNum('maxLoginAttempts', Number(e.target.value))}
        />
      </FieldRow>

      <FieldRow label="비밀번호 최소 길이">
        <input
          type="number"
          className="input-base"
          min={6}
          max={32}
          value={data.passwordMinLength}
          onChange={(e) => setNum('passwordMinLength', Number(e.target.value))}
        />
      </FieldRow>

      <FieldRow label="다중 인증(MFA) 필수 적용">
        <div className="flex items-center gap-3">
          <input
            id="mfa-toggle"
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={data.requireMfa}
            onChange={(e) => setBool('requireMfa', e.target.checked)}
          />
          <label htmlFor="mfa-toggle" className="text-sm text-gray-700">
            모든 사용자에게 MFA 필수 요구
          </label>
        </div>
      </FieldRow>

      <FieldRow
        label="허용 IP 범위"
        hint="CIDR 형식으로 입력. 복수 개는 줄바꿈으로 구분. 비워두면 제한 없음."
      >
        <textarea
          className="input-base resize-none h-24 font-mono text-sm"
          placeholder="예: 192.168.1.0/24"
          value={data.allowedIpRanges}
          onChange={(e) => setStr('allowedIpRanges', e.target.value)}
        />
      </FieldRow>
    </div>
  );
}

function AIForm({
  data,
  onChange,
}: {
  data: AISettings;
  onChange: (d: AISettings) => void;
}) {
  const setStr = (k: keyof AISettings, v: string) => onChange({ ...data, [k]: v });
  const setNum = (k: keyof AISettings, v: number) => onChange({ ...data, [k]: v });
  const setBool = (k: keyof AISettings, v: boolean) => onChange({ ...data, [k]: v });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">AI 설정</h2>

      <FieldRow label="AI 모델 공급자">
        <select
          className="input-base"
          value={data.modelProvider}
          onChange={(e) => setStr('modelProvider', e.target.value)}
        >
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="openai">OpenAI (GPT)</option>
          <option value="azure">Azure OpenAI</option>
          <option value="local">로컬 모델 (Ollama)</option>
        </select>
      </FieldRow>

      <FieldRow label="API 엔드포인트">
        <input
          type="url"
          className="input-base font-mono text-sm"
          value={data.apiEndpoint}
          onChange={(e) => setStr('apiEndpoint', e.target.value)}
        />
      </FieldRow>

      <FieldRow label="API 키" hint="저장 시 암호화됩니다.">
        <input
          type="password"
          className="input-base font-mono text-sm"
          placeholder="sk-••••••••••••••••"
          value={data.apiKey}
          onChange={(e) => setStr('apiKey', e.target.value)}
        />
      </FieldRow>

      <FieldRow label="최대 토큰 수">
        <input
          type="number"
          className="input-base"
          min={256}
          max={32768}
          step={256}
          value={data.maxTokens}
          onChange={(e) => setNum('maxTokens', Number(e.target.value))}
        />
      </FieldRow>

      <FieldRow label={`Temperature: ${data.temperature}`} hint="0 = 결정론적, 1 = 창의적">
        <input
          type="range"
          className="w-full"
          min={0}
          max={1}
          step={0.1}
          value={data.temperature}
          onChange={(e) => setNum('temperature', Number(e.target.value))}
        />
      </FieldRow>

      <FieldRow label="자동 분석 활성화">
        <div className="flex items-center gap-3">
          <input
            id="auto-analysis"
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={data.enableAutoAnalysis}
            onChange={(e) => setBool('enableAutoAnalysis', e.target.checked)}
          />
          <label htmlFor="auto-analysis" className="text-sm text-gray-700">
            설비 데이터 자동 AI 분석 실행
          </label>
        </div>
      </FieldRow>

      {data.enableAutoAnalysis && (
        <FieldRow label="분석 주기 (초)">
          <input
            type="number"
            className="input-base"
            min={10}
            max={3600}
            value={data.analysisInterval}
            onChange={(e) => setNum('analysisInterval', Number(e.target.value))}
          />
        </FieldRow>
      )}
    </div>
  );
}

function DataRetentionForm({
  data,
  onChange,
}: {
  data: DataRetentionSettings;
  onChange: (d: DataRetentionSettings) => void;
}) {
  const setNum = (k: keyof DataRetentionSettings, v: number) => onChange({ ...data, [k]: v });
  const setBool = (k: keyof DataRetentionSettings, v: boolean) => onChange({ ...data, [k]: v });
  const setStr = (k: keyof DataRetentionSettings, v: string) => onChange({ ...data, [k]: v });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">데이터 보존 설정</h2>

      <FieldRow label="시스템 로그 보존 기간 (일)">
        <input
          type="number"
          className="input-base"
          min={7}
          max={3650}
          value={data.logRetentionDays}
          onChange={(e) => setNum('logRetentionDays', Number(e.target.value))}
        />
      </FieldRow>

      <FieldRow label="백업 보존 기간 (일)">
        <input
          type="number"
          className="input-base"
          min={1}
          max={365}
          value={data.backupRetentionDays}
          onChange={(e) => setNum('backupRetentionDays', Number(e.target.value))}
        />
      </FieldRow>

      <FieldRow label="감사 로그 보존 기간 (일)" hint="규정 준수를 위해 최소 1년 권장">
        <input
          type="number"
          className="input-base"
          min={30}
          max={3650}
          value={data.auditLogRetentionDays}
          onChange={(e) => setNum('auditLogRetentionDays', Number(e.target.value))}
        />
      </FieldRow>

      <FieldRow label="만료 데이터 자동 삭제">
        <div className="flex items-center gap-3">
          <input
            id="auto-delete"
            type="checkbox"
            className="h-4 w-4 text-red-500 border-gray-300 rounded"
            checked={data.autoDeleteEnabled}
            onChange={(e) => setBool('autoDeleteEnabled', e.target.checked)}
          />
          <label htmlFor="auto-delete" className="text-sm text-gray-700">
            보존 기간 초과 데이터 자동 삭제
          </label>
        </div>
        {data.autoDeleteEnabled && (
          <p className="mt-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded">
            주의: 삭제된 데이터는 복구할 수 없습니다.
          </p>
        )}
      </FieldRow>

      <FieldRow label="백업 스케줄 (Cron 표현식)" hint="예: 매일 새벽 2시 → 0 2 * * *">
        <input
          type="text"
          className="input-base font-mono text-sm"
          placeholder="0 2 * * *"
          value={data.backupSchedule}
          onChange={(e) => setStr('backupSchedule', e.target.value)}
        />
      </FieldRow>
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────────
export default function SystemSettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>('general');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneral);
  const [security, setSecurity] = useState<SecuritySettings>(defaultSecurity);
  const [ai, setAI] = useState<AISettings>(defaultAI);
  const [dataRetention, setDataRetention] = useState<DataRetentionSettings>(defaultData);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: API 연동 — 각 섹션 설정값을 서버에 저장
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
          <p className="text-sm text-gray-500 mt-1">
            Akos AI MES 시스템 전반 설정을 관리합니다.
          </p>
        </div>

        <div className="flex gap-6">
          <nav className="w-44 shrink-0">
            <ul className="space-y-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === s.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            {activeSection === 'general' && (
              <GeneralForm data={general} onChange={setGeneral} />
            )}
            {activeSection === 'security' && (
              <SecurityForm data={security} onChange={setSecurity} />
            )}
            {activeSection === 'ai' && (
              <AIForm data={ai} onChange={setAI} />
            )}
            {activeSection === 'data' && (
              <DataRetentionForm data={dataRetention} onChange={setDataRetention} />
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '저장 중...' : '설정 저장'}
              </button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">저장되었습니다.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input-base {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #111827;
          background-color: #fff;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
      `}</style>
    </div>
  );
}