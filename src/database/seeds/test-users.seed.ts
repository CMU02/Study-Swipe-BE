import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/user.entity';
import { Profiles } from 'src/profiles/profiles.entity';
import { participationInfo } from 'src/participation_info/participation_info.entity';
import { StudyTags } from 'src/study_tags/study_tags.entity';
import { Universities } from 'src/universities/universities.entity';

/**
 * 테스트 사용자 시드 데이터 생성 서비스
 * 10명 이상의 테스트 사용자를 생성합니다.
 */
@Injectable()
export class TestUsersSeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profiles)
    private profilesRepository: Repository<Profiles>,
    @InjectRepository(participationInfo)
    private participationInfoRepository: Repository<participationInfo>,
    @InjectRepository(StudyTags)
    private studyTagsRepository: Repository<StudyTags>,
    @InjectRepository(Universities)
    private universitiesRepository: Repository<Universities>,
  ) {}

  /**
   * 테스트 사용자 데이터 생성
   */
  async seedTestUsers(): Promise<void> {
    console.log('🌱 테스트 사용자 시드 데이터 생성 시작...');

    // 대학교 데이터 생성 (없으면)
    const universities = await this.createUniversities();

    // 테스트 사용자 데이터
    const testUsersData = [
      {
        user_id: 'testuser01',
        email: 'test01@example.com',
        password: 'Test1234!',
        display_name: '김철수',
        gender: '남성',
        age: 23,
        bio_note: '백엔드 개발에 관심이 많은 컴퓨터공학과 학생입니다.',
        goals_note: '스프링 부트 마스터하기',
        period: 3,
        period_length: '중기',
        start_time: '09:00',
        end_time: '18:00',
        university: universities[0],
        study_tags: [
          { tag_name: '백엔드', priority: 1, proficiency_levels: '중급' },
          { tag_name: 'Java', priority: 2, proficiency_levels: '초급' },
          { tag_name: 'Spring', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser02',
        email: 'test02@example.com',
        password: 'Test1234!',
        display_name: '이영희',
        gender: '여성',
        age: 22,
        bio_note: '프론트엔드 개발자를 꿈꾸는 학생입니다.',
        goals_note: 'React 프로젝트 완성하기',
        period: 6,
        period_length: '장기',
        start_time: '14:00',
        end_time: '22:00',
        university: universities[1],
        study_tags: [
          { tag_name: '프론트엔드', priority: 1, proficiency_levels: '중급' },
          { tag_name: 'React', priority: 2, proficiency_levels: '중급' },
          { tag_name: 'TypeScript', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser03',
        email: 'test03@example.com',
        password: 'Test1234!',
        display_name: '박민수',
        gender: '남성',
        age: 25,
        bio_note: '데이터 분석에 관심이 많습니다.',
        goals_note: '머신러닝 기초 다지기',
        period: 2,
        period_length: '단기',
        start_time: '19:00',
        end_time: '23:00',
        university: universities[0],
        study_tags: [
          { tag_name: 'Python', priority: 1, proficiency_levels: '중급' },
          { tag_name: '데이터분석', priority: 2, proficiency_levels: '초급' },
          { tag_name: '머신러닝', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser04',
        email: 'test04@example.com',
        password: 'Test1234!',
        display_name: '최지은',
        gender: '여성',
        age: 24,
        bio_note: 'UI/UX 디자인과 프론트엔드를 공부하고 있습니다.',
        goals_note: '포트폴리오 웹사이트 만들기',
        period: 4,
        period_length: '중기',
        start_time: '10:00',
        end_time: '17:00',
        university: universities[2],
        study_tags: [
          { tag_name: 'UI/UX', priority: 1, proficiency_levels: '중급' },
          { tag_name: 'Figma', priority: 2, proficiency_levels: '중급' },
          { tag_name: 'HTML/CSS', priority: 3, proficiency_levels: '상급' },
        ],
      },
      {
        user_id: 'testuser05',
        email: 'test05@example.com',
        password: 'Test1234!',
        display_name: '정현우',
        gender: '남성',
        age: 26,
        bio_note: '풀스택 개발자를 목표로 하고 있습니다.',
        goals_note: '개인 프로젝트 배포하기',
        period: 5,
        period_length: '중기',
        start_time: '09:00',
        end_time: '22:00',
        university: universities[1],
        study_tags: [
          { tag_name: '풀스택', priority: 1, proficiency_levels: '중급' },
          { tag_name: 'Node.js', priority: 2, proficiency_levels: '중급' },
          { tag_name: 'Docker', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser06',
        email: 'test06@example.com',
        password: 'Test1234!',
        display_name: '강서연',
        gender: '여성',
        age: 21,
        bio_note: '모바일 앱 개발에 관심이 많습니다.',
        goals_note: 'Flutter로 첫 앱 출시하기',
        period: 3,
        period_length: '중기',
        start_time: '13:00',
        end_time: '20:00',
        university: universities[0],
        study_tags: [
          { tag_name: 'Flutter', priority: 1, proficiency_levels: '초급' },
          { tag_name: 'Dart', priority: 2, proficiency_levels: '초급' },
          { tag_name: '모바일개발', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser07',
        email: 'test07@example.com',
        password: 'Test1234!',
        display_name: '윤태호',
        gender: '남성',
        age: 27,
        bio_note: '클라우드 인프라에 관심이 많은 개발자입니다.',
        goals_note: 'AWS 자격증 취득하기',
        period: 6,
        period_length: '장기',
        start_time: '18:00',
        end_time: '23:00',
        university: universities[2],
        study_tags: [
          { tag_name: 'AWS', priority: 1, proficiency_levels: '중급' },
          { tag_name: 'DevOps', priority: 2, proficiency_levels: '초급' },
          { tag_name: 'Kubernetes', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser08',
        email: 'test08@example.com',
        password: 'Test1234!',
        display_name: '임수진',
        gender: '여성',
        age: 23,
        bio_note: '게임 개발에 도전하고 있습니다.',
        goals_note: 'Unity로 간단한 게임 만들기',
        period: 4,
        period_length: '중기',
        start_time: '15:00',
        end_time: '21:00',
        university: universities[1],
        study_tags: [
          { tag_name: 'Unity', priority: 1, proficiency_levels: '초급' },
          { tag_name: 'C#', priority: 2, proficiency_levels: '초급' },
          { tag_name: '게임개발', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser09',
        email: 'test09@example.com',
        password: 'Test1234!',
        display_name: '한동훈',
        gender: '남성',
        age: 24,
        bio_note: '블록체인 기술에 관심이 많습니다.',
        goals_note: 'Solidity 기초 마스터하기',
        period: 2,
        period_length: '단기',
        start_time: '20:00',
        end_time: '24:00',
        university: universities[0],
        study_tags: [
          { tag_name: '블록체인', priority: 1, proficiency_levels: '초급' },
          { tag_name: 'Solidity', priority: 2, proficiency_levels: '초급' },
          { tag_name: 'Web3', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser10',
        email: 'test10@example.com',
        password: 'Test1234!',
        display_name: '송미래',
        gender: '여성',
        age: 22,
        bio_note: 'AI와 딥러닝을 공부하고 있습니다.',
        goals_note: 'PyTorch로 모델 학습하기',
        period: 5,
        period_length: '중기',
        start_time: '10:00',
        end_time: '19:00',
        university: universities[2],
        study_tags: [
          { tag_name: '딥러닝', priority: 1, proficiency_levels: '중급' },
          { tag_name: 'PyTorch', priority: 2, proficiency_levels: '초급' },
          { tag_name: 'AI', priority: 3, proficiency_levels: '중급' },
        ],
      },
      {
        user_id: 'testuser11',
        email: 'test11@example.com',
        password: 'Test1234!',
        display_name: '오준석',
        gender: '남성',
        age: 25,
        bio_note: '사이버 보안에 관심이 많습니다.',
        goals_note: '해킹 방어 기술 익히기',
        period: 6,
        period_length: '장기',
        start_time: '09:00',
        end_time: '18:00',
        university: universities[1],
        study_tags: [
          { tag_name: '보안', priority: 1, proficiency_levels: '중급' },
          { tag_name: '네트워크', priority: 2, proficiency_levels: '중급' },
          { tag_name: '해킹', priority: 3, proficiency_levels: '초급' },
        ],
      },
      {
        user_id: 'testuser12',
        email: 'test12@example.com',
        password: 'Test1234!',
        display_name: '배수현',
        gender: '여성',
        age: 23,
        bio_note: '데이터베이스 설계와 최적화를 공부하고 있습니다.',
        goals_note: 'SQL 고급 기술 마스터하기',
        period: 3,
        period_length: '중기',
        start_time: '14:00',
        end_time: '20:00',
        university: universities[0],
        study_tags: [
          { tag_name: 'Database', priority: 1, proficiency_levels: '중급' },
          { tag_name: 'SQL', priority: 2, proficiency_levels: '중급' },
          { tag_name: 'PostgreSQL', priority: 3, proficiency_levels: '초급' },
        ],
      },
    ];

    // 사용자 생성
    for (const userData of testUsersData) {
      await this.createTestUser(userData);
    }

    console.log('✅ 테스트 사용자 시드 데이터 생성 완료!');
  }

  /**
   * 대학교 데이터 생성
   */
  private async createUniversities(): Promise<Universities[]> {
    const universityNames = ['서울대학교', '연세대학교', '고려대학교'];
    const universities: Universities[] = [];

    for (const name of universityNames) {
      let university = await this.universitiesRepository.findOne({
        where: { university_name: name.replace(/\s+/g, '').toLowerCase() },
      });

      if (!university) {
        university = this.universitiesRepository.create({
          university_name: name,
        });
        await this.universitiesRepository.save(university);
      }

      universities.push(university);
    }

    return universities;
  }

  /**
   * 개별 테스트 사용자 생성
   */
  private async createTestUser(userData: any): Promise<void> {
    // 이미 존재하는 사용자인지 확인
    const existingUser = await this.userRepository.findOne({
      where: { user_id: userData.user_id },
    });

    if (existingUser) {
      console.log(
        `⚠️  사용자 ${userData.user_id}는 이미 존재합니다. 건너뜁니다.`,
      );
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // 1. User 생성
    const user = this.userRepository.create({
      user_id: userData.user_id,
      email: userData.email,
      password: hashedPassword,
      email_verified: true,
      email_verified_at: new Date(),
      weight_avg_score: Math.random() * 2 + 2, // 2.0 ~ 4.0 랜덤 점수
      universities: userData.university,
    });
    const savedUser = await this.userRepository.save(user);

    // 2. Profile 생성
    const profile = this.profilesRepository.create({
      display_name: userData.display_name,
      gender: userData.gender,
      age: userData.age,
      bio_note: userData.bio_note,
      goals_note: userData.goals_note,
      birth_date: new Date(2000 + (25 - userData.age), 0, 1), // 대략적인 생년월일
      activity_radius_km: Math.floor(Math.random() * 10) + 5, // 5~15km
      contact_info: `kakao_${userData.user_id}`,
      user: savedUser,
    });
    const savedProfile = await this.profilesRepository.save(profile);

    // 3. Participation Info 생성
    const participationInfo = this.participationInfoRepository.create({
      period: userData.period,
      period_length: userData.period_length,
      start_time: userData.start_time,
      end_time: userData.end_time,
      profile: savedProfile,
    });
    await this.participationInfoRepository.save(participationInfo);

    // 4. Study Tags 생성
    for (const tagData of userData.study_tags) {
      const studyTag = this.studyTagsRepository.create({
        tag_name: tagData.tag_name,
        priority: tagData.priority,
        proficiency_score: Math.random() * 10 + 5, // 5~15 랜덤
        proficiency_avg_score: Math.random() * 3 + 2, // 2~5 랜덤
        proficiency_weight_avg_score: Math.random() * 3 + 2, // 2~5 랜덤
        is_survey_completed: true,
        proficiency_levels: tagData.proficiency_levels,
        profiles: savedProfile,
      });
      await this.studyTagsRepository.save(studyTag);
    }

    console.log(`✅ 사용자 ${userData.user_id} 생성 완료`);
  }

  /**
   * 모든 테스트 사용자 삭제
   */
  async clearTestUsers(): Promise<void> {
    console.log('🗑️  테스트 사용자 삭제 시작...');

    const testUserIds = Array.from(
      { length: 12 },
      (_, i) => `testuser${String(i + 1).padStart(2, '0')}`,
    );

    for (const userId of testUserIds) {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
        relations: ['profiles'],
      });

      if (user) {
        if (user.profiles) {
          // Study Tags 삭제
          await this.studyTagsRepository.delete({
            profiles: { id: user.profiles.id },
          });

          // Participation Info 삭제
          await this.participationInfoRepository.delete({
            profile: { id: user.profiles.id },
          });

          // Profile 삭제
          await this.profilesRepository.delete(user.profiles.id);
        }

        // User 삭제
        await this.userRepository.delete(user.uuid);
        console.log(`✅ 사용자 ${userId} 삭제 완료`);
      }
    }

    console.log('✅ 테스트 사용자 삭제 완료!');
  }
}
