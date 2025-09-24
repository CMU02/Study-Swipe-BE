import { Module } from '@nestjs/common';
import { TagSynonymsService } from './tag_synonyms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagSynonyms } from './tag_synonyms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagSynonyms])],
  providers: [TagSynonymsService],
  exports: [TagSynonymsService],
})
export class TagSynonymsModule {}
