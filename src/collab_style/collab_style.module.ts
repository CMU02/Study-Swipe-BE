import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollabStyle } from './collab_style.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CollabStyle])]
})
export class CollabStyleModule {}
