import {
  AI_FALLBACK_PHRASES,
  type CommentaryRequest,
  type CommentaryResponse,
  type MatchSummaryRequest,
  type MatchSummaryResponse,
  type RiskLevel,
  type StrategyTipRequest,
  type StrategyTipResponse,
  type OpponentPersonalityRequest,
} from '@aura-grid/shared';
import { env } from '../../config/env.js';
import { cache, hashKey } from '../cache/cacheService.js';
import { generateText } from './geminiClient.js';
import {
  commentaryPrompt,
  matchSummaryPrompt,
  opponentPersonalityPrompt,
  strategyTipPrompt,
} from './prompts.js';

const pickFallback = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i)) % AI_FALLBACK_PHRASES.length;
  return AI_FALLBACK_PHRASES[h]!;
};

/** Clamp commentary to a safe word count and strip wrapping quotes. */
const sanitizeLine = (text: string, maxWords: number): string =>
  text
    .replace(/^["'`]+|["'`]+$/g, '')
    .split(/\s+/)
    .slice(0, maxWords)
    .join(' ');

const tryParseJson = <T>(text: string): T | null => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as T) : null;
  } catch {
    return null;
  }
};

export const getCommentary = async (req: CommentaryRequest): Promise<CommentaryResponse> => {
  const key = hashKey('ai:commentary', req);
  const { value, cached } = await cache.wrap(key, env.cache.geminiTtlSeconds, async () => {
    const raw = await generateText(commentaryPrompt(req), { timeoutMs: 6000 });
    return raw ? sanitizeLine(raw, 20) : pickFallback(req.event);
  });
  return { commentary: value, cached };
};

export const getMatchSummary = async (
  req: MatchSummaryRequest,
): Promise<MatchSummaryResponse> => {
  const key = hashKey('ai:summary', req);
  const { value, cached } = await cache.wrap(key, env.cache.geminiTtlSeconds, async () => {
    const raw = await generateText(matchSummaryPrompt(req));
    const parsed = raw
      ? tryParseJson<{ summary: string; highlights: string[]; improvementTips: string[] }>(raw)
      : null;
    if (parsed?.summary) {
      return {
        summary: parsed.summary,
        highlights: parsed.highlights?.slice(0, 3) ?? [],
        improvementTips: parsed.improvementTips?.slice(0, 3) ?? [],
      };
    }
    const won = req.match.winner === 'PLAYER';
    return {
      summary: won
        ? `Grid secured in ${req.match.turns} turns with ${req.match.bumps} purges.`
        : `The grid slipped away after ${req.match.turns} turns. Recalibrate and re-engage.`,
      highlights: [`${req.match.bumps} bump(s) triggered`, `${req.match.lanesCompleted} lane(s) synced`],
      improvementTips: ['Prioritize lanes nearing completion.', 'Use bumps to stall the opponent.'],
    };
  });
  return { ...value, cached };
};

export const getStrategyTip = async (
  req: StrategyTipRequest,
): Promise<StrategyTipResponse> => {
  const key = hashKey('ai:tip', req);
  const { value, cached } = await cache.wrap(key, env.cache.geminiTtlSeconds, async () => {
    const raw = await generateText(strategyTipPrompt(req));
    const parsed = raw
      ? tryParseJson<{ bestMoveExplanation: string; riskLevel: RiskLevel }>(raw)
      : null;
    const risk: RiskLevel =
      parsed?.riskLevel && ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.riskLevel)
        ? parsed.riskLevel
        : 'MEDIUM';
    return {
      bestMoveExplanation:
        parsed?.bestMoveExplanation ??
        'Spread your roll toward lanes closest to completion while denying the opponent a clean bump.',
      riskLevel: risk,
    };
  });
  return { ...value, cached };
};

export const getOpponentPersonality = async (
  req: OpponentPersonalityRequest,
): Promise<{ personality: string; cached: boolean }> => {
  const key = hashKey('ai:persona', req);
  const { value, cached } = await cache.wrap(key, env.cache.geminiTtlSeconds, async () => {
    const raw = await generateText(opponentPersonalityPrompt(req));
    return raw
      ? sanitizeLine(raw, 30)
      : `${req.callsign} runs cold and deletes hope one lane at a time.`;
  });
  return { personality: value, cached };
};
