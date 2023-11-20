import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SingerService } from '../services/singer.service';
import { EventsGateway } from 'src/gateway/events.gateway';
import CacheUtil from 'src/utils/cache.util';
import { ScoreService } from 'src/services/score.service';

@Controller('singer')
export class SingerController {
  constructor(
    private readonly singerService: SingerService,
    private readonly scoreService: ScoreService,
    private readonly ws: EventsGateway,
  ) {}

  @Get()
  async get() {
    const singers = (await this.singerService.get()) ?? [];
    if (singers.length < 0) {
      CacheUtil.del('csId');
      return { data: [] };
    }
    const scoresRes = {};
    for (const singer of singers) {
      const scores = await this.scoreService.findBySId(singer._id);
      const sid = singer._id.toString();
      let total = 0;
      const values = {};
      scores.forEach((item) => {
        total += item.value;
        values[item.judgeId.toString()] = item.value;
      });
      const scoreRes = {
        total,
        count: scores.length,
        avg: scores.length ? Number((total / scores.length).toFixed(2)) : 0,
        values,
      };
      scoresRes[sid] = scoreRes;
    }
    const currentSingerId = await CacheUtil.get('csId');
    if (!currentSingerId) {
      return { data: singers, scores: scoresRes };
    }
    let activeIndex = singers.findIndex(
      (item) => item._id.toString() === currentSingerId,
    );
    if (activeIndex < 0) {
      CacheUtil.set('csId', 0);
      this.ws.server.emit('singer_change', { data: singers[0] });
      activeIndex = 0;
    }

    return { data: singers, active: activeIndex, scores: scoresRes };
  }

  @Post('batch')
  batchInsert(@Body() body: any) {
    return this.singerService.batchInsert(body.data);
  }

  @Get(':id')
  find(@Param() params: any) {
    return this.singerService.findById(params.id);
  }

  @Post(':id')
  async changeSinger(@Param() params: any) {
    const singer = await this.singerService.findById(params.id);
    const sId = singer?._id;
    if (sId) {
      // 通知评委当前选手已切换
      // this.ws.server.send('singer_change', singer);
      CacheUtil.set('csId', sId);
      this.ws.server.emit('singer_change', { data: singer });
    }
    return sId;
  }

  @Post()
  create(@Body() body: any) {
    return this.singerService.create(body);
  }
}
