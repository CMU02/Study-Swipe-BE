import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 개별 공부 태그 데이터 전송 객체
 */
export class StudyTagDto {
  /**
   * 공부 태그 이름
   * @example 'JavaScript', 'React', 'Node.js'
   */
  @IsString({ message: '태그 이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '태그 이름은 필수입니다.' })
  tag_name: string;

  /**
   * 우선순위 (1-5)
   * @example 1, 2, 3, 4, 5
   */
  @IsInt({ message: '우선순위는 정수여야 합니다.' })
  @Min(1, { message: '우선순위는 1 이상이어야 합니다.' })
  @Max(5, { message: '우선순위는 5 이하여야 합니다.' })
  priority: number;

  /**
   * 숙련도 점수 (선택사항)
   * @example 85.5, 92.0
   */
  @IsOptional()
  @IsNumber({}, { message: '숙련도 점수는 숫자여야 합니다.' })
  @Min(0, { message: '숙련도 점수는 0 이상이어야 합니다.' })
  @Max(100, { message: '숙련도 점수는 100 이하여야 합니다.' })
  proficiency_score?: number;

  /**
   * 숙련도 레벨 ID (선택사항)
   * @example 1, 2, 3
   */
  @IsOptional()
  @IsInt({ message: '숙련도 레벨 ID는 정수여야 합니다.' })
  @IsPositive({ message: '숙련도 레벨 ID는 양수여야 합니다.' })
  proficiency_level_id?: number;
}

/**
 * 프로필 공부 태그 생성/업데이트 데이터 전송 객체
 * 최대 5개의 공부 태그를 설정할 수 있습니다.
 */
export class ProfileCreateStudyTagsDto {
  /**
   * 공부 태그 목록 (최대 5개)
   */
  @IsArray({ message: '공부 태그는 배열이어야 합니다.' })
  @ArrayMinSize(1, { message: '최소 1개의 공부 태그가 필요합니다.' })
  @ArrayMaxSize(5, {
    message: '공부 태그는 최대 5개까지만 설정할 수 있습니다.',
  })
  @ValidateNested({ each: true })
  @Type(() => StudyTagDto)
  study_tags: StudyTagDto[];
}
