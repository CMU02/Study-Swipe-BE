import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialPrefs } from './social_prefs.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SocialPrefs])]
})
export class SocialPrefsModule {}
