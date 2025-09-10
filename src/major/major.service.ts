import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Major } from './major.entity';

/**
 * 전공 관련 비즈니스 로직을 처리하는 서비스
 * 전공 정보 조회 및 관리 기능을 제공합니다.
 */
@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
  ) {}

  /**
   * ID로 전공 정보를 조회합니다.
   * @param id 전공 ID
   * @returns 전공 엔티티
   * @throws NotFoundException 해당 ID의 전공이 존재하지 않을 경우
   */
  async findMajorById(id: number): Promise<Major> {
    const major = await this.majorRepository.findOne({
      where: { id },
    });

    if (!major) {
      throw new NotFoundException('해당하는 전공이 존재하지 않습니다.');
    }

    return major;
  }

  /**
   * 이름으로 전공을 조회합니다.
   * @param name 전공 이름
   * @returns 전공 엔티티
   * @throws NotFoundException 해당 이름의 전공이 존재하지 않을 경우
   */
  async findMajorByName(name: string): Promise<Major> {
    const major = await this.majorRepository.findOne({
      where: { name },
    });

    if (!major) {
      throw new NotFoundException('해당하는 전공이 존재하지 않습니다.');
    }

    return major;
  }

  /**
   * 전공명으로 전공을 찾거나 없으면 새로 생성합니다.
   * @param name 전공 이름
   * @returns 전공 엔티티 (기존 또는 새로 생성된)
   */
  async findOrCreateMajorByName(name: string): Promise<Major> {
    // 전공명 정리 (앞뒤 공백 제거, 소문자 변환 후 첫 글자만 대문자)
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error('전공명은 비어있을 수 없습니다.');
    }

    // 기존 전공 조회 (대소문자 구분 없이)
    let major = await this.majorRepository.findOne({
      where: { name: trimmedName },
    });

    if (!major) {
      // 전공이 없으면 새로 생성
      major = this.majorRepository.create({ name: trimmedName });
      await this.majorRepository.save(major);
    }

    return major;
  }

  /**
   * 모든 전공 목록을 조회합니다.
   * @returns 전체 전공 목록
   */
  async findAllMajors(): Promise<Major[]> {
    return this.majorRepository.find({
      order: { id: 'ASC' },
    });
  }
}
