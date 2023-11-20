import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  // WsResponse,
} from '@nestjs/websockets';
// import { Observable, from, map } from 'rxjs';
import { Server } from 'socket.io';
import { JudgeService } from '../services/judge.service';
import CacheUtil from 'src/utils/cache.util';
import { SingerService } from 'src/services/singer.service';
import { ScoreService } from 'src/services/score.service';
import mongoose from 'mongoose';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayDisconnect {
  constructor(
    private readonly judgeService: JudgeService,
    private readonly singerService: SingerService,
    private readonly scoreService: ScoreService,
  ) {}

  // 依赖注入是单例模式
  // private jid: string;
  private jidMap: object = {};

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: any) {
    const jid = this.jidMap[client.id];
    console.log('Client disconnected: ', jid);
    if (jid === 'home') {
      // CacheUtil.del('csId');
    } else {
      this.judgeService.updateStatus(jid, false).then((res) => {
        !res?.status && this.server.emit('judge_offline', { data: jid });
      });
    }
  }

  // 绑定当前用户 Id
  @SubscribeMessage('bind')
  async bind(
    @MessageBody() data: string,
    @ConnectedSocket() client: any,
  ): Promise<any> {
    const jid = data;
    this.jidMap[client.id] = data;
    // 主页
    if (data === 'home') {
      const judges = await this.judgeService.get();
      CacheUtil.get('csId').then((csId) => {
        if (csId) {
          this.singerService.findById(csId).then(async (singer) => {
            this.server.emit('singer_change', { data: singer });
          });
        }
      });
      return judges;
    }

    this.judgeService.updateStatus(jid, true).then((res) => {
      res.status && this.server.emit('judge_online', { data: res });
    });
    const csId = await CacheUtil.get('csId');
    if (csId) {
      const currentSinger = await this.singerService.findById(csId);
      return currentSinger;
    }

    return null;
  }

  // 评分
  @SubscribeMessage('score')
  async score(
    @MessageBody() data: number,
    @ConnectedSocket() client: any,
  ): Promise<any> {
    const jid = this.jidMap[client.id];
    const csId = await CacheUtil.get('csId');
    const res = await this.scoreService.create({
      judgeId: new mongoose.mongo.ObjectId(jid),
      singerId: new mongoose.mongo.ObjectId(csId),
      value: data,
    });
    this.server.emit('update_score', { data: res });
    return res;
  }

  // 获取当期用户，当前评委是否评分
  @SubscribeMessage('get_score')
  async getScore(@ConnectedSocket() client: any): Promise<any> {
    const jid = this.jidMap[client.id];
    const csId = await CacheUtil.get('csId');
    const res = await this.scoreService.findBySIdAndJId(
      new mongoose.mongo.ObjectId(csId),
      new mongoose.mongo.ObjectId(jid),
    );
    return res?.length > 0 ? res[0] : {};
  }
}
