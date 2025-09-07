import { IsDate, IsInt, IsString, Matches } from 'class-validator';

export class WeeklyAvailabilityItemDto {
  @IsString()
  day_of_week_name: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  start_time: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  end_time: string;
}
