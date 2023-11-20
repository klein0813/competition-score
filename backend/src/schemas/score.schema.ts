import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from './base.schema';
import { ObjectId } from 'mongodb';

export type ScoreDocument = Score & Document;

@Schema()
export class Score extends Base {
  @Prop({
    required: true,
  })
  judgeId: ObjectId;

  @Prop({
    required: true,
  })
  singerId: ObjectId;

  @Prop({
    required: true,
    min: 0,
    max: 100,
  })
  value: number;

  static getCollectionName(): string {
    return 'score';
  }
}

export const ScoreSchema = SchemaFactory.createForClass(Score);
