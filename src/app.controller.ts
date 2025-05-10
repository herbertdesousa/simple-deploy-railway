import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import axios from 'axios';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(): string {
    console.log('hello called');
    return this.appService.getHello();
  }

  @Get('/send')
  async send() {
    const url = process.env.EXTERNAL_API;
    if (!url) throw new BadRequestException('url not provided');
    console.log(`Sending to ${url}`);
    await axios.get(url);
  }

  @Get('/fibonacci/:number')
  getFibonacci(@Param('number') number: string): number {
    const n = parseInt(number, 10);
    if (isNaN(n) || n < 0) {
      throw new BadRequestException('Invalid number provided');
    }

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
      throw new BadRequestException('Invalid size provided');
    }

    const buffer = new Array(mb * 1024 * 1024).fill('A');
    console.log(`Allocated ${mb} MB of memory`);
    return `Allocated ${mb} MB of memory for testing purposes`;
  }

  @Get('/health')
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
