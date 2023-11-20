import { Body, Controller, Get, Post } from '@nestjs/common';
import { ScoreService } from '../services/score.service';
import mongoose from 'mongoose';

@Controller('score')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get()
  get() {
    return this.scoreService.get();
  }

  @Post()
  create(@Body() body: any) {
    const { singerId, score } = body;
    this.scoreService.create({
      judgeId: new mongoose.mongo.ObjectId(),
      singerId: new mongoose.mongo.ObjectId(singerId),
      value: score,
    });
  }
}
