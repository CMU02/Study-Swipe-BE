import { Profiles } from 'src/profiles/profiles.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SocialPrefs {
  @PrimaryGeneratedColumn('increment', { name: 'social_pref_id' })
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Profiles, (profiles) => profiles.social_pref)
  profiles: Profiles;
}
