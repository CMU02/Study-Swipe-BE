import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/authGuard';
import { BaseResponse } from 'src/base_response';
import { ProfileBasicDto } from './dto/profile_basic.dto';
import { ProfilesService } from './profiles.service';

@UseGuards(AuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('/hello')
  getProfiles() {
    return 'hello';
  }

  @Post('/create-profile')
  createMyProfile(
    @Request() req,
    @Body() dto: ProfileBasicDto,
  ): Promise<BaseResponse> {
    const user_uuid = req.user.uuid;
    return this.profilesService.upsertBasicProfile({
      uuid: user_uuid,
      dto,
      target: 'create',
    });
  }

  @Patch('/update-profile')
  updateMyProfile(
    @Request() req,
    @Body() dto: ProfileBasicDto,
  ): Promise<BaseResponse> {
    const user_uuid = req.user.uuid;
    return this.profilesService.upsertBasicProfile({
      uuid: user_uuid,
      dto,
      target: 'update',
    });
  }
}
