import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Universities } from './universities.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class UniversitiesService {
  constructor(
    @InjectRepository(Universities)
    private universitiesRepository: Repository<Universities>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 사용자의 대학교 정보를 업데이트합니다.
   * 대학교가 존재하지 않으면 새로 생성하고, 사용자와 연결합니다.
   * @param userId 사용자 UUID
   * @param universityName 대학교 이름
   * @returns 업데이트된 사용자 정보
   */
  async updateUserUniversity(
    userId: string,
    universityName: string,
  ): Promise<User> {
    // 사용자 존재 여부 확인
    const user = await this.userRepository.findOne({
      where: { uuid: userId },
      relations: ['universities'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 대학교 존재 여부 확인 및 생성
    let university = await this.universitiesRepository.findOne({
      where: {
        university_name: universityName.replace(/\s+/g, '').toLowerCase(),
      },
    });

    if (!university) {
      // 대학교가 존재하지 않으면 새로 생성
      university = this.universitiesRepository.create({
        university_name: universityName,
      });
      await this.universitiesRepository.save(university);
    }

    // 사용자의 대학교 정보 업데이트
    user.universities = university;
    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  }

  /**
   * 모든 대학교 목록을 조회합니다.
   * @returns 대학교 목록
   */
  async findAll(): Promise<Universities[]> {
    return this.universitiesRepository.find({
      order: { university_name: 'ASC' },
    });
  }

  /**
   * 특정 대학교 정보를 조회합니다.
   * @param universityId 대학교 ID
   * @returns 대학교 정보
   */
  async findOneByUniversityName(universityName: string): Promise<Universities> {
    const university = await this.universitiesRepository.findOne({
      where: { university_name: universityName },
    });

    if (!university) {
      throw new NotFoundException('대학교를 찾을 수 없습니다.');
    }

    return university;
  }
}
