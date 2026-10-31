export interface TreatmentPromptContext {
  diagnosisJson: any;
  cropName: string;
  growthStage: string;
  location: string;
  season?: string | null;
  recentWeather?: string | null;
  irrigationMethod?: string | null;
  preferOrganic: boolean;
  previousTreatments?: string | null;
  language: string;
}

export function buildTreatmentPrompt(ctx: TreatmentPromptContext): string {
  const safeTreatments = (ctx.previousTreatments || '').replace(/<\/?user_notes>/g, '');

  return `TASK: Create a prioritized, responsible treatment and prevention plan.

INPUT DIAGNOSIS (validated JSON): ${JSON.stringify(ctx.diagnosisJson)}
CONTEXT: crop=${ctx.cropName}, stage=${ctx.growthStage}, location=${ctx.location}, season=${ctx.season ?? 'unknown'},
weather=${ctx.recentWeather ?? 'normal'}, irrigation=${ctx.irrigationMethod ?? 'unknown'}, preferOrganic=${ctx.preferOrganic},
previous treatments: <user_notes>${safeTreatments}</user_notes>
Language: ${ctx.language}

INSTRUCTIONS
1. Group actions into: immediate (0-48h), shortTerm (3-14 days), seasonLong, prevention.
2. Each action: title, detail (simple steps), type (cultural|mechanical|biological|organic|chemical),
   priority (1 = highest), and a safetyNote when type is chemical.
3. Put organic/cultural actions before chemical ones. Include chemical only if severity is medium or higher
   or spread risk is high, and only as "if the above fail or severity escalates".
4. Add monitoring schedule: when to re-scan and what to watch for.
5. Add an escalation rule: signs that mean "contact an extension officer now".
6. Add a weather-sensitive tip if recentWeather is relevant.
7. Estimate potential yield risk (low|medium|high) if untreated, with a short reason.`;
}
