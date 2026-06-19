import type {
  CommentaryRequest,
  CommentaryResponse,
  MatchSummaryRequest,
  MatchSummaryResponse,
  StrategyTipRequest,
  StrategyTipResponse,
} from '@aura-grid/shared';
import { AI_FALLBACK_PHRASES } from '@aura-grid/shared';
import { apiRequest } from '../../lib/apiClient.js';

const localFallback = (): CommentaryResponse => ({
  commentary: AI_FALLBACK_PHRASES[Math.floor(Math.random() * AI_FALLBACK_PHRASES.length)]!,
  cached: false,
});

/** Commentary never throws — if the backend/AI is offline, use a local fallback line. */
export const requestCommentary = async (
  body: CommentaryRequest,
): Promise<CommentaryResponse> => {
  try {
    return await apiRequest<CommentaryResponse>('/ai/commentary', {
      method: 'POST',
      auth: true,
      body,
    });
  } catch {
    return localFallback();
  }
};

export const requestMatchSummary = (
  body: MatchSummaryRequest,
): Promise<MatchSummaryResponse> =>
  apiRequest<MatchSummaryResponse>('/ai/match-summary', { method: 'POST', auth: true, body });

export const requestStrategyTip = (body: StrategyTipRequest): Promise<StrategyTipResponse> =>
  apiRequest<StrategyTipResponse>('/ai/strategy-tip', { method: 'POST', auth: true, body });
