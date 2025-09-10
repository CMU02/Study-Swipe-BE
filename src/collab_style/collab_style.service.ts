import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollabStyle } from './collab_style.entity';

/**
 * 협업 성향 관련 비즈니스 로직을 처리하는 서비스
 * 협업 성향 정보 조회 및 관리 기능을 제공합니다.
 */
@Injectable()
export class CollabStyleService {
  constructor(
    @InjectRepository(CollabStyle)
    private readonly collabStyleRepository: Repository<CollabStyle>,
  ) {}

  /**
   * ID로 협업 성향 정보를 조회합니다.
   * @param id 협업 성향 ID
   * @returns 협업 성향 엔티티
   * @throws NotFoundException 해당 ID의 협업 성향이 존재하지 않을 경우
   */
  async findCollabStyleById(id: number): Promise<CollabStyle> {
    const collabStyle = await this.collabStyleRepository.findOne({
      where: { id },
    });

    if (!collabStyle) {
      throw new NotFoundException('해당하는 협업 성향이 존재하지 않습니다.');
    }

    return collabStyle;
  }

  /**
   * 이름으로 협업 성향을 조회합니다.
   * @param name 협업 성향 이름
   * @returns 협업 성향 엔티티
   * @throws NotFoundException 해당 이름의 협업 성향이 존재하지 않을 경우
   */
  async findCollabStyleByName(name: string): Promise<CollabStyle> {
    const collabStyle = await this.collabStyleRepository.findOne({
      where: { name },
    });

    if (!collabStyle) {
      throw new NotFoundException('해당하는 협업 성향이 존재하지 않습니다.');
    }

    return collabStyle;
  }

  /**
   * 모든 협업 성향 목록을 조회합니다.
   * @returns 전체 협업 성향 목록
   */
  async findAllCollabStyles(): Promise<CollabStyle[]> {
    return this.collabStyleRepository.find({
      order: { id: 'ASC' },
    });
  }
}
