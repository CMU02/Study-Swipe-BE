import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Universities } from './universities.entity';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Universities, User])],
  controllers: [UniversitiesController],
  providers: [UniversitiesService, JwtService],
  exports: [UniversitiesService],
})
export class UniversitiesModule {}
