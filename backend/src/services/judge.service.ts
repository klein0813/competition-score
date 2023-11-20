import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JudgeDocument } from 'src/schemas/judge.schema';

@Injectable()
export class JudgeService {
  constructor(@InjectModel('Judge') private judgeModel: Model<JudgeDocument>) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  get() {
    return this.judgeModel.find({});
  }

  findById(id: string) {
    return this.judgeModel.findById(id);
  }

  findByName(name) {
    console.log('findByName: ', name);
    return this.judgeModel.findOne({ name });
  }

  create(name: string) {
    return this.judgeModel.create({ name });
  }

  updateStatus(id: string, status: boolean) {
    return this.judgeModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
