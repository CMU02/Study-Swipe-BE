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
   * @param score
   */
  async findLevelVyScore(score: number): Promise<ProficiencyLevels> {
    const result = await this.proficiencyLevelRepository
      .createQueryBuilder('p1')
      .where('p1.min_score <= :score', { score })
      .andWhere('p1.max_score >= :score', { score })
      .getOne();

    if (!result) {
      throw new NotFoundException('해당하는 점수 유형의 레벨은 없습니다.');
    }

    return result;
  }
}
