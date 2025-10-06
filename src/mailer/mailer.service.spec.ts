import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from './mailer.service';
import { VerificationStore } from './verification.store';

// AWS SDK 모킹
jest.mock('@aws-sdk/client-sesv2', () => ({
  SESv2: jest.fn().mockImplementation(() => ({})),
  SendEmailCommand: jest.fn(),
}));

// nodemailer 모킹
const mockTransporter = {
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  verify: jest.fn((callback: any) => callback(null, true)),
};

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter),
}));

describe('MailerService', () => {
  let mailerService: MailerService;
  let verificationStore: VerificationStore;

  // 인증 저장소 모킹
  const mockVerificationStore = {
    genenrateCode: jest.fn(),
    setCode: jest.fn(),
    getCode: jest.fn(),
    clearCode: jest.fn(),
    isInCooldown: jest.fn(),
  };

  beforeAll(() => {
    // 환경 변수 설정
    process.env.AWS_REGION = 'us-east-1';
    process.env.SES_ACCESS_KEY = 'test-access-key';
    process.env.SES_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.MAIL_FROM = 'test@example.com';
  });

  afterAll(() => {
    // 환경 변수 정리
    delete process.env.AWS_REGION;
    delete process.env.SES_ACCESS_KEY;
    delete process.env.SES_SECRET_ACCESS_KEY;
    delete process.env.MAIL_FROM;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: VerificationStore,
          useValue: mockVerificationStore,
        },
      ],
    }).compile();

    mailerService = module.get<MailerService>(MailerService);
    verificationStore = module.get<VerificationStore>(VerificationStore);

    // 모든 모킹 초기화
    jest.clearAllMocks();
  });

  describe('Define Service', () => {
    it('should be mailerService defined', () => {
      expect(mailerService).toBeDefined();
    });
    it('should be verificationStore defined', () => {
      expect(verificationStore).toBeDefined();
    });
  });

  describe('Send Code and Verify Code', () => {
    const testEmail = 'test@email.com';
    const testCode = '123456';

    beforeEach(() => {
      // 각 테스트 전 모킹 설정
      mockVerificationStore.genenrateCode.mockReturnValue(testCode);
      mockVerificationStore.setCode.mockResolvedValue(new Map());
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });
    });

    it('Send Verification Code', async () => {
      await mailerService.sendVerificationCode(testEmail);

      // 인증코드 생성 확인
      expect(mockVerificationStore.genenrateCode).toHaveBeenCalled();

      // 인증코드 저장 확인
      expect(mockVerificationStore.setCode).toHaveBeenCalledWith(
        testEmail,
        testCode,
      );

      // 이메일 전송 확인
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: process.env.MAIL_FROM,
        to: testEmail,
        subject: '[인증 코드] 요청하신 인증코드를 보내드립니다.',
        html: expect.stringContaining(testCode),
      });
    });
  });
});
