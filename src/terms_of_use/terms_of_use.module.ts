import { Module } from '@nestjs/common';
import { TermsOfUseService } from './terms_of_use.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermsOfUse } from './terms_of_use.entity';
import { User } from 'src/user/user.entity';
import { TermsOfUseController } from './terms_of_use.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TermsOfUse, User])],
  providers: [TermsOfUseService],
  controllers: [TermsOfUseController],
})
export class TermsOfUseModule {}
