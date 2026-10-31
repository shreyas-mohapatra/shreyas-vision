import { generateStructured } from './gemini.js';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { buildComparisonPrompt, ComparisonPromptContext } from '../prompts/comparison.js';
import {
  comparisonJsonSchema,
  comparisonSchema,
  ComparisonResult,
} from '../schemas/ai/comparison.schema.js';

export async function runScanComparison(
  prevImage: { mimeType: string; data: Buffer },
  currImage: { mimeType: string; data: Buffer },
  context: ComparisonPromptContext,
  userId?: string
): Promise<ComparisonResult> {
  const prompt = buildComparisonPrompt(context);

  const result = await generateStructured<ComparisonResult>({
    system: SYSTEM_PROMPT,
    prompt,
    images: [prevImage, currImage],
    schema: comparisonJsonSchema,
    zodSchema: comparisonSchema,
    temperature: 0.2,
    userId,
    endpoint: 'comparison',
  });

  return result;
}
