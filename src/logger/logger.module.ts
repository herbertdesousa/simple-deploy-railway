import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.printf(
                ({ level, message, timestamp, context }) =>
                  // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
                  `${timestamp} [${context || 'Application'}] ${level}: ${message}`,
              ),
            ),
          }),
          new LokiTransport({
            host: process.env.LOKI_INTERNAL_URL || 'http://localhost:3100',
            labels: { app: 'simple-deploy-railway' },
            json: true,
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.printf(
                ({ level, message, timestamp, context }) =>
                  // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
                  `${timestamp} [${context || 'Application'}] ${level}: ${message}`,
              ),
            ),
            replaceTimestamp: true,
            onConnectionError: (err) => console.error(err),
          }),
        ],
      }),
    }),
  ],
})
export class LoggerModule {}
