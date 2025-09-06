import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Profiles } from './profiles.entity';
import { UpdateProfileBasicDto } from './dto/update_profile_basic.dto';
import { BaseResponse } from 'src/base_response';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profiles)
    private profilesRepository: Repository<Profiles>,
    private userService: UserService,
  ) {}

  async upsertBasicProfile(
    id: string,
    dto: UpdateProfileBasicDto,
  ): Promise<BaseResponse> {
    const user = await this.userService.findUserUuid(id);
    let profile = await this.profilesRepository.findOne({
      where: { user: { id } },
    });

    if (!profile) {
      profile = this.profilesRepository.create({ user });
    }

    /**
     * DTO의 데이터를 기존 프로필 또는 새 프로필 객체에 병합
     * Object.assign을 사용하면 DTO에 있는 필드만 업데이트 적용
     */
    Object.assign(profile, dto);
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.CREATED,
      message: '프로필 업데이트 성공',
    };
  }
}
