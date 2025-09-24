import { Module } from '@nestjs/common';
import { CanonicalTagsModule } from './canonical_tags/canonical_tags.module';
import { CanonicalTagMetaModule } from './canonical_tag_meta/canonical_tag_meta.module';
import { TagSynonymsModule } from './tag_synonyms/tag_synonyms.module';
import { VectorService } from './vector.service';

@Module({
  imports: [CanonicalTagsModule, CanonicalTagMetaModule, TagSynonymsModule],
  providers: [VectorService],
  exports: [VectorService],
})
export class VectorModule {}
