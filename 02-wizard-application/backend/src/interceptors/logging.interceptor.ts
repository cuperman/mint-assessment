import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const url = request.url;
    const body = request.body as unknown;
    const params = request.params;
    const query = request.query;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    const requestId = Math.random().toString(36).substr(2, 9);
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`[${requestId}] Incoming Request: ${method} ${url}`, {
      requestId,
      method,
      url,
      params,
      query,
      body: this.sanitizeBody(body),
      userAgent,
      ip,
    });

    return next.handle().pipe(
      tap({
        next: (responseData: unknown) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.log(
            `[${requestId}] Outgoing Response: ${method} ${url} ${statusCode} - ${duration}ms`,
            {
              requestId,
              method,
              url,
              statusCode,
              duration,
              responseData: this.sanitizeResponse(responseData),
            },
          );
        },
        error: (error: {
          status?: number;
          message?: string;
          stack?: string;
        }) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status ?? 500;

          this.logger.error(
            `[${requestId}] Error Response: ${method} ${url} ${statusCode} - ${duration}ms`,
            {
              requestId,
              method,
              url,
              statusCode,
              duration,
              error: error.message ?? 'Unknown error',
              stack: error.stack,
            },
          );
        },
      }),
    );
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;

    // Remove sensitive fields if they exist
    const sensitiveFields = ['password', 'token', 'secret'];
    const sanitized = { ...(body as Record<string, unknown>) };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeResponse(responseData: unknown): unknown {
    if (!responseData) return responseData;

    // Limit response data size for logging
    const stringified = JSON.stringify(responseData);
    if (stringified.length > 1000) {
      return '[LARGE_RESPONSE_TRUNCATED]';
    }

    return responseData;
  }
}
