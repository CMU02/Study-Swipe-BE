import { Profiles } from 'src/profiles/profiles.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 모임 유형 정보를 저장하는 엔티티
 * 온라인, 오프라인, 혼합 등의 모임 형태를 관리합니다.
 */
@Entity({ name: 'meeting_types' })
export class MeetingTypes {
  @PrimaryGeneratedColumn('increment', { name: 'meeting_types_id' })
  id: number;

  /**
   * 모임 유형 이름
   * @example '온라인', '오프라인', '혼합'
   */
  @Column({ unique: true })
  name: string;

  /**
   * 이 모임 유형을 선택한 프로필들 (M:N 관계)
   */
  @ManyToMany(() => Profiles, (profile) => profile.meeting_types)
  profiles: Profiles[];
}
