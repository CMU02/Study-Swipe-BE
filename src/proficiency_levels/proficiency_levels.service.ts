import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProficiencyLevels } from './proficiency_levels.entity';

@Injectable()
export class ProficiencyLevelsService {
  constructor(
    @InjectRepository(ProficiencyLevels)
    private proficiencyLevelRepository: Repository<ProficiencyLevels>,
  ) {}

  /**
   * 사용자 점수에 해당하는 레벨을 찾아서 반환
   * @param score 사용자 점수 (소수점 포함 가능, 1.0~15.0 범위)
   */
  async findLevelVyScore(score: number): Promise<ProficiencyLevels> {
    // 점수 범위 검증 (1.0 ~ 15.0)
    if (score < 1.0 || score > 15.0) {
      throw new NotFoundException(
        `점수는 1.0 ~ 15.0 범위여야 합니다. 입력된 점수: ${score}`,
      );
    }

    // 소수점 점수를 그대로 사용 (엔티티가 float 타입으로 변경됨)
    const result = await this.proficiencyLevelRepository
      .createQueryBuilder('p1')
      .where('p1.min_score <= :score', { score })
      .andWhere('p1.max_score >= :score', { score })
      .getOne();

    if (!result) {
      throw new NotFoundException(
        `점수 ${score}에 해당하는 숙련도 레벨을 찾을 수 없습니다. 데이터베이스에 적절한 레벨 범위가 설정되어 있는지 확인해주세요.`,
      );
    }

    return result;
  }

  /**
   * 모든 숙련도 레벨을 조회합니다.
   * @returns 숙련도 레벨 목록
   */
  async findAllLevels(): Promise<ProficiencyLevels[]> {
    return this.proficiencyLevelRepository.find({
      order: { min_score: 'ASC' },
    });
  }
}
