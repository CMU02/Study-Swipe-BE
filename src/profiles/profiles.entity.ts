import { CollabStyle } from 'src/collab_style/collab_style.entity';
import { Major } from 'src/major/major.entity';
import { MeetingTypes } from 'src/meeting_types/meeting_types.entity';
import { participationInfo } from 'src/participation_info/participation_info.entity';
import { PreferredMemberCount } from 'src/preferred_member_count/preferred_member_count.entity';
import { Regions } from 'src/regions/regions.entity';
import { SmokingStatus } from 'src/smoking_status/smoking_status.entity';
import { SocialPrefs } from 'src/social_prefs/social_prefs.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 사용자 프로필 정보를 저장하는 엔티티
 * 기본 정보, 학습 선호도, 매칭 조건 등을 포함합니다.
 */
@Entity({ name: 'profiles' })
export class Profiles {
  @PrimaryGeneratedColumn('increment', { name: 'profiles_id' })
  id: number;

  /**
   * 서비스에 표시될 사용자의 이름 (닉네임)
   */
  @Column({ name: 'display_name', nullable: true })
  display_name: string;

  /**
   * 프로필 사진의 URL 주소
   */
  @Column({ nullable: true })
  image: string;

  /**
   * 생년월일
   */
  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birth_date: Date;

  /**
   * 사용자의 나이
   */
  @Column({ type: 'integer', nullable: true })
  age: number;

  /**
   * 성별 (남성, 여성)
   */
  @Column({ nullable: true })
  gender: string;

  /**
   * 사용자의 자기소개
   */
  @Column({ name: 'bio_note', type: 'text', nullable: true })
  bio_note: string;

  /**
   * 사용자의 목표 및 다짐
   */
  @Column({ name: 'goals_note', type: 'text', nullable: true })
  goals_note: string;

  /**
   * 활동 반경 (킬로미터 단위)
   */
  @Column({ name: 'activity_radius_km', type: 'integer', nullable: true })
  activity_radius_km: number;

  /**
   * 선호 인원 수
   */
  @OneToOne(() => PreferredMemberCount, (pmc) => pmc.profiles, {
    nullable: true,
  })
  @JoinColumn({ name: 'preferred_member_count_id' })
  preferred_member_count: PreferredMemberCount | null;

  /**
   * 연락 방법 (카카오톡, 디스코드 등)
   */
  @Column({ name: 'contact_info', nullable: true })
  contact_info: string;

  /**
   * 사용자 정보 (1:1 관계)
   */
  @OneToOne(() => User, (user) => user.profiles)
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  /**
   * 흡연 상태 (N:1 관계)
   */
  @ManyToOne(() => SmokingStatus, (smoking_status) => smoking_status.profiles, {
    nullable: true,
  })
  @JoinColumn({ name: 'smoking_status_id' })
  smoking_status: SmokingStatus | null;

  /**
   * 사교모임 가능 여부 (N:1 관계)
   * @example 네, 아니오, 가끔
   */
  @ManyToOne(() => SocialPrefs, (social_pref) => social_pref.profiles, {
    nullable: true,
  })
  @JoinColumn({ name: 'social_pref_id' })
  social_pref: SocialPrefs | null;

  /**
   * 참여 정보 (1:1 관계)
   */
  @OneToOne(
    () => participationInfo,
    (participationInfo) => participationInfo.profile,
    { nullable: true },
  )
  participation_info: participationInfo | null;

  /**
   * 프로필에 표시될 지역 (N:1 관계, 단일 선택)
   */
  @ManyToOne(() => Regions, (region) => region.profiles, { nullable: true })
  @JoinColumn({ name: 'region_id' })
  region: Regions;

  /**
   * 모임유형 (N:1 관계, 단일 선택)
   * - 온라인, 오프라인, 혼합
   */
  @ManyToOne(() => MeetingTypes, (meetingType) => meetingType.profiles, {
    nullable: true,
  })
  @JoinColumn({ name: 'meeting_type_id' })
  meeting_type: MeetingTypes;

  /**
   * 전공 (N:1 관계, 단일 선택)
   * - 컴퓨터공학, 경영학, 디자인학 등
   */
  @ManyToOne(() => Major, (major) => major.profiles, { nullable: true })
  @JoinColumn({ name: 'major_id' })
  major: Major | null;

  /**
   * 협업 성향 (N:1 관계, 단일 선택)
   * - 가르쳐주고 싶음(멘토)
   * - 같이 성장(피어)
   * - 배우고 싶음(러너)
   */
  @ManyToOne(() => CollabStyle, (collab) => collab.profiles, { nullable: true })
  @JoinColumn({ name: 'collab_style_id' })
  collab_style: CollabStyle | null;

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
