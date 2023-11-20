// 应用程序的根模块
import { Module } from '@nestjs/common';
import { Score, ScoreSchema } from 'src/schemas/score.schema';
import { ScoreController } from 'src/controllers/score.controller';
import { ScoreService } from 'src/services/score.service';

// 如果想在另外的模块中使用这个模型，将MongooseModule添加到UserModule的exports部分并在其他模块中导入UserModule
// const UserMongooseModule = MongooseModule.forFeature([
//   // name «String|Function» model name or class extending Model
//   // [schema] «Schema» the schema to use
//   // [collection] «String» name (optional, inferred from model name)
//   { name: User.name, schema: UserSchema, collection: User.getCollectionName() },
// ]);
const ScoreMongooseModule = Score.getMongooseModule(Score.name, ScoreSchema);

@Module({
  imports: [ScoreMongooseModule],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreMongooseModule],
})
export class ScoreModule {}
