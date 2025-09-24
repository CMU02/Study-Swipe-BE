import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanonicalTags } from './canonical_tags.entity';
import { CanonicalTagsService } from './canonical_tags.service';
import { VectorService } from '../vector.service';
import { TagSynonyms } from '../tag_synonyms/tag_synonyms.entity';
import { TagSynonymsModule } from '../tag_synonyms/tag_synonyms.module';
import { CanonicalTagsController } from './canonical_tags.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CanonicalTags, TagSynonyms]),
    TagSynonymsModule,
  ],
  providers: [CanonicalTagsService, VectorService],
  exports: [CanonicalTagsService],
  controllers: [CanonicalTagsController],
})
export class CanonicalTagsModule {}
