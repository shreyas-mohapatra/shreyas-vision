export interface InsightPromptContext {
  aggregatedStatsJson: any;
  language: string;
}

export function buildInsightPrompt(ctx: InsightPromptContext): string {
  return `TASK: Write a short weekly crop-health insight for the farmer from the aggregated data below.
DATA: ${JSON.stringify(ctx.aggregatedStatsJson)}   Language: ${ctx.language}
Highlight: best-performing field, field needing most attention, one recurring issue with a prevention tip,
and 3 concrete actions for the coming week. Be encouraging, specific, and brief.`;
}
