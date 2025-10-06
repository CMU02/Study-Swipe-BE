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
 * 참여 정보를 저장하는 엔티티
 * 각 프로필별로 개별적인 참여 기간, 시작/종료 시간 등을 관리합니다.
 */
@Entity({ name: 'participation_info' })
export class participationInfo {
  @PrimaryGeneratedColumn('increment', { name: 'participation_info_id' })
  id: number;

  /**
   * 참여기간 (개월 수)
   * @example 1, 2, 3
   */
  @Column({ type: 'integer' })
  period: number;

  /**
   * 참여기간의 길이 분류
   * @example '단기', '중기', '장기'
   */
  @Column()
  period_length: string;

  /**
   * 시작시간
   * @example '09:00', '14:00'
   */
  @Column()
  start_time: string;

  /**
   * 마침시간
   * @example '18:00', '22:00'
   */
  @Column()
  end_time: string;

  /**
   * 이 참여 정보가 속한 프로필 (1:1 관계, 연관관계 주인)
   */
  @OneToOne(() => Profiles, (profile) => profile.participation_info)
  @JoinColumn({ name: 'profile_id' })
  profile: Profiles;

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

  /**
   * 삭제 일시 (Soft Delete)
   */
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
