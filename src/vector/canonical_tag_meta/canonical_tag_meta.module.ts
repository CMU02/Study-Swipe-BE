import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanonicalTagMeta } from './canonical_tag_meta';

@Module({
  imports: [TypeOrmModule.forFeature([CanonicalTagMeta])],
})
export class CanonicalTagMetaModule {}
