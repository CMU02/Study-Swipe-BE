import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTermsOfUseDto {
  @IsString()
  @IsNotEmpty()
  readonly user_id: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly is_over_18: boolean;

  @IsBoolean()
  @IsNotEmpty() // 필수 항목
  readonly terms_of_service: boolean;

  @IsBoolean()
  @IsNotEmpty() // 필수 항목
  readonly collection_usage_personal_informaiton: boolean;

  @IsBoolean()
  @IsNotEmpty()
  readonly third_party_sharing: boolean;

  @IsBoolean()
  @IsOptional() // 선택 항목
  readonly user_alarm_advertisement?: boolean;
}
