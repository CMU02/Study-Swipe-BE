import { Module } from '@nestjs/common';
import { TagResolverService } from './tags_resolver.service';
import { TagsController } from './tags.controller';

@Module({
  providers: [TagResolverService],
  controllers: [TagsController],
  exports: [TagResolverService],
})
export class TagsModule {}
