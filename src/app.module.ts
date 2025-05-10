import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ConfigModule.forRoot(), PrometheusModule.register(), LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
