import { Profiles } from 'src/profiles/profiles.entity';
import { StudyTags } from 'src/study_tags/study_tags.entity';

/**
 * 매칭 결과 포맷팅 유틸리티
 */

export interface MatchResultDto {
  profile_id: number;
  user_uuid: string | null;
  display_name: string;
  image: string | null;
  goals_note: string | null;
  university_name: string | null;
  major_name: string | null;
  region: string | null;
  start_time: string | null;
  end_time: string | null;
  period: number | null;
  period_length: string | null;
  age: number | null;
  gender: string | null;
  collab_style_name: string | null;
  collab_style_description: string | null;
  meeting_type_name: string | null;
  smoking_status: string | null;
  preferred_member_count: string | null;
  study_tags: Array<{
    tag_name: string;
    priority: number;
    proficiency_level: string;
  }>;
  match_score: number;
}

/**
 * 프로필 데이터를 매칭 결과 DTO로 변환
 * @param profile 프로필 엔티티
 * @param matchScore 매칭 점수
 * @returns 포맷팅된 매칭 결과
 */
export function formatMatchResult(
  profile: Profiles,
  matchScore: number,
): MatchResultDto {
  // 지역 정보 포맷팅
  const region = profile.region
    ? `${profile.region.city_first} ${profile.region.city_second || ''}`.trim()
    : null;

  // 공부 태그 정렬 및 포맷팅 (우선순위 순, 최대 5개)
  const studyTagsArray = Array.isArray(profile.study_tags)
    ? profile.study_tags
    : [];
  const studyTags = studyTagsArray
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map((tag) => ({
      tag_name: tag.tag_name,
      priority: tag.priority,
      proficiency_level: tag.proficiency_levels,
    }));

  return {
    profile_id: profile.id,
    user_uuid: profile.user?.uuid || '',
    display_name: profile.display_name,
    image: profile.image,
    goals_note: profile.goals_note,
    university_name: profile.user?.universities?.university_name || null,
    major_name: profile.major?.name || null,
    region,
    start_time: profile.participation_info?.start_time || null,
    end_time: profile.participation_info?.end_time || null,
    period: profile.participation_info?.period || null,
    period_length: profile.participation_info?.period_length || null,
    age: profile.age,
    gender: profile.gender,
    collab_style_name: profile.collab_style?.name || null,
    collab_style_description: profile.collab_style?.description || null,
    meeting_type_name: profile.meeting_type?.name || null,
    smoking_status: profile.smoking_status?.name || null,
    preferred_member_count: profile.preferred_member_count
      ? `${profile.preferred_member_count.min_member_count}-${profile.preferred_member_count.max_member_count}명`
      : null,
    study_tags: studyTags,
    match_score: matchScore,
  };
}

/**
 * 여러 프로필을 매칭 결과 배열로 변환
 * @param profiles 프로필 배열
 * @param matchScores 각 프로필의 매칭 점수 맵
 * @returns 포맷팅된 매칭 결과 배열
 */
export function formatMatchResults(
  profiles: Profiles[],
  matchScores: Map<number, number>,
): MatchResultDto[] {
  return profiles.map((profile) => {
    const matchScore = matchScores.get(profile.id) || 0;
    return formatMatchResult(profile, matchScore);
  });
}
