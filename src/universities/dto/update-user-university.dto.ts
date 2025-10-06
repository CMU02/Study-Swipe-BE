import { IsString, IsNotEmpty, Length } from 'class-validator';

export class UpdateUserUniversityDto {
  /**
   * 대학교 이름
   * @example "서울대학교"
   */
  @IsString({ message: '대학교 이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '대학교 이름을 입력해주세요.' })
  @Length(2, 100, {
    message: '대학교 이름은 2자 이상 100자 이하로 입력해주세요.',
  })
  universityName: string;
}
