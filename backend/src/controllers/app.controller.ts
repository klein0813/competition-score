import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import CacheUtil from 'src/utils/cache.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('open')
  open() {
    return CacheUtil.get('game:start');
  }

  @Get('close')
  close() {
    return CacheUtil.del('game:start');
  }
}
