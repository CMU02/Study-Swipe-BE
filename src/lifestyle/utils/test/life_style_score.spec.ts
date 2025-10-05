import LifeStyleScore from '../life_style_score';
import { timeScoreLinear } from '../available_time_score';
import { PeriodScoreLinear } from '../period_weight_score';

describe('LifeStyleScore', () => {
  describe('기본 기능 테스트', () => {
    it('기본 가중치(0.5, 0.5)로 정상 계산되어야 함', () => {
      const participation = {
        start_time: '09:00',
        end_time: '18:00', // 9시간
        period_length: '중기', // 2/3 = 0.67
      };

      const result = LifeStyleScore(participation);

      // 개별 점수 검증
      expect(result.time01).toBe(0.69); // 9/13 ≈ 0.69
      expect(result.period01).toBe(0.67); // 2/3 ≈ 0.67

      // 가중치 검증 (정규화된 값)
      expect(result.weights.time).toBe(0.5);
      expect(result.weights.period).toBe(0.5);

      // 최종 점수 검증 (가중 평균)
      const expectedScore = 0.5 * 0.69 + 0.5 * 0.67; // 0.68
      expect(result.lifestyle01).toBe(0.68);
    });

    it('커스텀 가중치로 정상 계산되어야 함', () => {
      const participation = {
        start_time: '09:00',
        end_time: '22:00', // 13시간 (최대)
        period_length: '단기', // 1/3 = 0.33
      };

      const customWeights = { time: 0.7, period: 0.3 };
      const result = LifeStyleScore(participation, customWeights);

      // 개별 점수 검증
      expect(result.time01).toBe(1.0); // 13/13 = 1.0
      expect(result.period01).toBe(0.33); // 1/3 ≈ 0.33

      // 가중치 검증 (정규화된 값)
      expect(result.weights.time).toBe(0.7);
      expect(result.weights.period).toBe(0.3);

      // 최종 점수 검증
      const expectedScore = 0.7 * 1.0 + 0.3 * 0.33; // 0.799 ≈ 0.8
      expect(result.lifestyle01).toBe(0.8);
    });
  });

  describe('시간 점수 계산 테스트', () => {
    it('다양한 시간대에 대해 올바른 점수를 계산해야 함', () => {
      const testCases = [
        { start: '09:00', end: '13:00', expected: 0.31 }, // 4시간
        { start: '09:00', end: '17:00', expected: 0.62 }, // 8시간
        { start: '09:00', end: '18:00', expected: 0.69 }, // 9시간
        { start: '09:00', end: '22:00', expected: 1.0 }, // 13시간
      ];

      testCases.forEach(({ start, end, expected }) => {
        const participation = {
          start_time: start,
          end_time: end,
          period_length: '중기',
        };

        const result = LifeStyleScore(participation);
        expect(result.time01).toBe(expected);
      });
    });

    it('최대 시간을 초과하는 경우 1.0으로 제한되어야 함', () => {
      const participation = {
        start_time: '08:00',
        end_time: '23:00', // 15시간 (13시간 초과)
        period_length: '장기',
      };

      const result = LifeStyleScore(participation);
      expect(result.time01).toBe(1.0);
    });
  });

  describe('기간 점수 계산 테스트', () => {
    it('다양한 기간 길이에 대해 올바른 점수를 계산해야 함', () => {
      const testCases = [
        { period_length: '단기', expected: 0.33 }, // 1/3
        { period_length: '중기', expected: 0.67 }, // 2/3
        { period_length: '장기', expected: 1.0 }, // 3/3
      ];

      testCases.forEach(({ period_length, expected }) => {
        const participation = {
          start_time: '09:00',
          end_time: '18:00',
          period_length,
        };

        const result = LifeStyleScore(participation);
        expect(result.period01).toBe(expected);
      });
    });
  });

  describe('가중치 정규화 테스트', () => {
    it('가중치 합이 1이 아닌 경우 정규화되어야 함', () => {
      const participation = {
        start_time: '09:00',
        end_time: '18:00',
        period_length: '중기',
      };

      const weights = { time: 2, period: 3 }; // 합: 5
      const result = LifeStyleScore(participation, weights);

      // 정규화된 가중치 검증
      expect(result.weights.time).toBe(0.4); // 2/5
      expect(result.weights.period).toBe(0.6); // 3/5
    });

    it('가중치 합이 0에 가까운 경우 처리되어야 함', () => {
      const participation = {
        start_time: '09:00',
        end_time: '18:00',
        period_length: '중기',
      };

      const weights = { time: 0, period: 0 };
      const result = LifeStyleScore(participation, weights);

      // 0으로 나누기 방지를 위해 최소값 사용
      expect(result.weights.time).toBe(0);
      expect(result.weights.period).toBe(0);
    });
  });

  describe('극단적인 케이스 테스트', () => {
    it('최소 시간과 단기 기간 조합', () => {
      const participation = {
        start_time: '09:00',
        end_time: '09:30', // 0.5시간
        period_length: '단기',
      };

      const result = LifeStyleScore(participation);

      expect(result.time01).toBe(0.04); // 0.5/13 ≈ 0.04
      expect(result.period01).toBe(0.33);
      expect(result.lifestyle01).toBe(0.19); // (0.04 + 0.33) / 2 ≈ 0.185 → 0.19
    });

    it('최대 시간과 장기 기간 조합', () => {
      const participation = {
        start_time: '09:00',
        end_time: '22:00', // 13시간
        period_length: '장기',
      };

      const result = LifeStyleScore(participation);

      expect(result.time01).toBe(1.0);
      expect(result.period01).toBe(1.0);
      expect(result.lifestyle01).toBe(1.0);
    });
  });

  describe('실제 사용 시나리오 테스트', () => {
    it('일반적인 직장인 스케줄', () => {
      const participation = {
        start_time: '19:00', // 퇴근 후
        end_time: '22:00', // 3시간
        period_length: '중기',
      };

      const result = LifeStyleScore(participation);

      expect(result.time01).toBe(0.23); // 3/13 ≈ 0.23
      expect(result.period01).toBe(0.67);
      expect(result.lifestyle01).toBe(0.45); // (0.23 + 0.67) / 2 = 0.45
    });

    it('학생 스케줄 (오전 시간 활용)', () => {
      const participation = {
        start_time: '09:00',
        end_time: '15:00', // 6시간
        period_length: '장기',
      };

      const result = LifeStyleScore(participation);

      expect(result.time01).toBe(0.46); // 6/13 ≈ 0.46
      expect(result.period01).toBe(1.0);
      expect(result.lifestyle01).toBe(0.73); // (0.46 + 1.0) / 2 = 0.73
    });

    it('주말 집중 스터디', () => {
      const participation = {
        start_time: '10:00',
        end_time: '20:00', // 10시간
        period_length: '단기',
      };

      const weights = { time: 0.8, period: 0.2 }; // 시간 중시
      const result = LifeStyleScore(participation, weights);

      expect(result.time01).toBe(0.77); // 10/13 ≈ 0.77
      expect(result.period01).toBe(0.33);
      expect(result.lifestyle01).toBe(0.68); // 0.8 * 0.77 + 0.2 * 0.33 ≈ 0.68
    });
  });

  describe('반환값 구조 테스트', () => {
    it('반환 객체가 올바른 구조를 가져야 함', () => {
      const participation = {
        start_time: '09:00',
        end_time: '18:00',
        period_length: '중기',
      };

      const result = LifeStyleScore(participation);

      // 반환 객체 구조 검증
      expect(result).toHaveProperty('time01');
      expect(result).toHaveProperty('period01');
      expect(result).toHaveProperty('weights');
      expect(result).toHaveProperty('lifestyle01');

      // weights 객체 구조 검증
      expect(result.weights).toHaveProperty('time');
      expect(result.weights).toHaveProperty('period');

      // 타입 검증
      expect(typeof result.time01).toBe('number');
      expect(typeof result.period01).toBe('number');
      expect(typeof result.weights.time).toBe('number');
      expect(typeof result.weights.period).toBe('number');
      expect(typeof result.lifestyle01).toBe('number');
    });

    it('모든 점수가 0-1 범위 내에 있어야 함', () => {
      const participation = {
        start_time: '09:00',
        end_time: '18:00',
        period_length: '중기',
      };

      const result = LifeStyleScore(participation);

      expect(result.time01).toBeGreaterThanOrEqual(0);
      expect(result.time01).toBeLessThanOrEqual(1);
      expect(result.period01).toBeGreaterThanOrEqual(0);
      expect(result.period01).toBeLessThanOrEqual(1);
      expect(result.lifestyle01).toBeGreaterThanOrEqual(0);
      expect(result.lifestyle01).toBeLessThanOrEqual(1);
    });
  });
});
