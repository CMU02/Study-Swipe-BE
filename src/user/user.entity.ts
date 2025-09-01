import { Profiles } from 'src/profiles/profiles.entity';
import {
    BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 사용자 이메일
  @Column()
  email: string;

  // 사용자 비밀번호
  @Column()
  password: string;

  // 대학교 이메일 주소
  @Column()
  university_domain: string;

  // 대학교 이메일 인증/미인증 여부
  @Column({ default: false })
  university_verified: boolean;

  // 대학교 이메일 인증 시간
  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  // 계정 생성 시간
  @CreateDateColumn({ type: 'timestamp' })
  create_at: Date;

  @OneToOne(() => Profiles, (profiles) => profiles.user)
  profiles: Profiles;

  /**
   * 비밀번호 해싱 메서드 추가
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
