import { BadRequestException } from '@nestjs/common';

/**
 * 단기, 중기, 장기 매핑용
 * @param period_length
 * @returns
 */
function PeriodLengthClass(period_length: string) {
  switch (period_length) {
    case '단기':
      return 1;
    case '중기':
      return 2;
    case '장기':
      return 3;
    default:
      throw new BadRequestException(
        `유효하지 않는 참여기간입니다. 입력 값: ${period_length}`,
      );
  }
}
function Round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * 참여기간 점수 (선형 정규화)
 * - class : 1(단기), 2(중기), 3(장기)
 * @param period_length 참여기간의 길이 분류
 */
export function PeriodScoreLinear(period_length: string) {
  const periodClass = PeriodLengthClass(period_length);
  const periodScore = Math.min(1, periodClass / 3);

  return {
    periodClass,
    // 1 -> 0.33
    // 2 -> 0.67
    // 3 -> 1.00
    wPeriodScore01: Round2(periodScore),
  };
}
