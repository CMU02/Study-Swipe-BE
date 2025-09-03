import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipationTerms } from './participation_terms.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ParticipationTerms])]
})
export class ParticipationTermsModule {}
