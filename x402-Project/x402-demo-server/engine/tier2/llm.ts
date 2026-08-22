import { AuditFinding, AuditLanguage } from '../types';

export async function runSemanticLlmReview(
  code: string,
  language?: AuditLanguage
): Promise<AuditFinding[]> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!geminiKey) {
    return [];
  }

  try {
    // If Gemini key is provided
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are a security code auditor. Analyze this ${language || 'code'} snippet for critical business logic flaws, broken authorization (BOLA/IDOR), or authentication bypasses.
Respond ONLY with a JSON array of findings adhering to this schema:
[
  {
    "id": "LLM-001",
    "category": "semantic-logic",
    "severity": "critical" | "high" | "medium" | "low",
    "title": "Short title",
    "description": "Clear explanation",
    "line": 1,
    "remediation": "How to fix",
    "cweId": "CWE-285",
    "confidence": "high"
  }
]
If no logic flaws, return [].

Code:
\`\`\`
${code.slice(0, 3000)}
\`\`\``;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(4500),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed)) {
            return parsed.map((item, idx) => ({
              id: item.id || `LLM-${idx + 1}`,
              category: 'semantic-logic',
              severity: item.severity || 'high',
              title: item.title || 'Semantic Business Logic Vulnerability',
              description: item.description || '',
              line: item.line || 1,
              lineEnd: item.line || 1,
              remediation: item.remediation || 'Review and refactor business logic.',
              cweId: item.cweId || 'CWE-285',
              confidence: 'medium',
            }));
          }
        }
      }
    }
  } catch {
    // Graceful fallback on LLM timeout or error
  }

  return [];
}
