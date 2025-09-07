import {
  Body,
  Controller,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/authGuard';
import { BaseResponse } from 'src/base_response';
import { WeeklyAvailabilityItemDto } from './dto/weekly_availability_item.dto';
import { ProfileAvailabilityWeeklyService } from './profile_availability_weekly.service';

@Controller('profile-availability-weekly')
@UseGuards(AuthGuard)
export class ProfileAvailabilityWeeklyController {
  constructor(
    private availabilityWeeklyService: ProfileAvailabilityWeeklyService,
  ) {}

  private logger = new Logger(ProfileAvailabilityWeeklyController.name);

  @Post('/update')
  updateAvailiabilityWeekly(
    @Request() req,
    @Body() dto: WeeklyAvailabilityItemDto,
  ): Promise<BaseResponse> {
    this.logger.log(`req.user: ${req.user}`);
    const user_uuid = req.user.uuid;
    return this.availabilityWeeklyService.upsertAvailabilityWeekly({
      dto,
      uuid: user_uuid,
    });
  }
}
