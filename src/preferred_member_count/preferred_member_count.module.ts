import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferredMemberCount } from './preferred_member_count.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PreferredMemberCount])],
})
export class PreferredMemberCountModule {}
