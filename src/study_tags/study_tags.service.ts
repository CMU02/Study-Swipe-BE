import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudyTags } from './study_tags.entity';
import { Repository } from 'typeorm';
import { ProficiencyLevelsService } from 'src/proficiency_levels/proficiency_levels.service';
import { Profiles } from 'src/profiles/profiles.entity';
import { CanonicalTagsService } from 'src/vector/canonical_tags/canonical_tags.service';

/**
 * 공부 태그 관련 비즈니스 로직을 처리하는 서비스
 * 사용자별 공부 태그 생성, 조회, 수정, 삭제 기능을 제공합니다.
 */
@Injectable()
export class StudyTagsService {
  constructor(
    @InjectRepository(StudyTags)
    private studyTagsRepository: Repository<StudyTags>,
    private proficiencyLevelsService: ProficiencyLevelsService,
    private canonicalTagService: CanonicalTagsService,
  ) {}

  /**
   * 프로필 ID로 공부 태그 목록을 조회합니다.
   * @param profileId 프로필 아이디
   * @returns 해당 사용자가 설정한 공부태그 목록
   */
  async findStudyTagsByProfileId(profileId: number): Promise<StudyTags[]> {
    return this.studyTagsRepository.find({
      where: { profiles: { id: profileId } },
      relations: ['profiles', 'proficiency_levels'],
      order: { priority: 'ASC' },
    });
  }

  /**
   * 사용자의 공부 태그를 생성하거나 업데이트합니다 (Upsert).
   * 기존 태그가 있으면 업데이트하고, 없으면 새로 생성합니다.
   * @param profile 프로필 엔티티
   * @param studyTagsData 공부 태그 데이터 배열
   * @returns 생성/업데이트된 공부 태그 목록
   * @throws BadRequestException 태그 개수가 5개를 초과하거나 우선순위가 중복될 경우
   */
  async createStudyTags(
    profile: Profiles,
    studyTagsData: Array<{
      tag_name: string;
      priority: number;
      proficiency_score?: number;
      proficiency_level_id?: number;
    }>,
  ): Promise<StudyTags[]> {
    // 최대 5개 제한 검증
    if (studyTagsData.length > 5) {
      throw new BadRequestException(
        '공부 태그는 최대 5개까지만 설정할 수 있습니다.',
      );
    }

    // 우선순위 중복 검증
    const priorities = studyTagsData.map((tag) => tag.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      throw new BadRequestException('우선순위는 중복될 수 없습니다.');
    }

    // 우선순위 범위 검증 (1-5)
    const invalidPriorities = priorities.filter((p) => p < 1 || p > 5);
    if (invalidPriorities.length > 0) {
      throw new BadRequestException(
        '우선순위는 1부터 5까지의 값이어야 합니다.',
      );
    }

    // 기존 공부 태그 조회
    const existingTags = await this.findStudyTagsByProfileId(profile.id);

    // 기존 태그를 우선순위별로 매핑
    const existingTagsMap = new Map<number, StudyTags>();
    existingTags.forEach((tag) => {
      existingTagsMap.set(tag.priority, tag);
    });

    const upsertedTags: StudyTags[] = [];

    for (const tagData of studyTagsData) {
      const existingTag = existingTagsMap.get(tagData.priority);

      if (existingTag) {
        // 기존 태그 업데이트
        existingTag.tag_name = tagData.tag_name;

        const updatedTag = await this.studyTagsRepository.save(existingTag);

        // await this.canonicalTagService.resolveOne(updatedTag.tag_name);
        await this.canonicalTagService.insertCanonTagsEmbeddings(
          updatedTag.tag_name,
        );
        upsertedTags.push(updatedTag);

        // 처리된 태그는 맵에서 제거
        existingTagsMap.delete(tagData.priority);
      } else {
        // 새로운 태그 생성
        const studyTag = this.studyTagsRepository.create({
          tag_name: tagData.tag_name,
          priority: tagData.priority,
          proficiency_score: tagData.proficiency_score || 0.0, // 기본 0.0
          proficiency_avg_score: 0.0, // 기본 0.0
          is_survey_completed: false,
          profiles: profile,
          proficiency_levels: null,
        });

        const savedTag = await this.studyTagsRepository.save(studyTag);
        upsertedTags.push(savedTag);
      }
    }

    // 새로운 데이터에 없는 기존 태그들은 삭제
    const tagsToDelete = Array.from(existingTagsMap.values());
    if (tagsToDelete.length > 0) {
      const tagIdsToDelete = tagsToDelete.map((tag) => tag.id);
      await this.studyTagsRepository.delete(tagIdsToDelete);
    }

    // 우선순위 순으로 정렬하여 반환
    return upsertedTags.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 특정 공부 태그의 설문조사 완료 상태를 업데이트합니다.
   * @param tagId 공부 태그 ID
   * @param isCompleted 설문조사 완료 여부
   * @returns 업데이트된 공부 태그
   */
  async updateSurveyStatus(
    tagId: string,
    isCompleted: boolean,
  ): Promise<StudyTags> {
    const studyTag = await this.studyTagsRepository.findOne({
      where: { id: tagId },
    });

    if (!studyTag) {
      throw new BadRequestException('해당하는 공부 태그가 존재하지 않습니다.');
    }

    studyTag.is_survey_completed = isCompleted;
    return this.studyTagsRepository.save(studyTag);
  }

  /**
   * 특정 공부 태그의 숙련도 점수를 업데이트합니다.
   * @param tagId 공부 태그 ID
   * @param proficiencyScore 숙련도 점수
   * @returns 업데이트된 공부 태그
   */
  async updateProficiencyScore(
    tagId: string,
    proficiencyScore: number,
  ): Promise<StudyTags> {
    const studyTag = await this.studyTagsRepository.findOne({
      where: { id: tagId },
    });

    if (!studyTag) {
      throw new BadRequestException('해당하는 공부 태그가 존재하지 않습니다.');
    }

    studyTag.proficiency_score = proficiencyScore;
    return this.studyTagsRepository.save(studyTag);
  }
}
