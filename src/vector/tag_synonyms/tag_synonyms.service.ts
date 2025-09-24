import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagSynonyms } from './tag_synonyms.entity';
import { Repository } from 'typeorm';
import { CanonicalTags } from '../canonical_tags/canonical_tags.entity';

@Injectable()
export class TagSynonymsService {
  constructor(
    @InjectRepository(TagSynonyms)
    private tagSynonymsRepository: Repository<TagSynonyms>,
  ) {}

  async upsertTagSynonyms(raw: string, canonical_tags: CanonicalTags) {
    const createTagSynonyms = this.tagSynonymsRepository.create({
      raw,
      canonical_tags,
      confidence: 0.99,
    });

    this.tagSynonymsRepository.save(createTagSynonyms);
  }
}
