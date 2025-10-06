import { Profiles } from 'src/profiles/profiles.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 지역 정보를 저장하는 엔티티
 * 시/도, 시/군/구 정보와 위치 좌표를 관리합니다.
 */
@Entity({ name: 'regions' })
export class Regions {
  @PrimaryColumn({ name: 'regions_id' })
  id: string;

  /**
   * 시/도 (예: 서울특별시, 경기도)
   */
  @Column({ name: 'city_first' })
  city_first: string;

  /**
   * 시/군/구 (예: 강남구, 수원시)
   */
  @Column({ name: 'city_second', nullable: true })
  city_second: string;

  /**
   * 위도 좌표
   */
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  lat: number;

  /**
   * 경도 좌표
   */
  @Column({ type: 'decimal', precision: 11, scale: 8 })
  lng: number;

  /**
   * 이 지역을 선택한 프로필들 (1:N 관계)
   */
  @OneToMany(() => Profiles, (profile) => profile.region)
  profiles: Profiles[];
}
