import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingTypes } from './meeting_types.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MeetingTypes])]
})
export class MeetingTypesModule {}
