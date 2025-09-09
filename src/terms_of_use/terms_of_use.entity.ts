import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TermsOfUse {
  @PrimaryGeneratedColumn('identity', { name: 'terms_of_use_id' })
  id: string;

  @OneToOne(() => User, (user) => user.terms_of_use)
  @JoinColumn({ name: 'user_uuid' })
  user: User;

  @Column({ default: false })
  is_over_18: boolean; // 만 18세

  @Column({ default: false })
  terms_of_service: boolean; // 이용약관

  @Column({ default: false })
  collection_usage_personal_information: boolean; // 개인정보 수집 및 이용 안내

  @Column({ default: false })
  third_party_sharing: boolean; // 제3자 제공 동의

  @Column({ default: false })
  user_alarm_advertisement?: boolean; // 사용자 알림 및 광고안내

  @CreateDateColumn()
  agreed_at: Date;
}
