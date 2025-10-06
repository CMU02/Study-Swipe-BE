import { Profiles } from 'src/profiles/profiles.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class StudyTags {
  @PrimaryGeneratedColumn('uuid', { name: 'study_tags_id' })
  id: string;

  @Column()
  tag_name: string; // 공부 태그 이름

  @Column('int')
  priority: number; // 우선순위 (1 ~ 5)

  @Column('float')
  proficiency_score: number; // 숙련도 점수

  @Column('float')
  proficiency_avg_score: number; // 숙련도 평균 점수

  @Column('float', { nullable: true })
  proficiency_weight_avg_score: number; // 숙련도 가중치 평균 점수

  @Column('boolean')
  is_survey_completed: boolean; // 설문조사 완료 여부

  @Column()
  proficiency_levels: string; // 숙련도 이름

  @ManyToOne(() => Profiles, (profiles) => profiles.study_tags)
  @JoinColumn({ name: 'profiles_id' })
  profiles: Profiles;
}
