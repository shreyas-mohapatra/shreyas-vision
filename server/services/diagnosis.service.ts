import { generateStructured } from './gemini.js';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { buildDiagnosisPrompt, DiagnosisPromptContext } from '../prompts/diagnosis.js';
import {
  diagnosisJsonSchema,
  diagnosisSchema,
  DiagnosisResult,
} from '../schemas/ai/diagnosis.schema.js';

const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  none: 1,
};

export async function runDiagnosis(
  images: { mimeType: string; data: Buffer }[],
  context: DiagnosisPromptContext,
  userId?: string
): Promise<DiagnosisResult> {
  const prompt = buildDiagnosisPrompt(context);

  const result = await generateStructured<DiagnosisResult>({
    system: SYSTEM_PROMPT,
    prompt,
    images,
    schema: diagnosisJsonSchema,
    zodSchema: diagnosisSchema,
    temperature: 0.2,
    userId,
    endpoint: 'diagnosis',
  });

  // Sort findings by severity then confidence descending
  result.findings.sort((a, b) => {
    const sevA = SEVERITY_WEIGHTS[a.severity] || 0;
    const sevB = SEVERITY_WEIGHTS[b.severity] || 0;
    if (sevB !== sevA) {
      return sevB - sevA;
    }
    return b.confidence - a.confidence;
  });

  return result;
}
