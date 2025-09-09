import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * 프로필 기본 정보 데이터 전송 객체
 * 사용자의 기본적인 프로필 정보를 포함합니다.
 */
export class ProfileBasicDto {
  /**
   * 서비스에 표시될 사용자 이름 (닉네임)
   * 2-20자 제한
   */
  @IsOptional()
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다.' })
  readonly display_name?: string;

  /**
   * 프로필 사진 URL
   */
  @IsOptional()
  @IsString({ message: '이미지 URL은 문자열이어야 합니다.' })
  @IsUrl({}, { message: '올바른 URL 형식이 아닙니다.' })
  readonly image?: string;

  /**
   * 생년월일 (YYYY-MM-DD 형식)
   */
  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)' })
  readonly birth_date?: string;

  /**
   * 나이 (14-100세 제한)
   */
  @IsOptional()
  @IsInt({ message: '나이는 정수여야 합니다.' })
  @Min(18, { message: '나이는 최소 만18세 이상이어야 합니다.' })
  @Max(100, { message: '나이는 최대 100세까지 가능합니다.' })
  readonly age?: number;

  /**
   * 성별 (남성, 여성)
   */
  @IsOptional()
  @IsString({ message: '성별은 문자열이어야 합니다.' })
  @IsIn(['남성', '여성'], {
    message: '성별은 남성, 여성 중 하나여야 합니다.',
  })
  readonly gender?: string;

  /**
   * 자기소개 (최대 500자)
   */
  @IsOptional()
  @IsString({ message: '자기소개는 문자열이어야 합니다.' })
  @MaxLength(500, { message: '자기소개는 최대 500자까지 가능합니다.' })
  readonly bio_note?: string;
}
