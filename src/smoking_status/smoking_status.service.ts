import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmokingStatus } from './smoking_status.entity';

@Injectable()
export class SmokingStatusService {
  constructor(
    @InjectRepository(SmokingStatus)
    private smokingStatusRepository: Repository<SmokingStatus>,
  ) {}

  /**
   * 흡연 상태 이름으로 흡연 상태 정보를 조회합니다.
   * @param name 흡연 상태 이름 (예: '흡연', '비흡연', '무관')
   * @returns 조회된 흡연 상태 엔티티
   * @throws NotFoundException 해당하는 흡연 상태가 존재하지 않을 경우
   */
  async findSmokingStatusName(name: string): Promise<SmokingStatus> {
    // 흡연 상태 이름으로 데이터베이스에서 조회
    const smokingStatus = await this.smokingStatusRepository.findOne({
      where: { name },
    });

    // 조회 결과가 없으면 예외 발생
    if (!smokingStatus) {
      throw new NotFoundException('해당하는 흡연 상태가 존재하지 않습니다.');
    }

    return smokingStatus;
  }
}
