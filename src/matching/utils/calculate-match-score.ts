import LifeStyleScore from 'src/lifestyle/utils/life_style_score';
import { participationInfo } from 'src/participation_info/participation_info.entity';

/**
 * 매칭 점수 계산 유틸리티
 */

/**
 * 시간 형식 검증 (HH:MM 형식)
 * @param timeString 시간 문자열
 * @returns 유효 여부
 */
function isValidTimeFormat(timeString: string): boolean {
  if (!timeString || typeof timeString !== 'string') {
    return false;
  }

  // HH:MM 형식 검증
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * 기간 길이 검증
 * @param periodLength 기간 길이
 * @returns 유효 여부
 */
function isValidPeriodLength(periodLength: string): boolean {
  return ['단기', '중기', '장기'].includes(periodLength);
}

/**
 * 생활 패턴 점수 계산
 * @param participationInfo 참여 정보
 * @returns 생활 패턴 점수 (0~1)
 */
export function calculateLifestyleScore(
  participationInfo: participationInfo | null | undefined,
): number {
  // participationInfo가 없는 경우 기본값 반환
  if (!participationInfo) {
    return 0.5;
  }

  // 필수 필드 검증
  if (
    !participationInfo.start_time ||
    !participationInfo.end_time ||
    !participationInfo.period_length
  ) {
    return 0.5;
  }

  // 시간 형식 검증
  if (
    !isValidTimeFormat(participationInfo.start_time) ||
    !isValidTimeFormat(participationInfo.end_time)
  ) {
    return 0.5;
  }

  // 기간 길이 검증
  if (!isValidPeriodLength(participationInfo.period_length)) {
    return 0.5;
  }

  // 시작 시간이 종료 시간보다 늦은 경우
  const [startHour, startMin] = participationInfo.start_time
    .split(':')
    .map(Number);
  const [endHour, endMin] = participationInfo.end_time.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (startMinutes >= endMinutes) {
    return 0.5;
  }

  try {
    const lifestyleResult = LifeStyleScore({
      start_time: participationInfo.start_time,
      end_time: participationInfo.end_time,
      period: participationInfo.period || 3, // 기본값 3개월
      period_length: participationInfo.period_length,
    });

    return lifestyleResult.lifestyle01;
  } catch (error) {
    // 예상치 못한 에러 발생 시에만 로그 출력
    console.warn(
      `LifeStyleScore 계산 실패 (start: ${participationInfo.start_time}, end: ${participationInfo.end_time}, period: ${participationInfo.period_length}):`,
      error instanceof Error ? error.message : error,
    );
    return 0.5;
  }
}

/**
 * 공부 태그 가중치 점수 계산
 * @param tagWeightScore 태그의 proficiency_weight_avg_score
 * @returns 정규화된 점수 (0~1)
 */
export function normalizeTagScore(tagWeightScore: number): number {
  // 태그 점수는 1~5 범위로 가정, 0~1로 정규화
  return Math.min(1, Math.max(0, (tagWeightScore - 1) / 4));
}

/**
 * 사용자 전체 가중치 점수 정규화
 * @param userWeightScore 사용자의 weight_avg_score
 * @returns 정규화된 점수 (0~1)
 */
export function normalizeUserScore(userWeightScore: number): number {
  // 사용자 점수는 1~5 범위로 가정, 0~1로 정규화
  return Math.min(1, Math.max(0, (userWeightScore - 1) / 4));
}

/**
 * 최종 매칭 점수 계산
 * @param lifestyleScore 생활 패턴 점수 (0~1)
 * @param studyScore 공부 태그 점수 (0~1)
 * @param weights 가중치 { lifestyle: number, study: number }
 * @returns 최종 매칭 점수 (0~1)
 */
export function calculateFinalMatchScore(
  lifestyleScore: number,
  studyScore: number,
  weights: { lifestyle: number; study: number } = {
    lifestyle: 0.4,
    study: 0.6,
  },
): number {
  // 가중치 정규화
  const weightSum = Math.max(1e-9, weights.lifestyle + weights.study);
  const normalizedLifestyleWeight = weights.lifestyle / weightSum;
  const normalizedStudyWeight = weights.study / weightSum;

  // 가중 평균 계산
  const finalScore =
    normalizedLifestyleWeight * lifestyleScore +
    normalizedStudyWeight * studyScore;

  // 소수점 둘째 자리까지 반올림
  return Math.round(finalScore * 100) / 100;
}
