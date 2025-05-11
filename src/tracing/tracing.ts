import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { detectResources } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function initTracing() {
  console.log(`Initializing tracing with TEMPO_URL: ${process.env.TEMPO_URL}`);

  const exporter = new OTLPTraceExporter({
    url: process.env.TEMPO_URL || 'http://localhost:4318/v1/traces',
  });

  // Create resource with explicit attributes
  const resource = detectResources({
    detectors: [
      {
        detect: () => ({
          attributes: {
            [SemanticResourceAttributes.SERVICE_NAME]:
              process.env.SERVICE_NAME || 'simple-deploy-railway',
            [SemanticResourceAttributes.SERVICE_VERSION]:
              process.env.SERVICE_VERSION || '1.0.0',
            [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
              process.env.NODE_ENV || 'production',
          },
        }),
      },
    ],
  });

  // Use BatchSpanProcessor instead of SimpleSpanProcessor for better performance
  const sdk = new NodeSDK({
    serviceName: process.env.SERVICE_NAME || 'simple-deploy-railway',
    resource,
    spanProcessor: new BatchSpanProcessor(exporter, {
      maxQueueSize: 1000,
      scheduledDelayMillis: 5000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ignoreOutgoingRequestHook: (request) =>
            [/tempo/, /loki/].some((regex) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
              regex.test((request as any).path ?? ''),
            ),
        },
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
        '@opentelemetry/instrumentation-winston': { enabled: true },
      }),
    ],
  });

  sdk.start();

  const shutdownHandler = () => {
    console.log('Shutting down tracing...');
    sdk
      .shutdown()
      .then(() => {
        console.log('Tracing shutdown complete');
      })
      .catch((error) => {
        console.error('Error shutting down tracing', error);
      })
      .finally(() => process.exit(0));
  };

  process.on('SIGTERM', shutdownHandler);
  process.on('SIGINT', shutdownHandler);

  return sdk;
}
