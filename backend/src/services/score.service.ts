import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { ScoreDocument } from 'src/schemas/score.schema';

@Injectable()
export class ScoreService {
  constructor(@InjectModel('Score') private scoreModel: Model<ScoreDocument>) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  get() {
    return this.scoreModel.find({});
  }

  create(params) {
    return this.scoreModel.create(params);
  }

  findBySId(sid: ObjectId) {
    return this.scoreModel.find({ singerId: sid });
  }

  findBySIdAndJId(sid: ObjectId, jid: ObjectId) {
    return this.scoreModel.find({ singerId: sid, judgeId: jid });
  }
}
