import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Regions } from './regions.entity';

/**
 * 지역 관련 비즈니스 로직을 처리하는 서비스
 * 지역 정보 조회 및 관리 기능을 제공합니다.
 */
@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Regions)
    private readonly regionsRepository: Repository<Regions>,
  ) {}

  /**
   * ID로 지역 정보를 조회합니다.
   * @param id 지역 ID
   * @returns 지역 엔티티
   * @throws NotFoundException 해당 ID의 지역이 존재하지 않을 경우
   */
  async findRegionById(id: string): Promise<Regions> {
    const region = await this.regionsRepository.findOne({
      where: { id },
    });

    if (!region) {
      throw new NotFoundException('해당하는 지역 정보가 존재하지 않습니다.');
    }

    return region;
  }

  /**
   * ID로 지역 정보를 조회합니다.
   * @param id 지역 ID
   * @returns 지역 엔티티
   * @throws NotFoundException 존재하지 않는 지역 ID가 포함된 경우
   */
  async findRegionsByIds(id: string): Promise<Regions> {
    const regions = await this.regionsRepository.findOne({
      where: { id },
    });
    if (!regions) {
      throw new NotFoundException('해당 지역 ID가 존재하지 않습니다.');
    }
    return regions;
  }

  /**
   * 시/도로 지역 목록을 조회합니다.
   * @param cityFirst 시/도 이름
   * @returns 해당 시/도의 지역 목록
   */
  async findRegionsByCityFirst(cityFirst: string): Promise<Regions[]> {
    return this.regionsRepository.find({
      where: { city_first: cityFirst },
      order: { city_second: 'ASC' },
    });
  }

  /**
   * 모든 지역 목록을 조회합니다.
   * @returns 전체 지역 목록
   */
  async findAllRegions(): Promise<Regions[]> {
    return this.regionsRepository.find();
  }

  /**
   * 시/도 목록을 조회합니다 (중복 제거).
   * @returns 시/도 목록
   */
  async findAllCityFirst(): Promise<string[]> {
    const result = await this.regionsRepository
      .createQueryBuilder('regions')
      .select('DISTINCT regions.city_first', 'city_first')
      .orderBy('regions.city_first', 'ASC')
      .getRawMany();

    return result.map((item) => item.city_first);
  }
}
