import { Profiles } from 'src/profiles/profiles.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class SmokingStatus {
  @PrimaryColumn({ name: 'smoking_status_id' })
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Profiles, (profiles) => profiles.smoking_status)
  profiles: Profiles
}
