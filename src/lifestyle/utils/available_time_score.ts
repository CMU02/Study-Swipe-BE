import { BadRequestException } from '@nestjs/common';

/**
 * 24시간 형식 시간 문자열을 시간(숫자)으로 변환합니다.
 * @param timeString 24시간 형식 시간 문자열 (예: '09:00', '14:30')
 * @returns 시간 숫자 (예: 9, 14.5)
 */
function parseTimeString(timeString: string): number {
  if (!timeString || typeof timeString !== 'string') {
    throw new BadRequestException('시간 형식이 올바르지 않습니다.');
  }

  const [hours, minutes] = timeString.split(':').map(Number);

  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new BadRequestException(
      '시간 형식이 올바르지 않습니다. HH:MM 형식으로 입력해주세요.',
    );
  }

  return hours + minutes / 60;
}

/**
 * 두 시간 사이의 가능한 시간을 계산합니다.
 * @param startTime 시작 시간 (24시간 형식 문자열, 예: '09:00')
 * @param endTime 종료 시간 (24시간 형식 문자열, 예: '18:00')
 * @returns 가능한 시간 (시간 단위)
 */
function calculateAvailableHours(startTime: string, endTime: string): number {
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);

  if (start >= end) {
    throw new BadRequestException('시작 시간은 종료 시간보다 빨라야 합니다.');
  }

  return end - start;
}

/**
 * 선형 정규화 기반 가능 시간대 점수 계산
 * - startTime, endTime: 24시간 형식 문자열 (예: '09:00', '18:00')
 * - maxHours: 최대 가능 시간 (기본값: 13시간)
 * @param startTime 시작 시간 (24시간 형식)
 * @param endTime 종료 시간 (24시간 형식)
 * @param maxHours 최대 가능 시간 (기본값: 13)
 * @returns 가능 시간과 가중치 점수
 */
export function timeScoreLinear(
  startTime: string,
  endTime: string,
  maxHours: number = 13,
): {
  hours: number;
  wTimeScore: number;
} {
  // 입력 검증
  if (maxHours <= 0) {
    throw new BadRequestException('최대 가능 시간은 0보다 커야 합니다.');
  }

  // 가능한 시간 계산
  let hours = calculateAvailableHours(startTime, endTime);

  // 최대 시간을 초과하면 최대 시간으로 제한
  if (hours > maxHours) {
    hours = maxHours;
  }

  // 선형 정규화: 0~1 범위로 변환
  const timeScore = Math.min(1, hours / maxHours);

  // 소수점 둘째 자리까지 반올림
  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    hours,
    wTimeScore: round2(timeScore),
  };
}
