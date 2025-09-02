import { CollabStyle } from 'src/collab_style/collab_style.entity';
import { Major } from 'src/major/major.entity';
import { MeetingTypes } from 'src/meeting_types/meeting_types';
import { ParticipationTerms } from 'src/participation_terms/participation_terms.entity';
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
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Profiles {
  @PrimaryGeneratedColumn('increment', { name: 'profiles_id' })
  id: number;

  // 서비스에 표시될 사용자의 이름 (닉네임)
  @Column({ nullable: false })
  nickname: string;

  // 프로필 사진의 URL 주소
  @Column()
  image: string;

  // 생년월일
  @Column()
  birth_data: Date;

  // 사용자의 나이
  @Column()
  age: string;

  // 성별
  @Column()
  gender: string;

  // 사용자의 자기소개
  @Column({ type: 'text' })
  bio_note: string;

  // 사용자의 목표 및 다짐 등
  @Column({ type: 'text' })
  goals_note: string;

  // 활동 반경
  @Column({ type: 'integer' })
  activity_radius_km: number;

  // 선호일수
  @Column({ type: 'integer' })
  preferred_days_per_week: number;

  // 팀리더 여부
  @Column()
  team_lead_ok: boolean;

  // 연락방법
  @Column()
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
  @ManyToOne(() => SocialPrefs, (social_pref) => social_pref)
  @JoinColumn()
  social_pref: SocialPrefs;

  // 참여 기간 테이블
  @ManyToOne(
    () => ParticipationTerms,
    (participationTemrs) => participationTemrs.profiles,
  )
  participation_terms: ParticipationTerms;

  /**
   * 프로필에 표시될 지역
   */
  @ManyToMany(() => Regions, { cascade: true, eager: false })
  @JoinTable({
    name: 'profiles_regions', // 생성될 중간 테이블 이름
    joinColumn: { name: 'profiles_id', referencedColumnName: 'profiles_id' },
    inverseJoinColumn: {
      name: 'regions_id',
      referencedColumnName: 'regions_id',
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
    joinColumn: { name: 'profiles_id', referencedColumnName: 'profiles_id' },
    inverseJoinColumn: {
      name: 'meeting_types_id',
      referencedColumnName: 'meeting_types_id',
    },
  })
  meeting_types: MeetingTypes[];

  /**
   * 전공
   */
  @ManyToMany(() => Major, { cascade: true, eager: false })
  @JoinTable({
    name: 'profiles_major',
    joinColumn: { name: 'profiles_id', referencedColumnName: 'profiles_id' },
    inverseJoinColumn: {name: 'major_id', referencedColumnName: 'major_id'}
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
    joinColumn: { name: 'profiles_id', referencedColumnName: 'profiles_id' },
    inverseJoinColumn: {name: 'collab_style_id', referencedColumnName: 'collab_style_id'}
  })
  collab_style: CollabStyle
}
