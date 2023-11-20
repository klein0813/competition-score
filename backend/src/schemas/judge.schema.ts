import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from './base.schema';

export type JudgeDocument = Judge & Document;

@Schema()
export class Judge extends Base {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
    default: false,
  })
  status: boolean;

  static getCollectionName(): string {
    return 'judge';
  }
}

export const JudgeSchema = SchemaFactory.createForClass(Judge);
