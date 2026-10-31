import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { withTimeout } from '../utils/timeout.js';
import { pool } from '../db/pool.js';
import { z } from 'zod';

if (!env.GEMINI_API_KEY) {
  logger.warn('GEMINI_API_KEY is not set. Gemini API calls will fail.');
}

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
export const MODEL = env.GEMINI_MODEL || 'gemini-2.5-flash';

interface ImagePart {
  mimeType: string;
  data: Buffer;
}

interface GenerateStructuredOptions<T> {
  system: string;
  prompt: string;
  images?: ImagePart[];
  schema: object;
  zodSchema: z.ZodType<T>;
  temperature?: number;
  userId?: string;
  endpoint?: string;
}

/**
 * Logs AI model invocation to ai_usage_log for monitoring and audit.
 */
async function recordAiUsage(
  userId: string | undefined,
  endpoint: string,
  model: string,
  success: boolean,
  latencyMs: number
) {
  try {
    await pool.query(
      `INSERT INTO ai_usage_log (user_id, endpoint, model, success, latency_ms)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, endpoint, model, success, latencyMs]
    );
  } catch (err: any) {
    // Non-blocking log failure
    logger.warn('Failed to record AI usage log', { error: err.message });
  }
}

/**
 * Generic structured call with single automatic repair retry on schema failure.
 */
export async function generateStructured<T>(options: GenerateStructuredOptions<T>): Promise<T> {
  const {
    system,
    prompt,
    images = [],
    schema,
    zodSchema,
    temperature = 0.2,
    userId,
    endpoint = 'generateStructured',
  } = options;

  const startTime = Date.now();
  let callSuccess = false;

  const parts: any[] = [
    ...images.map((img) => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data.toString('base64'),
      },
    })),
    { text: prompt },
  ];

  const executeCall = async (repairPrompt?: string): Promise<T> => {
    const contents: any[] = [
      {
        role: 'user',
        parts: [...parts, ...(repairPrompt ? [{ text: repairPrompt }] : [])],
      },
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: system,
        temperature,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
      },
    });

    const raw = (response.text || '').replace(/```json|```/g, '').trim();
    if (!raw) {
      throw new Error('Empty response received from AI model');
    }

    const parsedJson = JSON.parse(raw);
    return zodSchema.parse(parsedJson);
  };

  try {
    const result = await withTimeout(
      (async () => {
        try {
          return await executeCall();
        } catch (firstErr: any) {
          logger.warn('AI first response failed schema validation. Attempting repair retry...', {
            error: firstErr.message,
          });
          try {
            return await executeCall(
              'Your previous output failed validation. Return ONLY valid JSON that exactly matches the required schema. No prose or extra markdown.'
            );
          } catch (secondErr: any) {
            logger.error('AI repair retry also failed validation', secondErr);
            throw new AppError(
              'The AI response could not be validated against the clinical agricultural schema.',
              502,
              'AI_BAD_RESPONSE',
              [secondErr.message]
            );
          }
        }
      })(),
      env.AI_TIMEOUT_MS,
      `Gemini Structured Analysis (${endpoint})`
    );

    callSuccess = true;
    return result;
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    // Map common Gemini API issues to friendly messages
    const msg = error?.message || '';
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      throw new AppError(
        'AI capacity limit temporarily reached. Please retry in a moment.',
        429,
        'AI_QUOTA_EXCEEDED'
      );
    }
    if (msg.includes('SAFETY') || msg.includes('blocked')) {
      throw new AppError(
        'The uploaded image or notes could not be processed due to safety evaluation.',
        422,
        'AI_SAFETY_BLOCKED'
      );
    }

    throw new AppError(
      'Computer vision diagnosis failed. Please check image quality and try again.',
      502,
      'AI_PROVIDER_ERROR',
      [msg]
    );
  } finally {
    const latency = Date.now() - startTime;
    recordAiUsage(userId, endpoint, MODEL, callSuccess, latency);
  }
}

/**
 * Text generation for follow-up chat.
 */
export async function generateText(options: {
  system: string;
  contents: any[];
  temperature?: number;
  userId?: string;
  endpoint?: string;
}): Promise<string> {
  const { system, contents, temperature = 0.4, userId, endpoint = 'chat' } = options;
  const startTime = Date.now();
  let callSuccess = false;

  try {
    const result = await withTimeout(
      ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: system,
          temperature,
          maxOutputTokens: 1024,
        },
      }),
      env.AI_TIMEOUT_MS,
      'Gemini Chat Response'
    );

    callSuccess = true;
    return (result.text || '').trim();
  } catch (err: any) {
    logger.error('Gemini text generation failed', err);
    throw new AppError(
      'Agronomy assistant could not generate a response. Please try again.',
      502,
      'AI_CHAT_ERROR',
      [err.message]
    );
  } finally {
    const latency = Date.now() - startTime;
    recordAiUsage(userId, endpoint, MODEL, callSuccess, latency);
  }
}
