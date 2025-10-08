import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * city_second 기준으로 중복 제거하되, 각 city_second에 대해 하나의 regions_id를 반환합니다.
   * @param cityFirst 시/도 이름
   * @returns 해당 시/도의 지역 목록 (city_second 중복 제거)
   */
  async findRegionsByCityFirst(
    cityFirst: string,
  ): Promise<
    { city_first: string; city_second: string; regions_id: string }[]
  > {
    return this.regionsRepository
      .createQueryBuilder('regions')
      .select([
        'regions.city_first as city_first',
        'regions.city_second as city_second',
        'MIN(regions.id) as regions_id',
      ])
      .where('regions.city_first = :cityFirst', { cityFirst })
      .groupBy('regions.city_first, regions.city_second')
      .orderBy('regions.city_second', 'ASC')
      .getRawMany();
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
