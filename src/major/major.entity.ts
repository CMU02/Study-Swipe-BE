import { Profiles } from 'src/profiles/profiles.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 전공 정보를 저장하는 엔티티
 * 컴퓨터공학, 경영학, 디자인 등의 전공 분야를 관리합니다.
 */
@Entity({ name: 'major' })
export class Major {
  @PrimaryGeneratedColumn('increment', { name: 'major_id' })
  id: number;

  /**
   * 전공 이름
   * @example '컴퓨터공학', '경영학', '디자인학', '심리학'
   */
  @Column()
  name: string;

  /**
   * 이 전공을 선택한 프로필들 (1:N 관계)
   */
  @OneToMany(() => Profiles, (profile) => profile.major)
  profiles: Profiles[];
}
