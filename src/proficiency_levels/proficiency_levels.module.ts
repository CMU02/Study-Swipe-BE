import { Module } from '@nestjs/common';
import { ProficiencyLevelsService } from './proficiency_levels.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProficiencyLevels } from './proficiency_levels.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProficiencyLevels])],
  providers: [ProficiencyLevelsService],
  exports: [ProficiencyLevelsService],
})
export class ProficiencyLevelsModule {}
