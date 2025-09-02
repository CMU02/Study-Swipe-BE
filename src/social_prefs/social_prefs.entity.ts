import { Profiles } from 'src/profiles/profiles.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class SocialPrefs {
  @PrimaryColumn({ name: 'social_pref_id' })
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Profiles, (profiles) => profiles.social_pref)
  profiles: Profiles
}
