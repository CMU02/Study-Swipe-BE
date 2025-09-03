import { HttpStatus } from "@nestjs/common";

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export type VerificationRecord = {
    code: string; // 실제 6자리 인증코드
    expiresAtMs: number; // 코드 만료 시각
    cooldownExpiresAtMs: number; // 재발송 쿨다운 만료 시각
}