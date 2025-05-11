import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { initTracing } from './tracing/tracing';

async function bootstrap() {
  // Initialize tracing before application starts
  initTracing();

  const app = await NestFactory.create(AppModule);

  // Use Winston logger for the entire application
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
