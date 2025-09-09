import { IsIn, IsNotEmpty, IsString } from 'class-validator';

/**
 * 프로필 사교모임 선호도 업데이트 데이터 전송 객체
 * 사교모임 가능 여부 정보를 포함합니다.
 */
export class ProfileSocialPrefDto {
  /**
   * 사교모임 선호도 이름
   * 가능한 값: '네', '아니오', '가끔'
   */
  @IsString({ message: '사교모임 선호도는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사교모임 선호도는 필수입니다.' })
  @IsIn(['네', '아니오', '가끔'], {
    message: '사교모임 선호도는 네, 아니오, 가끔 중 하나여야 합니다.',
  })
  readonly social_pref_name: string;
}
