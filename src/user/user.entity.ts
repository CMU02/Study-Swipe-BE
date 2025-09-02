import { Profiles } from 'src/profiles/profiles.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Universities } from 'src/universities/universities.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 사용자 이메일
  @Column()
  email: string;

  // 사용자 비밀번호
  @Column()
  password: string;

  // 이메일 인증/미인증 여부 기본(미인증)
  @Column({ default: false })
  email_verified: boolean;

  // 이메일 인증 시간
  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  // 계정 생성 시간
  @CreateDateColumn({ type: 'timestamp' })
  create_at: Date;

  // 프로필
  @OneToOne(() => Profiles, (profiles) => profiles.user)
  profiles: Profiles;

  // 대학 정보
  @ManyToOne(() => Universities, (university) => university)
  @JoinColumn()
  universities: Universities 
  
  /**
   * 비밀번호 해싱 메서드 추가
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
