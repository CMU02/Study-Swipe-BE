import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 공부 태그 기반 매칭 검색 DTO
 */
export class FindMatchesByTagDto {
  /**
   * 검색할 공부 태그 이름 (선택사항)
   * 제공하지 않으면 전체 사용자 대상으로 매칭
   */
  @IsOptional()
  @IsString({ message: '태그 이름은 문자열이어야 합니다.' })
  tag_name?: string;

  /**
   * 페이지 번호 (기본값: 1)
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 번호는 정수여야 합니다.' })
  @Min(1, { message: '페이지 번호는 1 이상이어야 합니다.' })
  page?: number = 1;

  /**
   * 페이지당 결과 수 (기본값: 20, 최대: 50)
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지당 결과 수는 정수여야 합니다.' })
  @Min(1, { message: '페이지당 결과 수는 1 이상이어야 합니다.' })
  @Max(50, { message: '페이지당 결과 수는 50 이하여야 합니다.' })
  limit?: number = 20;
}
