import { Module } from '@nestjs/common';
import { CanonicalTagsModule } from './canonical_tags/canonical_tags.module';
import { CanonicalTagMetaModule } from './canonical_tag_meta/canonical_tag_meta.module';
import { TagSynonymsModule } from './tag_synonyms/tag_synonyms.module';

@Module({
  imports: [CanonicalTagsModule, CanonicalTagMetaModule, TagSynonymsModule]
})
export class VectorModule {}
