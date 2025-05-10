import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  LoggerService,
  Param,
} from '@nestjs/common';
import axios from 'axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Get('/hello')
  getHello(): string {
    this.logger.log('hello endpoint called', 'AppController');
    this.logger.warn('hello endpoint called', 'AppController');
    return this.appService.getHello();
  }

  @Get('/send')
  async send() {
    const url = process.env.EXTERNAL_API;
    if (!url) throw new BadRequestException('url not provided');
    this.logger.log(`Sending request to ${url}`, 'AppController');
    await axios.get(url);
  }

  @Get('/fibonacci/:number')
  getFibonacci(@Param('number') number: string): number {
    const n = parseInt(number, 10);
    if (isNaN(n) || n < 0) {
      this.logger.error(
        `Invalid fibonacci number provided: ${number}`,
        'AppController',
      );
      throw new BadRequestException('Invalid number provided');
    }

    this.logger.log(`Calculating fibonacci for n=${n}`, 'AppController');
    const fibonacci = (num: number): number => {
      if (num <= 1) return num;
      return fibonacci(num - 1) + fibonacci(num - 2);
    };

    return fibonacci(n);
  }

  @Get('/memory-test/:size')
  memoryTest(@Param('size') size: string): string {
    const mb = parseInt(size, 10);
    if (isNaN(mb) || mb <= 0) {
      this.logger.error(
        `Invalid memory size provided: ${size}`,
        'AppController',
      );
      throw new BadRequestException('Invalid size provided');
    }

    const buffer = new Array(mb * 1024 * 1024).fill('A');
    this.logger.log(`Allocated ${mb} MB of memory`, 'AppController');
    return `Allocated ${mb} MB of memory for testing purposes`;
  }

  @Get('/health')
  healthCheck(): { status: string } {
    this.logger.log('Health check endpoint called', 'AppController');
    return { status: 'ok' };
  }
}
