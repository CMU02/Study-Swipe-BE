import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profiles } from 'src/profiles/profiles.entity';
import { StudyTags } from 'src/study_tags/study_tags.entity';
import { User } from 'src/user/user.entity';
import {
  calculateLifestyleScore,
  normalizeTagScore,
  normalizeUserScore,
  calculateFinalMatchScore,
} from './utils/calculate-match-score';
import {
  formatMatchResults,
  MatchResultDto,
} from './utils/format-match-result';
import { FindMatchesByTagDto } from './dto/find-matches-by-tag.dto';

/**
 * 매칭 시스템 서비스
 * 공부 태그 기반 사용자 매칭 및 추천 기능을 제공합니다.
 */
@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Profiles)
    private profilesRepository: Repository<Profiles>,
    @InjectRepository(StudyTags)
    private studyTagsRepository: Repository<StudyTags>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 공부 태그 기반 매칭 사용자 목록 조회
   * @param userUuid 현재 사용자 UUID
   * @param dto 검색 조건 (태그 이름, 페이지, 제한)
   * @returns 매칭된 사용자 목록 및 페이지네이션 정보
   */
  async findMatchesByTag(
    userUuid: string,
    dto: FindMatchesByTagDto,
  ): Promise<{
    matches: MatchResultDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const { tag_name, page = 1, limit = 20 } = dto;

    // 1. 현재 사용자 정보 조회
    const currentUser = await this.userRepository.findOne({
      where: { uuid: userUuid },
      relations: ['profiles'],
    });

    if (!currentUser || !currentUser.profiles) {
      throw new NotFoundException('사용자 프로필을 찾을 수 없습니다.');
    }

    // 2. 매칭 대상 프로필 조회 (성능 최적화: 필요한 관계만 로드)
    let matchedProfiles: Profiles[];
    let totalCount: number;

    if (tag_name) {
      // 특정 태그를 가진 사용자 검색
      const result = await this.findProfilesByTag(
        tag_name,
        currentUser.profiles.id,
        page,
        limit,
      );
      matchedProfiles = result.profiles;
      totalCount = result.total;
    } else {
      // 전체 사용자 대상 매칭
      const result = await this.findAllProfiles(
        currentUser.profiles.id,
        page,
        limit,
      );
      matchedProfiles = result.profiles;
      totalCount = result.total;
    }

    // 3. 각 프로필의 매칭 점수 계산
    const matchScores = await this.calculateMatchScores(
      matchedProfiles,
      tag_name,
      currentUser.weight_avg_score,
    );

    // 4. 매칭 점수 기준으로 정렬
    const sortedProfiles = this.sortProfilesByMatchScore(
      matchedProfiles,
      matchScores,
    );

    // 5. 결과 포맷팅
    const formattedMatches = formatMatchResults(sortedProfiles, matchScores);

    return {
      matches: formattedMatches,
      pagination: {
        page,
        limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * 특정 태그를 가진 프로필 조회 (성능 최적화)
   * @param tagName 태그 이름
   * @param currentProfileId 현재 사용자 프로필 ID (제외용)
   * @param page 페이지 번호
   * @param limit 페이지당 결과 수
   * @returns 프로필 목록 및 총 개수
   */
  private async findProfilesByTag(
    tagName: string,
    currentProfileId: number,
    page: number,
    limit: number,
  ): Promise<{ profiles: Profiles[]; total: number }> {
    // QueryBuilder를 사용한 성능 최적화
    const queryBuilder = this.profilesRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.universities', 'universities')
      .leftJoinAndSelect('profile.major', 'major')
      .leftJoinAndSelect('profile.region', 'region')
      .leftJoinAndSelect('profile.participation_info', 'participation_info')
      .leftJoinAndSelect('profile.collab_style', 'collab_style')
      .leftJoinAndSelect('profile.meeting_type', 'meeting_type')
      .leftJoinAndSelect('profile.smoking_status', 'smoking_status')
      .leftJoinAndSelect(
        'profile.preferred_member_count',
        'preferred_member_count',
      )
      .leftJoinAndSelect('profile.study_tags', 'study_tags')
      .where('profile.id != :currentProfileId', { currentProfileId })
      .andWhere('profile.deleted_at IS NULL')
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('st.profiles_id')
          .from(StudyTags, 'st')
          .where('st.tag_name = :tagName', { tagName })
          .getQuery();
        return 'profile.id IN ' + subQuery;
      });

    // 총 개수 조회
    const total = await queryBuilder.getCount();

    // 페이지네이션 적용
    const profiles = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { profiles, total };
  }

  /**
   * 전체 프로필 조회 (태그 필터 없음)
   * @param currentProfileId 현재 사용자 프로필 ID (제외용)
   * @param page 페이지 번호
   * @param limit 페이지당 결과 수
   * @returns 프로필 목록 및 총 개수
   */
  private async findAllProfiles(
    currentProfileId: number,
    page: number,
    limit: number,
  ): Promise<{ profiles: Profiles[]; total: number }> {
    const queryBuilder = this.profilesRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.universities', 'universities')
      .leftJoinAndSelect('profile.major', 'major')
      .leftJoinAndSelect('profile.region', 'region')
      .leftJoinAndSelect('profile.participation_info', 'participation_info')
      .leftJoinAndSelect('profile.collab_style', 'collab_style')
      .leftJoinAndSelect('profile.meeting_type', 'meeting_type')
      .leftJoinAndSelect('profile.smoking_status', 'smoking_status')
      .leftJoinAndSelect(
        'profile.preferred_member_count',
        'preferred_member_count',
      )
      .leftJoinAndSelect('profile.study_tags', 'study_tags')
      .where('profile.id != :currentProfileId', { currentProfileId })
      .andWhere('profile.deleted_at IS NULL');

    // 총 개수 조회
    const total = await queryBuilder.getCount();

    // 페이지네이션 적용
    const profiles = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { profiles, total };
  }

  /**
   * 각 프로필의 매칭 점수 계산
   * @param profiles 프로필 목록
   * @param tagName 검색한 태그 이름 (선택사항)
   * @param currentUserWeightScore 현재 사용자의 전체 가중치 점수
   * @returns 프로필 ID와 매칭 점수 맵
   */
  private async calculateMatchScores(
    profiles: Profiles[],
    tagName: string | undefined,
    currentUserWeightScore: number | null,
  ): Promise<Map<number, number>> {
    const matchScores = new Map<number, number>();

    for (const profile of profiles) {
      // 1. 생활 패턴 점수 계산
      const lifestyleScore = calculateLifestyleScore(
        profile.participation_info,
      );

      // 2. 공부 태그 점수 계산
      let studyScore: number;

      if (tagName) {
        // 특정 태그 선택: 해당 태그의 가중치 점수 사용
        const studyTagsArray = Array.isArray(profile.study_tags)
          ? profile.study_tags
          : [];
        const matchedTag = studyTagsArray.find(
          (tag) => tag.tag_name === tagName,
        );

        if (matchedTag && matchedTag.proficiency_weight_avg_score) {
          studyScore = normalizeTagScore(
            matchedTag.proficiency_weight_avg_score,
          );
        } else {
          studyScore = 0.5; // 기본값
        }
      } else {
        // 태그 미선택: 사용자 전체 가중치 점수 사용
        if (
          profile.user?.weight_avg_score !== null &&
          profile.user?.weight_avg_score !== undefined
        ) {
          studyScore = normalizeUserScore(profile.user.weight_avg_score);
        } else {
          studyScore = 0.5; // 기본값
        }
      }

      // 3. 최종 매칭 점수 계산
      const finalScore = calculateFinalMatchScore(lifestyleScore, studyScore);

      matchScores.set(profile.id, finalScore);
    }

    return matchScores;
  }

  /**
   * 매칭 점수 기준으로 프로필 정렬
   * @param profiles 프로필 목록
   * @param matchScores 매칭 점수 맵
   * @returns 정렬된 프로필 목록
   */
  private sortProfilesByMatchScore(
    profiles: Profiles[],
    matchScores: Map<number, number>,
  ): Profiles[] {
    return profiles.sort((a, b) => {
      const scoreA = matchScores.get(a.id) || 0;
      const scoreB = matchScores.get(b.id) || 0;
      return scoreB - scoreA; // 내림차순 정렬
    });
  }
}
