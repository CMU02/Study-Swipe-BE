import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { SendEmailCommand, SESv2 } from '@aws-sdk/client-sesv2';
import { VerificationStore } from './verification.store';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: Transporter;

  constructor() {
    this.createTransporter();
  }

  private createTransporter() {
    const awsRegion = process.env.AWS_REGION;
    const sesAccessKey = process.env.SES_ACCESS_KEY;
    const sesSecretKey = process.env.SES_SECRET_ACCESS_KEY;

    if (awsRegion && sesAccessKey && sesSecretKey) {
      const sesClient = new SESv2({
        region: awsRegion,
        credentials: {
          accessKeyId: sesAccessKey,
          secretAccessKey: sesSecretKey,
        },
      });

      this.transporter = nodemailer.createTransport({
        SES: { sesClient, SendEmailCommand },
      });
      
      this.logger.log('Using AWS SES for email transport');
    }

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Mail server connection failed:', error);
      } else {
        this.logger.log('Mail server is ready to take our messages');
      }
    });
  }

  async sendMail() {
    const from = process.env.MAIL_FROM;

    const response = await this.transporter.sendMail({
      from,
      to: 'jeonjh0321@naver.com',
      subject: 'Nice to meet you!',
      html: `<h1>Hello World</h1>`
    })

    return response;
  }

  async sendVerificationCode(to: string, code: string) {
    
  }
}
