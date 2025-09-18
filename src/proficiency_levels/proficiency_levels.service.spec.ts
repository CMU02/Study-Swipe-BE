import { Test, TestingModule } from '@nestjs/testing';
import { ProficiencyLevelsService } from './proficiency_levels.service';

describe('ProficiencyLevelsService', () => {
  let service: ProficiencyLevelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProficiencyLevelsService],
    }).compile();

    service = module.get<ProficiencyLevelsService>(ProficiencyLevelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
