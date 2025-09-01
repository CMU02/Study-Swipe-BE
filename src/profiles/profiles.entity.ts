import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profiles {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // 서비스에 표시될 사용자의 이름 (닉네임)
  @Column({ nullable: false })
  display_name: string; 

  // 프로필 사진의 URL 주소
  @Column()
  profile_picture: string; 

  // 사용자의 자기소개
  @Column()
  bio: string; 

  // 사용자의 목표 및 다짐 등 
  @Column({ type: 'text' })
  goals: string;

  // 사용자의 나이
  @Column()
  age: string;

  // 성별
  @Column()
  gender: string; 

  /**
   * 1:1 관계이며, 연관관계 주인(즉, profiles 테이블이 외래키 보유)
   */
  @OneToOne(() => User, (user) => user.profiles)
  @JoinColumn()
  user: User;
}
