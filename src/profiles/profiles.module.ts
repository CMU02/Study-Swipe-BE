import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ProfilesController } from './profiles.controller';
import { Profiles } from './profiles.entity';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profiles]), UserModule],
  providers: [ProfilesService, JwtService],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
