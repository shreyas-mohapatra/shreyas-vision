export interface DiagnosisPromptContext {
  cropName: string;
  growthStage: string;
  daysSincePlanting?: number | null;
  location: string;
  season?: string | null;
  recentWeather?: string | null;
  soilType?: string | null;
  irrigationMethod?: string | null;
  affectedAreaPercent?: number | null;
  previousTreatments?: string | null;
  symptomNotes?: string | null;
  language: string;
  imageCount: number;
}

export function buildDiagnosisPrompt(ctx: DiagnosisPromptContext): string {
  const safeSymptomNotes = (ctx.symptomNotes || '').replace(/<\/?user_notes>/g, '');
  const safeTreatments = (ctx.previousTreatments || '').replace(/<\/?user_notes>/g, '');

  return `TASK: Analyze the attached crop image(s) and produce a structured visual diagnosis.

CONTEXT
- Declared crop: ${ctx.cropName}
- Growth stage: ${ctx.growthStage}  | Days since planting: ${ctx.daysSincePlanting ?? 'unknown'}
- Location: ${ctx.location}  | Season: ${ctx.season ?? 'unknown'}  | Recent weather: ${ctx.recentWeather ?? 'normal'}
- Soil: ${ctx.soilType ?? 'unknown'}  | Irrigation: ${ctx.irrigationMethod ?? 'unknown'}
- Farmer-estimated affected area: ${ctx.affectedAreaPercent ?? 'unknown'}%
- Previous treatments: <user_notes>${safeTreatments}</user_notes>
- Symptom notes: <user_notes>${safeSymptomNotes}</user_notes>
- Output language for text fields: ${ctx.language}
- Images attached in order: image index 0..${ctx.imageCount - 1}

INSTRUCTIONS
1. Verify the declared crop matches the image. If it clearly does not, set crop.matchesDeclared=false and give the detected crop.
2. Assess image quality for each image (blur, lighting, framing, distance). Set usable=false if a reliable diagnosis is not possible, and give retake tips.
3. List every distinct finding (max 8), ordered by severity then confidence. Include "healthy" as a finding only if no problems are visible.
4. For each finding give bounding box and image index it appears in.
5. Provide an overall health score 0-100 (100 = perfectly healthy), overall severity, urgency, and whether the issue is likely to spread to neighboring plants.
6. Provide 1-3 differential diagnoses (look-alikes) with a one-line way to tell them apart.
7. Provide anomaly flags for anything unusual (uneven patch pattern, edge-only damage, new-leaf-only symptoms, etc.).`;
}
