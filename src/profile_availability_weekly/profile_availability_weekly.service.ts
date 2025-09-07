import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileAvailabilityWeekly } from './profile_availability_weekly.entity';
import { Repository } from 'typeorm';
import { DaysOfWeekService } from 'src/days_of_week/days_of_week.service';
import { BaseResponse, UpsertProps } from 'src/base_response';
import { Profiles } from 'src/profiles/profiles.entity';
import { WeeklyAvailabilityItemDto } from './dto/weekly_availability_item.dto';

@Injectable()
export class ProfileAvailabilityWeeklyService {
  constructor(
    @InjectRepository(ProfileAvailabilityWeekly)
    private availabilityRepository: Repository<ProfileAvailabilityWeekly>,
    @InjectRepository(Profiles)
    private profilesRepository: Repository<Profiles>,
    private dayOfWeeksService: DaysOfWeekService,
  ) {}

  private logger = new Logger(ProfileAvailabilityWeeklyService.name);

  /**
   * 사용자의 주간 가능 시간을 생성하거나 업데이트합니다.
   * @param props uuid와 WeeklyAvailabilityItemDto를 포함하는 객체
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 해당 사용자의 프로필이 존재하지 않을 경우
   */
  async upsertAvailabilityWeekly({
    ...props
  }: UpsertProps<WeeklyAvailabilityItemDto>): Promise<BaseResponse> {
    const { uuid, dto } = props;
    const { day_of_week_name, end_time, start_time } = dto;

    this.logger.log(uuid);

    // 사용자 프로필 조회
    const profile = await this.profilesRepository.findOne({
      where: { user: { uuid } },
    });
    if (!profile) {
      throw new NotFoundException('해당 사용자 프로필은 없습니다.');
    }

    // 요일 정보 조회
    const day_of_week =
      await this.dayOfWeeksService.findDayofWeekName(day_of_week_name);

    // 기존 가능 시간 데이터가 있는지 확인
    let availability = await this.availabilityRepository.findOne({
      where: {
        profiles: { id: profile.id },
      },
    });

    if (availability) {
      // 기존 데이터 업데이트
      availability.days_of_week = day_of_week;
      availability.start_time = start_time;
      availability.end_time = end_time;
    } else {
      // 새로운 데이터 생성
      availability = this.availabilityRepository.create({
        profiles: profile,
        days_of_week: day_of_week,
        start_time,
        end_time,
      });
    }

    // 데이터베이스에 저장
    await this.availabilityRepository.save(availability);

    return {
      status_code: HttpStatus.OK,
      message: '가능 요일 및 시간 설정 완료',
    };
  }
}
