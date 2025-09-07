import { Profiles } from 'src/profiles/profiles.entity';
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PreferredMemberCount {
  @PrimaryGeneratedColumn('increment', { name: 'preferred_member_count_id' })
  id: string;

  @OneToOne(() => Profiles, (profile) => profile.preferred_member_count)
  @JoinColumn()
  profiles: Profiles;

  min_member_count: number;
  max_member_count: number;
}
