import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from './base.schema';

export type SingerDocument = Singer & Document;

@Schema()
export class Singer extends Base {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  class: string;

  @Prop({
    required: false,
  })
  number: number;

  @Prop({
    required: false,
  })
  song: string;

  @Prop({
    required: false,
  })
  accompany: string;

  static getCollectionName(): string {
    return 'singer';
  }
}

export const SingerSchema = SchemaFactory.createForClass(Singer);
