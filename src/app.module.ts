import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionsModule } from './questions/questions.modue';

@Module({
  // Import 해올 Modules
  imports: [
      QuestionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
