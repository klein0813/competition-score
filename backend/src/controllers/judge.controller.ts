import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { JudgeService } from '../services/judge.service';

@Controller('judge')
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

  @Get()
  get() {
    return this.judgeService.get();
  }

  @Get('find')
  findByName(@Query() query: any) {
    return this.judgeService.findByName(query.name);
  }

  @Get(':id')
  findById(@Param() params: any) {
    return this.judgeService.findById(params.id);
  }

  @Post()
  create(@Body() body: any) {
    return this.judgeService.create(body.name);
  }
}
