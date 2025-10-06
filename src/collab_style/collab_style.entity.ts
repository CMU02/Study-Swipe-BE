import { Profiles } from 'src/profiles/profiles.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 협업 성향 정보를 저장하는 엔티티
 * 멘토, 피어, 러너 등의 협업 스타일을 관리합니다.
 */
@Entity({ name: 'collab_style' })
export class CollabStyle {
  @PrimaryGeneratedColumn('increment', { name: 'collab_style_id' })
  id: number;

  /**
   * 협업 성향 이름
   * @example '멘토', '피어', '러너'
   */
  @Column({ unique: true })
  name: string;

  /**
   * 협업 성향 설명
   * @example '가르쳐주고 싶음: 멘토', '같이 성장: 피어', '배우고 싶음: 러너'
   */
  @Column()
  description: string;

  /**
   * 이 협업 성향을 선택한 프로필들 (1:N 관계)
   */
  @OneToMany(() => Profiles, (profile) => profile.collab_style)
  profiles: Profiles[];
}
