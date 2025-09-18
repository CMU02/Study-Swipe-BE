import { ProficiencyLevels } from 'src/proficiency_levels/proficiency_levels.entity';
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

  @Column('boolean')
  is_survey_completed: boolean; // 설문조사 완료 여부

  @ManyToOne(
    () => ProficiencyLevels,
    (proficiency_level) => proficiency_level.study_tags,
  )
  @JoinColumn({ name: 'proficiency_levels_id' })
  proficiency_levels: ProficiencyLevels | null;

  @ManyToOne(() => Profiles, (profiles) => profiles.study_tags)
  @JoinColumn({ name: 'profiles_id' })
  profiles: Profiles;
}
