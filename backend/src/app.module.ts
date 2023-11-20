import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { JudgeModule } from 'src/modules/judge.module';
import { SingerModule } from './modules/singer.module';
import { ScoreModule } from './modules/score.module';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';
import { EventsModule } from './modules/events.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    EventsModule,
    JudgeModule,
    SingerModule,
    ScoreModule,
    MongooseModule.forRoot('mongodb://localhost:27017/css'),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
      db: 15,
      ttl: 60 * 60 * 6, // 默认过期时间：21600 = 6 * 60 * 60
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
