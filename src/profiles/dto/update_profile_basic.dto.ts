import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * 기본정보
 */
export class UpdateProfileBasicDto {
  @IsOptional()
  @IsString()
  display_name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsDate()
  birth_data?: Date;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  bio_note?: string;
}
