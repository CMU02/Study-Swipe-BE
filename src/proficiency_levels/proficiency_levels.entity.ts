import { StudyTags } from 'src/study_tags/study_tags.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class ProficiencyLevels {
  @PrimaryColumn({ name: 'proficiency_levels_id' })
  id: number; // 설문조사 점수 식별 아이디

  /**
   * 3~6: 초급, 7~11: 중급, 12~15: 상급
   */
  @Column()
  level_name: string; // 레벨이름 (초급, 중급, 상급)
  @Column({ type: 'float8' })
  min_score: number; // 해당 레벨이 되기 위한 최소점수
  @Column({ type: 'float8' })
  max_score: number; // 해당 레벨이 되기 위한 최대점수

  @OneToMany(() => StudyTags, (study_tags) => study_tags.proficiency_levels)
  study_tags: StudyTags;
}
