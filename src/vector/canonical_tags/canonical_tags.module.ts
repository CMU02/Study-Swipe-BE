import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanonicalTags } from './canonical_tags.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CanonicalTags])],
})
export class CanonicalTagsModule {}
