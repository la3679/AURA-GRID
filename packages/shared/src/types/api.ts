export interface ApiMeta {
  requestId: string;
  cached?: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ServiceStatus = 'configured' | 'missing';

export interface HealthResponse {
  status: 'ok';
  app: string;
  env: string;
  timestamp: string;
  services: {
    firebase: ServiceStatus;
    gemini: ServiceStatus;
  };
}

export type AiTone = 'cinematic' | 'sarcastic' | 'coach' | 'villain';

export interface CommentaryResponse {
  commentary: string;
  cached: boolean;
}

export interface MatchSummaryResponse {
  summary: string;
  highlights: string[];
  improvementTips: string[];
  cached: boolean;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StrategyTipResponse {
  bestMoveExplanation: string;
  riskLevel: RiskLevel;
  recommendedMove?: Record<number, number>;
  cached: boolean;
}
