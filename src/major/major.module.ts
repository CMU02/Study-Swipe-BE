import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Major } from './major.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Major])]
})
export class MajorModule {}
