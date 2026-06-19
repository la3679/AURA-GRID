import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
let client: any = null;

const getClient = async (): Promise<any | null> => {
  if (!env.gemini.configured) return null;
  if (client) return client;
  try {
    const mod = await import('@google/genai');
    const GoogleGenAI = (mod as any).GoogleGenAI;
    client = new GoogleGenAI({ apiKey: env.gemini.apiKey });
    return client;
  } catch (err) {
    logger.error('Gemini client init failed', { message: (err as Error).message });
    return null;
  }
};

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export interface GenerateOptions {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Generate text from Gemini with timeout + exponential backoff. Returns null on
 * failure so callers can fall back gracefully instead of crashing the request.
 */
export const generateText = async (
  prompt: string,
  options: GenerateOptions = {},
): Promise<string | null> => {
  const ai = await getClient();
  if (!ai) return null;

  const { timeoutMs = 8000, retries = 2 } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        ai.models.generateContent({ model: env.gemini.model, contents: prompt }),
        sleep(timeoutMs).then(() => {
          throw new Error('Gemini request timed out');
        }),
      ]);
      const text: string | undefined = (result as any)?.text;
      if (text && text.trim()) return text.trim();
      return null;
    } catch (err) {
      logger.warn('Gemini generation attempt failed', {
        attempt,
        message: (err as Error).message,
      });
      if (attempt < retries) await sleep(2 ** attempt * 250);
    }
  }
  return null;
};

export const isGeminiConfigured = (): boolean => env.gemini.configured;
/* eslint-enable @typescript-eslint/no-explicit-any */
