import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  private tracer = trace.getTracer('http-requests');

  intercept(
    executionContext: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = executionContext.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, path, ip, headers } = request;

    // Create a span for this request
    return this.tracer.startActiveSpan(`${method} ${path}`, (span) => {
      // Add attributes to the span
      span.setAttributes({
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        'http.method': method,
        'http.path': path,
        'http.client_ip': ip,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        'http.user_agent': headers['user-agent'] || 'unknown',
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      });

      return next.handle().pipe(
        tap({
          next: () => {
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
          },
          error: (error) => {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              message: error?.message,
            });
            span.recordException(error);
            span.end();
          },
        }),
      );
    });
  }
}
