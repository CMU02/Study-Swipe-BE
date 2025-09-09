import { Profiles } from 'src/profiles/profiles.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 사교모임 선호도 정보를 저장하는 엔티티
 * 사교모임 가능 여부에 대한 선택지를 관리합니다.
 */
@Entity({ name: 'social_prefs' })
export class SocialPrefs {
  @PrimaryGeneratedColumn('increment', { name: 'social_pref_id' })
  id: number;

  /**
   * 사교모임 선호도 이름
   * @example '네', '아니오', '가끔'
   */
  @Column({ unique: true })
  name: string;

  /**
   * 이 선호도를 선택한 프로필들 (1:N 관계)
   */
  @OneToMany(() => Profiles, (profiles) => profiles.social_pref)
  profiles: Profiles[];
}
