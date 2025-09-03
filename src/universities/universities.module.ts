import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Universities } from './universities.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Universities])]
})
export class UniversitiesModule {}
