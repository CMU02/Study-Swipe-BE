import { Controller, Post, Delete } from '@nestjs/common';
import { TestUsersSeedService } from './test-users.seed';

/**
 * 시드 데이터 관리 컨트롤러
 * 개발 환경에서만 사용해야 합니다.
 */
@Controller('seeds')
export class SeedsController {
  constructor(private readonly testUsersSeedService: TestUsersSeedService) {}

  /**
   * 테스트 사용자 12명 생성
   * POST /seeds/test-users
   */
  @Post('test-users')
  async createTestUsers() {
    try {
      await this.testUsersSeedService.seedTestUsers();
      return {
        status_code: 201,
        message: '테스트 사용자 12명이 성공적으로 생성되었습니다.',
      };
    } catch (error) {
      return {
        status_code: 500,
        message: '테스트 사용자 생성 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }

  /**
   * 테스트 사용자 전체 삭제
   * DELETE /seeds/test-users
   */
  @Delete('test-users')
  async clearTestUsers() {
    try {
      await this.testUsersSeedService.clearTestUsers();
      return {
        status_code: 200,
        message: '테스트 사용자가 성공적으로 삭제되었습니다.',
      };
    } catch (error) {
      return {
        status_code: 500,
        message: '테스트 사용자 삭제 중 오류가 발생했습니다.',
        error: error.message,
      };
    }
  }
}
