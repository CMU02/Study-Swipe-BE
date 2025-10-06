import { timeScoreLinear } from '../available_time_score';
import { BadRequestException } from '@nestjs/common';

describe('timeScoreLinear', () => {
  describe('정상 케이스 테스트', () => {
    it('기본 maxHours(13)로 정상 계산되어야 함', () => {
      const testCases = [
        { start: '09:00', end: '13:00', expectedHours: 4, expectedScore: 0.31 },
        { start: '09:00', end: '17:00', expectedHours: 8, expectedScore: 0.62 },
        { start: '09:00', end: '18:00', expectedHours: 9, expectedScore: 0.69 },
        { start: '09:00', end: '22:00', expectedHours: 13, expectedScore: 1.0 },
      ];

      testCases.forEach(({ start, end, expectedHours, expectedScore }) => {
        const result = timeScoreLinear(start, end);
        expect(result.hours).toBe(expectedHours);
        expect(result.wTimeScore).toBe(expectedScore);
      });
    });

    it('커스텀 maxHours로 정상 계산되어야 함', () => {
      const result = timeScoreLinear('09:00', '18:00', 10); // 9시간, 최대 10시간
      expect(result.hours).toBe(9);
      expect(result.wTimeScore).toBe(0.9); // 9/10 = 0.9
    });

    it('분 단위 시간도 정확히 계산되어야 함', () => {
      const result = timeScoreLinear('09:30', '12:45'); // 3.25시간
      expect(result.hours).toBe(3.25);
      expect(result.wTimeScore).toBe(0.25); // 3.25/13 ≈ 0.25
    });
  });

  describe('경계값 테스트', () => {
    it('최대 시간을 초과하는 경우 제한되어야 함', () => {
      const result = timeScoreLinear('08:00', '23:00'); // 15시간 > 13시간
      expect(result.hours).toBe(13);
      expect(result.wTimeScore).toBe(1.0);
    });

    it('최소 시간(0.5시간)도 정상 계산되어야 함', () => {
      const result = timeScoreLinear('09:00', '09:30'); // 0.5시간
      expect(result.hours).toBe(0.5);
      expect(result.wTimeScore).toBe(0.04); // 0.5/13 ≈ 0.04
    });

    it('정확히 최대 시간인 경우', () => {
      const result = timeScoreLinear('09:00', '22:00', 13); // 정확히 13시간
      expect(result.hours).toBe(13);
      expect(result.wTimeScore).toBe(1.0);
    });
  });

  describe('에러 케이스 테스트', () => {
    it('잘못된 시간 형식 - 빈 문자열', () => {
      expect(() => timeScoreLinear('', '18:00')).toThrow(BadRequestException);
      expect(() => timeScoreLinear('09:00', '')).toThrow(BadRequestException);
    });

    it('잘못된 시간 형식 - null/undefined', () => {
      expect(() => timeScoreLinear(null as any, '18:00')).toThrow(
        BadRequestException,
      );
      expect(() => timeScoreLinear('09:00', undefined as any)).toThrow(
        BadRequestException,
      );
    });

    it('잘못된 시간 형식 - 잘못된 포맷', () => {
      expect(() => timeScoreLinear('abc:00', '18:00')).toThrow(
        BadRequestException,
      ); // 문자 포함
      expect(() => timeScoreLinear('09:00', '18')).toThrow(BadRequestException); // 분 누락
      expect(() => timeScoreLinear('25:00', '18:00')).toThrow(
        BadRequestException,
      ); // 잘못된 시간
      expect(() => timeScoreLinear('09:60', '18:00')).toThrow(
        BadRequestException,
      ); // 잘못된 분
    });

    it('시작 시간이 종료 시간보다 늦은 경우', () => {
      expect(() => timeScoreLinear('18:00', '09:00')).toThrow(
        BadRequestException,
      );
      expect(() => timeScoreLinear('12:00', '12:00')).toThrow(
        BadRequestException,
      ); // 같은 시간
    });

    it('maxHours가 0 이하인 경우', () => {
      expect(() => timeScoreLinear('09:00', '18:00', 0)).toThrow(
        BadRequestException,
      );
      expect(() => timeScoreLinear('09:00', '18:00', -1)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('반올림 테스트', () => {
    it('소수점 둘째 자리까지 정확히 반올림되어야 함', () => {
      // 1/13 = 0.076923... → 0.08
      const result = timeScoreLinear('09:00', '10:00'); // 1시간
      expect(result.wTimeScore).toBe(0.08);
    });

    it('반올림이 필요 없는 경우', () => {
      const result = timeScoreLinear('09:00', '15:30', 13); // 6.5시간
      expect(result.hours).toBe(6.5); // 정확한 값
      expect(result.wTimeScore).toBe(0.5); // 6.5/13 = 0.5 (정확)
    });
  });

  describe('실제 사용 시나리오', () => {
    it('일반적인 업무 시간', () => {
      const result = timeScoreLinear('09:00', '18:00'); // 9시간 근무
      expect(result.hours).toBe(9);
      expect(result.wTimeScore).toBe(0.69);
    });

    it('파트타임 스케줄', () => {
      const result = timeScoreLinear('14:00', '18:00'); // 4시간
      expect(result.hours).toBe(4);
      expect(result.wTimeScore).toBe(0.31);
    });

    it('야간 스터디', () => {
      const result = timeScoreLinear('19:00', '23:00'); // 4시간
      expect(result.hours).toBe(4);
      expect(result.wTimeScore).toBe(0.31);
    });

    it('주말 집중 스터디', () => {
      const result = timeScoreLinear('10:00', '20:00'); // 10시간
      expect(result.hours).toBe(10);
      expect(result.wTimeScore).toBe(0.77);
    });
  });
});
