import { AuditFinding, AuditLanguage } from '../types';

interface LlmFindingJson {
  id?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  title?: string;
  description?: string;
  line?: number;
  remediation?: string;
  cweId?: string;
}

const SYSTEM_PROMPT = `You are an elite application security auditor for autonomous AI agents.
Analyze the provided source code for deep business logic flaws, authentication bypasses, broken access control (BOLA/IDOR), cryptographic flaws, and race conditions.
Respond ONLY with a valid JSON array of findings adhering to this exact schema:
[
  {
    "id": "LLM-001",
    "severity": "critical" | "high" | "medium" | "low",
    "title": "Short descriptive title",
    "description": "Clear explanation of the vulnerability and impact",
    "line": 1,
    "remediation": "Clear actionable instructions to fix this issue",
    "cweId": "CWE-285"
  }
]
If no logic flaws are detected, return [].`;

/**
 * Calls Groq API (Blazing-fast Llama 3.3 70B / 8B in <300ms)
 */
async function callGroq(code: string, language?: string): Promise<AuditFinding[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return [];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Audit this ${language || 'code'} snippet:\n\`\`\`\n${code.slice(0, 4000)}\n\`\`\`` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(3500),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return [];

  const parsed = JSON.parse(content);
  const items: LlmFindingJson[] = Array.isArray(parsed) ? parsed : (parsed.findings || []);
  return formatFindings(items, 'Groq (Llama-3.3-70B)');
}

/**
 * Calls Google Gemini API (Gemini 1.5 Flash)
 */
async function callGemini(code: string, language?: string): Promise<AuditFinding[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  const prompt = `${SYSTEM_PROMPT}\n\nAudit this ${language || 'code'}:\n\`\`\`\n${code.slice(0, 4000)}\n\`\`\``;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(3500),
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return [];

  const parsed = JSON.parse(rawText);
  const items: LlmFindingJson[] = Array.isArray(parsed) ? parsed : (parsed.findings || []);
  return formatFindings(items, 'Gemini 1.5 Flash');
}

/**
 * Calls OpenAI API (GPT-4o-mini)
 */
async function callOpenAI(code: string, language?: string): Promise<AuditFinding[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Audit this ${language || 'code'}:\n\`\`\`\n${code.slice(0, 4000)}\n\`\`\`` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(3500),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return [];

  const parsed = JSON.parse(content);
  const items: LlmFindingJson[] = Array.isArray(parsed) ? parsed : (parsed.findings || []);
  return formatFindings(items, 'OpenAI GPT-4o-mini');
}

function formatFindings(items: LlmFindingJson[], provider: string): AuditFinding[] {
  return items.map((item, idx) => ({
    id: item.id || `LLM-${idx + 1}`,
    category: 'semantic-logic',
    severity: item.severity || 'high',
    title: item.title || 'Semantic Business Logic Vulnerability',
    description: `${item.description || 'Logic flaw detected.'} [Audited by ${provider}]`,
    line: typeof item.line === 'number' ? item.line : 1,
    lineEnd: typeof item.line === 'number' ? item.line : 1,
    remediation: item.remediation || 'Refactor logic to enforce strict authorization and input validation.',
    cweId: item.cweId || 'CWE-285',
    confidence: 'high',
  }));
}

/**
 * Multi-Provider Orchestrator with Instant Fallback Chain
 * Tries: Groq (Fastest) ➔ Gemini ➔ OpenAI ➔ Offline Graceful
 */
export async function runSemanticLlmReview(
  code: string,
  language?: AuditLanguage
): Promise<AuditFinding[]> {
  // 1. Try Groq (ultra fast <300ms)
  if (process.env.GROQ_API_KEY) {
    try {
      const findings = await callGroq(code, language);
      if (findings.length > 0) return findings;
    } catch {
      // Fall through to next provider
    }
  }

  // 2. Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const findings = await callGemini(code, language);
      if (findings.length > 0) return findings;
    } catch {
      // Fall through to next provider
    }
  }

  // 3. Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const findings = await callOpenAI(code, language);
      if (findings.length > 0) return findings;
    } catch {
      // Fall through
    }
  }

  return [];
}
