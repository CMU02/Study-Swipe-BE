import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionsModule } from './questions/questions.modue';
import { TagsModule } from './tags/tags.module';

@Module({
  // Import 해올 Modules
  imports: [
      QuestionsModule,
      TagsModule,
      
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
