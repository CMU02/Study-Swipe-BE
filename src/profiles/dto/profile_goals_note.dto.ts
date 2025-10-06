import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 프로필 학습 목표 업데이트 데이터 전송 객체
 * 학습 목표 및 다짐 정보를 포함합니다.
 */
export class ProfileGoalsNoteDto {
  /**
   * 학습 목표 및 다짐 (최대 1000자)
   */
  @IsString({ message: '학습 목표는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '학습 목표는 필수입니다.' })
  @MaxLength(1000, { message: '학습 목표는 최대 1000자까지 가능합니다.' })
  readonly goals_note: string;
}
