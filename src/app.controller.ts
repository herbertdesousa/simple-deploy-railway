import { BadRequestException, Controller, Get } from '@nestjs/common';
import axios from 'axios';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/send')
  async send() {
    const url = process.env.EXTERNAL_API;
    if (!url) throw new BadRequestException('url not provided');
    console.log(`Sending to ${url}`);
    await axios.get(url);
  }
}
