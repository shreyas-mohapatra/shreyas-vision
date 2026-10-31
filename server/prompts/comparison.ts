export interface ComparisonPromptContext {
  daysBetween: number;
  prevDate: string;
  currDate: string;
  prevDiagnosisJson: any;
  currDiagnosisJson: any;
  treatmentsBetween?: string | null;
  language: string;
}

export function buildComparisonPrompt(ctx: ComparisonPromptContext): string {
  const safeTreatments = (ctx.treatmentsBetween || '').replace(/<\/?user_notes>/g, '');

  return `TASK: Compare two scans of the SAME field taken ${ctx.daysBetween} days apart and report progression.

PREVIOUS (image A, taken ${ctx.prevDate}): diagnosis JSON ${JSON.stringify(ctx.prevDiagnosisJson)}
CURRENT  (image B, taken ${ctx.currDate}): diagnosis JSON ${JSON.stringify(ctx.currDiagnosisJson)}
Treatments applied in between (from user): <user_notes>${safeTreatments}</user_notes>
Language: ${ctx.language}

INSTRUCTIONS
1. Visually compare image A and image B. Note that framing/lighting may differ; do not over-interpret.
2. Decide status: improved | stable | worsening | new_issue_detected | insufficient_data.
3. For each issue present in either scan, report its trend: resolved | improving | unchanged | worsening | new.
4. Estimate healthScoreDelta (current minus previous) and affectedAreaTrend.
5. Raise anomaly alerts for unexpected patterns (rapid spread, symptoms on new growth, spread from edges, etc.).
6. Evaluate whether the previous recommended actions seem to be working, and recommend adjustments.
7. If images are not comparable, return insufficient_data and explain why.`;
}
