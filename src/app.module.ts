import { Module } from '@nestjs/common';
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrometheusModule.register()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
