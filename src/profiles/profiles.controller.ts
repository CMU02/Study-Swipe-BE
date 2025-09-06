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
import { UpdateProfileBasicDto } from './dto/update_profile_basic.dto';
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
    @Body() dto: UpdateProfileBasicDto,
  ): Promise<BaseResponse> {
    const user_id = req.user.id;
    return this.profilesService.upsertBasicProfile(user_id, dto);
  }

  @Patch('/update-profile')
  updateMyProfile(
    @Request() req,
    @Body() dto: UpdateProfileBasicDto,
  ): Promise<BaseResponse> {
    const user_id = req.user.id;
    return this.profilesService.upsertBasicProfile(user_id, dto);
  }
}
