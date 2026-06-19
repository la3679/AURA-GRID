export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request', details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super('AUTH_ERROR', message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', message, 404);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'Upstream service unavailable', details?: unknown) {
    super('EXTERNAL_SERVICE_ERROR', message, 503, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super('RATE_LIMIT', message, 429);
  }
}
