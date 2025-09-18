import { Test, TestingModule } from '@nestjs/testing';
import { StudyTagsService } from './study_tags.service';

describe('StudyTagsService', () => {
  let service: StudyTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudyTagsService],
    }).compile();

    service = module.get<StudyTagsService>(StudyTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
