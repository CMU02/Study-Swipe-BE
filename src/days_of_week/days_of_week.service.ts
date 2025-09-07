import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DaysOfWeek } from './days_of_week.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DaysOfWeekService {
  constructor(
    @InjectRepository(DaysOfWeek)
    private daysOfWeekRepository: Repository<DaysOfWeek>,
  ) {}

  /**
   * 요일 이름으로 요일 정보를 조회합니다.
   * @param name 요일(ex: 월요일, 화요일, ...)
   * @returns 조회된 요일 엔티티
   * @throws NotFoundException 해당 요일이 존재하지 않을 경우
   */
  async findDayofWeekName(name: string): Promise<DaysOfWeek> {
    // 요일 이름으로 데이터베이스에서 요일 정보 조회
    const result = await this.daysOfWeekRepository.findOne({ where: { name } });

    // 조회 결과가 없으면 예외 발생
    if (!result) {
      throw new NotFoundException('해당 요일은 없습니다.');
    }

    return result;
  }
}
