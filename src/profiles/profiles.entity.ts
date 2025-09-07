import { CollabStyle } from 'src/collab_style/collab_style.entity';
import { Major } from 'src/major/major.entity';
import { MeetingTypes } from 'src/meeting_types/meeting_types.entity';
import { ParticipationTerms } from 'src/participation_terms/participation_terms.entity';
import { PreferredMemberCount } from 'src/preferred_member_count/preferred_member_count.entity';
import { ProfileAvailabilityWeekly } from 'src/profile_availability_weekly/profile_availability_weekly.entity';
import { Regions } from 'src/regions/regions.entity';
import { SmokingStatus } from 'src/smoking_status/smoking_status.entity';
import { SocialPrefs } from 'src/social_prefs/social_prefs.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Profiles {
  @PrimaryGeneratedColumn('increment', { name: 'profiles_id' })
  id: number;

  // 서비스에 표시될 사용자의 이름 (닉네임)
  @Column({ nullable: true })
  display_name: string;

  // 프로필 사진의 URL 주소
  @Column({ nullable: true })
  image: string;

  // 생년월일
  @Column({ nullable: true })
  birth_data: Date;

  // 사용자의 나이
  @Column({ nullable: true })
  age: number;

  // 성별
  @Column({ nullable: true })
  gender: string;

  // 사용자의 자기소개
  @Column({ type: 'text', nullable: true })
  bio_note: string;

  // 사용자의 목표 및 다짐 등
  @Column({ type: 'text', nullable: true })
  goals_note: string;

  // 활동 반경
  @Column({ type: 'integer', nullable: true })
  activity_radius_km: number;

  // 선호 인원 수
  @OneToOne(() => PreferredMemberCount, (pmc) => pmc.profiles)
  preferred_member_count: PreferredMemberCount;

  // 연락방법
  @Column({ nullable: true })
  contact_info: string;

  // 사용자 외래키 1:1
  @OneToOne(() => User, (user) => user.profiles)
  @JoinColumn()
  user: User;

  // 흡연여부 외래키 N:1
  @ManyToOne(() => SmokingStatus, (smoking_status) => smoking_status.profiles)
  @JoinColumn()
  smoking_status: SmokingStatus;

  /**
   * 사교모임 가능 여부 N:1
   * @example 네, 아니오, 가끔
   */
  @ManyToOne(() => SocialPrefs, (social_pref) => social_pref.profiles)
  @JoinColumn()
  social_pref: SocialPrefs;

  // 참여 기간 테이블
  @ManyToOne(
    () => ParticipationTerms,
    (participationTemrs) => participationTemrs.profiles,
  )
  @JoinColumn()
  participation_terms: ParticipationTerms;

  // 가능 요일 및 시간(외래키)
  @OneToMany(() => ProfileAvailabilityWeekly, (paw) => paw.profiles)
  profile_availability_weekly: ProfileAvailabilityWeekly;

  /**
   * 프로필에 표시될 지역
   */
  @ManyToMany(() => Regions, { cascade: true, eager: false })
  @JoinTable({
    name: 'profiles_regions', // 생성될 중간 테이블 이름
    joinColumn: { name: 'profiles_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'regions_id',
      referencedColumnName: 'id',
    },
  })
  regions: Regions[];

  /**
   * 모임유형
   * - 온라인, 오프라인, 혼합
   */
  @ManyToMany(() => MeetingTypes, { cascade: true, eager: false })
  @JoinTable({
    name: 'profiles_meeting_types',
    joinColumn: { name: 'profiles_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'meeting_types_id',
      referencedColumnName: 'id',
    },
  })
  meeting_types: MeetingTypes[];

  /**
   * 전공
   */
  @ManyToMany(() => Major, { cascade: true, eager: false })
  @JoinTable({
    name: 'profiles_major',
    joinColumn: { name: 'profiles_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'major_id', referencedColumnName: 'id' },
  })
  major: Major[];

  /**
   * 협업 성향(단일 선택)
   * - 가르쳐주고 싶음(멘토)
   * - 같이 성장(피어)
   * - 배우고 싶음(러너)
   */
  @ManyToMany(() => CollabStyle, (collab) => collab.profiles)
  @JoinTable({
    name: 'profiles_collab_style',
    joinColumn: { name: 'profiles_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'collab_style_id',
      referencedColumnName: 'id',
    },
  })
  collab_style: CollabStyle;
}
