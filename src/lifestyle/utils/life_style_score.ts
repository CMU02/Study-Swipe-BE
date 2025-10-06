import { timeScoreLinear } from './available_time_score';
import { PeriodScoreLinear } from './period_weight_score';

interface ParticipationLike {
  start_time: string;
  end_time: string;
  period?: number;
  period_length: string;
}

export default function LifeStyleScore(
  p: ParticipationLike,
  weights: { time: number; period: number } = { time: 0.5, period: 0.5 },
) {
  const { end_time, period_length, start_time, period } = p;

  // 1. 개별 점수 산출
  const timeScore = timeScoreLinear(start_time, end_time, 13).wTimeScore;
  const periodScore = PeriodScoreLinear(period_length).wPeriodScore01;

  // 2. 가중치 정규화
  const weight_sum = Math.max(1e-9, weights.time + weights.period);
  const weight_time = weights.time / weight_sum;
  const weight_period = weights.period / weight_sum;

  // 3. 가중 평균
  const lifestyle01 = weight_time * timeScore + weight_period * periodScore;
  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    time01: timeScore,
    period01: periodScore,
    weights: { time: weight_time, period: weight_period },
    lifestyle01: round2(lifestyle01),
  };
}
