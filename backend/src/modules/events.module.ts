import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from 'src/gateway/events.gateway';
import { JudgeModule } from 'src/modules/judge.module';
import { JudgeService } from 'src/services/judge.service';
import { SingerService } from 'src/services/singer.service';
import { SingerModule } from './singer.module';
import { ScoreModule } from './score.module';
import { ScoreService } from 'src/services/score.service';

@Module({
  exports: [EventsGateway],
  imports: [JudgeModule, ScoreModule, forwardRef(() => SingerModule)],
  providers: [EventsGateway, JudgeService, SingerService, ScoreService],
})
export class EventsModule {}
