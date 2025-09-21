import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CollabStyleModule } from './collab_style/collab_style.module';
import { MailerModule } from './mailer/mailer.module';
import { MajorModule } from './major/major.module';
import { MeetingTypesModule } from './meeting_types/meeting_types.module';
import { ParticipationInfoModule } from './participation_info/participation_info.module';
import { PreferredMemberCountModule } from './preferred_member_count/preferred_member_count.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RegionsModule } from './regions/regions.module';
import { SmokingStatusModule } from './smoking_status/smoking_status.module';
import { SocialPrefsModule } from './social_prefs/social_prefs.module';
import { TermsOfUseModule } from './terms_of_use/terms_of_use.module';
import { UniversitiesModule } from './universities/universities.module';
import { UserModule } from './user/user.module';
import { StudyTagsModule } from './study_tags/study_tags.module';
import { ProficiencyLevelsModule } from './proficiency_levels/proficiency_levels.module';
import { QuestionsModule } from './questions/questions.modue';
import { VectorModule } from './vector/vector.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'study_swipe',
      autoLoadEntities: true,
      synchronize: false,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 60초
          limit: 10, // 1분 동안 10번까지 요청 가능
        },
      ],
    }),
    MailerModule,
    UniversitiesModule,
    SmokingStatusModule,
    SocialPrefsModule,
    ParticipationInfoModule,
    RegionsModule,
    MeetingTypesModule,
    MajorModule,
    CollabStyleModule,
    UserModule,
    ProfilesModule,
    AuthModule,
    TermsOfUseModule,
    PreferredMemberCountModule,
    StudyTagsModule,
    ProficiencyLevelsModule,
    QuestionsModule,
    VectorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
