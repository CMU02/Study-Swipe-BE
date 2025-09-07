import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ProfileStudyDto {
  @IsOptional()
  @IsString()
  goals_note?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  activity_radius_km?: number;

  @IsOptional()
  @IsString()
  contact_info: string;

  @IsOptional()
  @IsInt()
  smoking_status_id: number;

  @IsOptional()
  @IsInt()
  social_pref_id: number;

  @IsOptional()
  @IsInt()
  participation_terms: number;

  @IsOptional()
  @IsInt()
  preferred_member_count_id: number;
}
