import { Injectable, Logger } from "@nestjs/common";

/**
 * 인증코드 유효 시간(초) 
 * 300초 = 5분
 */
const VERIFICATION_CODE_TTL_SEC = 300;
/**
 * 재발송 쿨다운(초)
 * - 동일 이메일로 너무 자주 발송되는 걸 방지
 */
const VERIFICATION_COOLDOWN_SEC = 60;

type VerificationRecord = {
    code: string; // 실제 6자리 인증코드
    expiresAtMs: number; // 코드 만료 시각
    cooldownExpiresAtMs: number; // 재발송 쿨다운 만료 시각
}

@Injectable()
export class VerificationStore {
    private readonly logger = new Logger(VerificationStore.name);
    private memoryStore = new Map<string, VerificationRecord>(); // key: 이메일 주소

    genenrateCode() {
        return Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
    }

    // 인증코드 저장
    async setCode(email: string): Promise<void> {
        const now = Date.now();
        const code = this.genenrateCode();

        this.memoryStore.set(email, {
            code,
            expiresAtMs: now + VERIFICATION_CODE_TTL_SEC * 1000,
            cooldownExpiresAtMs: now + VERIFICATION_COOLDOWN_SEC * 1000,
        })
    }

    /**
     * 인증 코드 조회
     * - 만료된 경우 null 반환
     */
    async getCode(email: string): Promise<string | null> {
        const verificationRecord = this.memoryStore.get(email);
        if (!verificationRecord) return null;

        // 현재 시각에서 만료 시각이 지나면 코드 폐기 후 null
        if (Date.now() > verificationRecord.expiresAtMs) {
            this.memoryStore.delete(email);
            return null;
        }

        return verificationRecord.code;
    }

    /**
     * 인증 코드 삭제 (성공 시 단발성 사용원칙)
     */
    async clearCode(email: string): Promise<void> {
        this.memoryStore.delete(email);
    }

    /**
     * 재발송 쿨다운 기간인지 확인
     */
    async isInCooldown(email: string): Promise<boolean> {
        const verificationRecord = this.memoryStore.get(email);
        return !!(verificationRecord && Date.now() < verificationRecord.cooldownExpiresAtMs);
    }
}