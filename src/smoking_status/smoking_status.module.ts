import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmokingStatus } from './smoking_status.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SmokingStatus])]
})
export class SmokingStatusModule {}
