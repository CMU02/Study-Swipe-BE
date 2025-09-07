import { Profiles } from 'src/profiles/profiles.entity';
import { TermsOfUse } from 'src/terms_of_use/terms_of_use';
import { Universities } from 'src/universities/universities.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  // 사용자 아이디
  @Column()
  user_id: string;

  // 사용자 이메일
  @Column({ nullable: true })
  email: string;

  // 사용자 비밀번호
  @Column()
  password: string;

  // 가중치 점수
  @Column({ type: 'float', nullable: true })
  weight_score: number;

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

  @OneToOne(() => TermsOfUse, (termOfUse) => termOfUse.user)
  terms_of_use: TermsOfUse;

  // 대학 정보
  @ManyToOne(() => Universities, (university) => university)
  @JoinColumn()
  universities: Universities;
}
