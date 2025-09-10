import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MeetingTypes } from './meeting_types.entity';

/**
 * 모임 유형 관련 비즈니스 로직을 처리하는 서비스
 * 모임 유형 정보 조회 및 관리 기능을 제공합니다.
 */
@Injectable()
export class MeetingTypesService {
  constructor(
    @InjectRepository(MeetingTypes)
    private readonly meetingTypesRepository: Repository<MeetingTypes>,
  ) {}

  /**
   * ID로 모임 유형 정보를 조회합니다.
   * @param id 모임 유형 ID
   * @returns 모임 유형 엔티티
   * @throws NotFoundException 해당 ID의 모임 유형이 존재하지 않을 경우
   */
  async findMeetingTypeById(id: number): Promise<MeetingTypes> {
    const meetingType = await this.meetingTypesRepository.findOne({
      where: { id },
    });

    if (!meetingType) {
      throw new NotFoundException('해당하는 모임 유형이 존재하지 않습니다.');
    }

    return meetingType;
  }

  /**
   * 여러 ID로 모임 유형 정보들을 조회합니다.
   * @param ids 모임 유형 ID 배열
   * @returns 모임 유형 엔티티 배열
   * @throws NotFoundException 존재하지 않는 모임 유형 ID가 포함된 경우
   */
  async findMeetingTypesByIds(ids: number[]): Promise<MeetingTypes[]> {
    if (ids.length === 0) {
      return [];
    }

    const meetingTypes = await this.meetingTypesRepository.find({
      where: { id: In(ids) },
    });

    // 요청된 ID와 조회된 모임 유형 수가 다르면 존재하지 않는 ID가 있음
    if (meetingTypes.length !== ids.length) {
      const foundIds = meetingTypes.map((type) => type.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `다음 모임 유형 ID들이 존재하지 않습니다: ${missingIds.join(', ')}`,
      );
    }

    return meetingTypes;
  }

  /**
   * 이름으로 모임 유형을 조회합니다.
   * @param name 모임 유형 이름
   * @returns 모임 유형 엔티티
   * @throws NotFoundException 해당 이름의 모임 유형이 존재하지 않을 경우
   */
  async findMeetingTypeByName(name: string): Promise<MeetingTypes> {
    const meetingType = await this.meetingTypesRepository.findOne({
      where: { name },
    });

    if (!meetingType) {
      throw new NotFoundException('해당하는 모임 유형이 존재하지 않습니다.');
    }

    return meetingType;
  }

  /**
   * 모든 모임 유형 목록을 조회합니다.
   * @returns 전체 모임 유형 목록
   */
  async findAllMeetingTypes(): Promise<MeetingTypes[]> {
    return this.meetingTypesRepository.find({
      order: { id: 'ASC' },
    });
  }
}
