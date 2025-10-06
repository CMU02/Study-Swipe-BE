import { Profiles } from 'src/profiles/profiles.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 선호 인원 수 정보를 저장하는 엔티티
 * 스터디 그룹의 최소/최대 인원 수 선호도를 관리합니다.
 */
@Entity({ name: 'preferred_member_count' })
export class PreferredMemberCount {
  @PrimaryGeneratedColumn('increment', { name: 'preferred_member_count_id' })
  id: number;

  /**
   * 최소 선호 인원 수 (2-10명)
   */
  @Column({ name: 'min_member_count', type: 'integer' })
  min_member_count: number;

  /**
   * 최대 선호 인원 수 (2-10명)
   */
  @Column({ name: 'max_member_count', type: 'integer' })
  max_member_count: number;

  /**
   * 이 선호도를 가진 프로필 (1:1 관계)
   */
  @OneToOne(() => Profiles, (profile) => profile.preferred_member_count)
  profiles: Profiles;

  /**
   * 생성 일시
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * 수정 일시
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
