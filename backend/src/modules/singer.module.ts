// 应用程序的根模块
import { Module } from '@nestjs/common';
import { Singer, SingerSchema } from 'src/schemas/singer.schema';
import { SingerController } from 'src/controllers/singer.controller';
import { SingerService } from 'src/services/singer.service';
import { EventsModule } from './events.module';
import { ScoreModule } from './score.module';
import { ScoreService } from 'src/services/score.service';

// 如果想在另外的模块中使用这个模型，将MongooseModule添加到UserModule的exports部分并在其他模块中导入UserModule
// const UserMongooseModule = MongooseModule.forFeature([
//   // name «String|Function» model name or class extending Model
//   // [schema] «Schema» the schema to use
//   // [collection] «String» name (optional, inferred from model name)
//   { name: User.name, schema: UserSchema, collection: User.getCollectionName() },
// ]);
const SingerMongooseModule = Singer.getMongooseModule(
  Singer.name,
  SingerSchema,
);

@Module({
  imports: [SingerMongooseModule, EventsModule, ScoreModule],
  controllers: [SingerController],
  providers: [SingerService, ScoreService],
  exports: [SingerMongooseModule],
})
export class SingerModule {}
