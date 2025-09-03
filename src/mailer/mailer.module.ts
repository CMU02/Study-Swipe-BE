import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';
import { VerificationStore } from './verification.store';

@Module({
  controllers: [MailerController],
  providers: [MailerService, VerificationStore],
  exports: [MailerService],
})
export class MailerModule {}
