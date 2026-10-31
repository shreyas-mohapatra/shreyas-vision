import { generateStructured } from './gemini.js';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { buildTreatmentPrompt, TreatmentPromptContext } from '../prompts/treatment.js';
import {
  treatmentJsonSchema,
  treatmentSchema,
  TreatmentPlan,
} from '../schemas/ai/treatment.schema.js';

export async function runTreatmentPlan(
  context: TreatmentPromptContext,
  userId?: string
): Promise<TreatmentPlan> {
  const prompt = buildTreatmentPrompt(context);

  const result = await generateStructured<TreatmentPlan>({
    system: SYSTEM_PROMPT,
    prompt,
    schema: treatmentJsonSchema,
    zodSchema: treatmentSchema,
    temperature: 0.2,
    userId,
    endpoint: 'treatment',
  });

  return result;
}
