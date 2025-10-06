import { PeriodScoreLinear } from '../period_weight_score';
import { BadRequestException } from '@nestjs/common';

describe('PeriodScoreLinear', () => {
  describe('정상 케이스 테스트', () => {
    it('단기 기간에 대해 올바른 점수를 계산해야 함', () => {
      const result = PeriodScoreLinear('단기');
      expect(result.periodClass).toBe(1);
      expect(result.wPeriodScore01).toBe(0.33); // 1/3 ≈ 0.33
    });

    it('중기 기간에 대해 올바른 점수를 계산해야 함', () => {
      const result = PeriodScoreLinear('중기');
      expect(result.periodClass).toBe(2);
      expect(result.wPeriodScore01).toBe(0.67); // 2/3 ≈ 0.67
    });

    it('장기 기간에 대해 올바른 점수를 계산해야 함', () => {
      const result = PeriodScoreLinear('장기');
      expect(result.periodClass).toBe(3);
      expect(result.wPeriodScore01).toBe(1.0); // 3/3 = 1.0
    });
  });

  describe('에러 케이스 테스트', () => {
    it('잘못된 기간 길이 - 존재하지 않는 값', () => {
      expect(() => PeriodScoreLinear('초단기')).toThrow(BadRequestException);
      expect(() => PeriodScoreLinear('극장기')).toThrow(BadRequestException);
      expect(() => PeriodScoreLinear('medium')).toThrow(BadRequestException);
    });

    it('잘못된 기간 길이 - 빈 문자열', () => {
      expect(() => PeriodScoreLinear('')).toThrow(BadRequestException);
    });

    it('잘못된 기간 길이 - null/undefined', () => {
      expect(() => PeriodScoreLinear(null as any)).toThrow(BadRequestException);
      expect(() => PeriodScoreLinear(undefined as any)).toThrow(
        BadRequestException,
      );
    });

    it('잘못된 기간 길이 - 공백 및 특수문자', () => {
      expect(() => PeriodScoreLinear('단기')).not.toThrow(); // 정상
      expect(() => PeriodScoreLinear('단 기')).toThrow(BadRequestException); // 공백 포함
      expect(() => PeriodScoreLinear('단기!')).toThrow(BadRequestException); // 특수문자 포함
    });
  });

  describe('반환값 구조 테스트', () => {
    it('반환 객체가 올바른 구조를 가져야 함', () => {
      const result = PeriodScoreLinear('중기');

      expect(result).toHaveProperty('periodClass');
      expect(result).toHaveProperty('wPeriodScore01');
      expect(typeof result.periodClass).toBe('number');
      expect(typeof result.wPeriodScore01).toBe('number');
    });

    it('점수가 0-1 범위 내에 있어야 함', () => {
      const testCases = ['단기', '중기', '장기'];

      testCases.forEach((period) => {
        const result = PeriodScoreLinear(period);
        expect(result.wPeriodScore01).toBeGreaterThanOrEqual(0);
        expect(result.wPeriodScore01).toBeLessThanOrEqual(1);
      });
    });

    it('periodClass가 올바른 범위에 있어야 함', () => {
      const testCases = [
        { period: '단기', expectedClass: 1 },
        { period: '중기', expectedClass: 2 },
        { period: '장기', expectedClass: 3 },
      ];

      testCases.forEach(({ period, expectedClass }) => {
        const result = PeriodScoreLinear(period);
        expect(result.periodClass).toBe(expectedClass);
        expect(result.periodClass).toBeGreaterThanOrEqual(1);
        expect(result.periodClass).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('반올림 테스트', () => {
    it('소수점 둘째 자리까지 정확히 반올림되어야 함', () => {
      // 1/3 = 0.333... → 0.33
      const result1 = PeriodScoreLinear('단기');
      expect(result1.wPeriodScore01).toBe(0.33);

      // 2/3 = 0.666... → 0.67
      const result2 = PeriodScoreLinear('중기');
      expect(result2.wPeriodScore01).toBe(0.67);

      // 3/3 = 1.0 (반올림 불필요)
      const result3 = PeriodScoreLinear('장기');
      expect(result3.wPeriodScore01).toBe(1.0);
    });
  });

  describe('일관성 테스트', () => {
    it('동일한 입력에 대해 항상 동일한 결과를 반환해야 함', () => {
      const period = '중기';
      const result1 = PeriodScoreLinear(period);
      const result2 = PeriodScoreLinear(period);
      const result3 = PeriodScoreLinear(period);

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('점수가 기간 길이에 따라 순차적으로 증가해야 함', () => {
      const shortResult = PeriodScoreLinear('단기');
      const mediumResult = PeriodScoreLinear('중기');
      const longResult = PeriodScoreLinear('장기');

      expect(shortResult.wPeriodScore01).toBeLessThan(
        mediumResult.wPeriodScore01,
      );
      expect(mediumResult.wPeriodScore01).toBeLessThan(
        longResult.wPeriodScore01,
      );

      expect(shortResult.periodClass).toBeLessThan(mediumResult.periodClass);
      expect(mediumResult.periodClass).toBeLessThan(longResult.periodClass);
    });
  });

  describe('실제 사용 시나리오', () => {
    it('단기 프로젝트 (1-3개월)', () => {
      const result = PeriodScoreLinear('단기');
      expect(result.periodClass).toBe(1);
      expect(result.wPeriodScore01).toBe(0.33);
    });

    it('중기 프로젝트 (3-6개월)', () => {
      const result = PeriodScoreLinear('중기');
      expect(result.periodClass).toBe(2);
      expect(result.wPeriodScore01).toBe(0.67);
    });

    it('장기 프로젝트 (6개월 이상)', () => {
      const result = PeriodScoreLinear('장기');
      expect(result.periodClass).toBe(3);
      expect(result.wPeriodScore01).toBe(1.0);
    });
  });
});
