import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profiles } from './profiles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profiles])],
  providers: [ProfilesService],
  controllers: [ProfilesController]
})
export class ProfilesModule {}
