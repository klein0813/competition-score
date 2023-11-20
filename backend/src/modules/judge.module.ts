// 应用程序的根模块
import { Module } from '@nestjs/common';
import { Judge, JudgeSchema } from 'src/schemas/judge.schema';
import { JudgeController } from 'src/controllers/judge.controller';
import { JudgeService } from 'src/services/judge.service';

// 如果想在另外的模块中使用这个模型，将MongooseModule添加到UserModule的exports部分并在其他模块中导入UserModule
// const UserMongooseModule = MongooseModule.forFeature([
//   // name «String|Function» model name or class extending Model
//   // [schema] «Schema» the schema to use
//   // [collection] «String» name (optional, inferred from model name)
//   { name: User.name, schema: UserSchema, collection: User.getCollectionName() },
// ]);
const JudgeMongooseModule = Judge.getMongooseModule(Judge.name, JudgeSchema);

@Module({
  imports: [JudgeMongooseModule],
  controllers: [JudgeController],
  providers: [JudgeService],
  exports: [JudgeMongooseModule],
})
export class JudgeModule {}
