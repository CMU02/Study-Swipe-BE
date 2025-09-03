import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Regions } from './regions.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Regions])]
})
export class RegionsModule {}
