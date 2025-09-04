import { SendEmailCommand, SESv2 } from '@aws-sdk/client-sesv2';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { BaseResponse } from 'src/base_response';
import { VerificationStore } from './verification.store';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: Transporter;
  private from = process.env.MAIL_FROM;

  constructor(private readonly verificationStore: VerificationStore) {
    this.createTransporter();
  }

  private createTransporter() {
    const awsRegion = process.env.AWS_REGION;
    const sesAccessKey = process.env.SES_ACCESS_KEY;
    const sesSecretKey = process.env.SES_SECRET_ACCESS_KEY;

    if (awsRegion && sesAccessKey && sesSecretKey) {
      // AWS SES 사용
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

    // transporter가 정의되었을 때만 연결 확인
    if (this.transporter) {
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('Mail server connection failed:', error);
        } else {
          this.logger.log('Mail server is ready to take our messages');
        }
      });
    }
  }

  async sendMailTest() {
    const response = await this.transporter.sendMail({
      from: this.from,
      to: 'jeonjh0321@naver.com',
      subject: 'Nice to meet you!',
      html: `<h1>Hello World</h1>`,
    });

    return response;
  }

  async sendVerificationCode(to: string): Promise<void> {
    const code = this.verificationStore.genenrateCode(); // 코드 생성

    this.verificationStore.setCode(to, code); // 저장소에 해당 이메일과 인증코드 저장

    // 이메일 전송
    await this.transporter.sendMail({
      from: 'Study Swipe' + this.from,
      to,
      subject: '[Study Swipe] 요청하신 인증코드를 보내드립니다.',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h1 style="color: #333;">이메일 인증 안내</h1>
          <p style="font-size: 16px;">요청하신 인증 코드는 다음과 같습니다. 코드를 입력란에 정확히 입력해주세요.</p>
          <div style="margin: 30px 0; padding: 15px; background-color: #f5f5f5; border-radius: 10px;">
            <strong style="font-size: 24px; color: #007bff; letter-spacing: 5px;">${code}</strong>
          </div>
          <p style="font-size: 12px; color: #888;">이 코드는 5분간 유효합니다.</p>
        </div>
      `,
    });
  }
}
