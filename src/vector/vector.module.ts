import { Module } from '@nestjs/common';
import { CanonicalTagsModule } from './canonical_tags/canonical_tags.module';
import { TagSynonymsModule } from './tag_synonyms/tag_synonyms.module';
import { VectorService } from './vector.service';

@Module({
  imports: [CanonicalTagsModule, TagSynonymsModule],
  providers: [VectorService],
  exports: [VectorService],
})
export class VectorModule {}
