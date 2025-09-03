import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from './mailer/mailer.module';
import { UserModule } from './user/user.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AuthModule } from './auth/auth.module';
import { UniversitiesModule } from './universities/universities.module';
import { SmokingStatusModule } from './smoking_status/smoking_status.module';
import { SocialPrefsModule } from './social_prefs/social_prefs.module';
import { ParticipationTermsModule } from './participation_terms/participation_terms.module';
import { RegionsModule } from './regions/regions.module';
import { MeetingTypesModule } from './meeting_types/meeting_types.module';
import { MajorModule } from './major/major.module';
import { CollabStyleModule } from './collab_style/collab_style.module';
import { DaysOfWeekModule } from './days_of_week/days_of_week.module';
import { ProfileAvailabilityWeeklyModule } from './profile_availability_weekly/profile_availability_weekly.module';

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
    MailerModule,
    UniversitiesModule,
    SmokingStatusModule,
    SocialPrefsModule,
    ParticipationTermsModule,
    RegionsModule,
    MeetingTypesModule,
    MajorModule,
    CollabStyleModule,
    UserModule,
    ProfilesModule,
    AuthModule,
    DaysOfWeekModule,
    ProfileAvailabilityWeeklyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
