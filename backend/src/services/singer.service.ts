import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { EventsGateway } from 'src/gateway/events.gateway';
import { SingerDocument } from 'src/schemas/singer.schema';

@Injectable()
export class SingerService {
  constructor(
    @InjectModel('Singer') private singerModel: Model<SingerDocument>,
  ) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  findById(id) {
    return this.singerModel.findById(id);
  }

  get() {
    return this.singerModel.find({});
  }

  create(params) {
    return this.singerModel.create(params);
  }

  batchInsert(datas) {
    return this.singerModel.insertMany(datas);
  }
}
