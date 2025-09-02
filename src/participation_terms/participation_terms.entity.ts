import { Profiles } from "src/profiles/profiles.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class ParticipationTerms {
  @PrimaryColumn({ name: 'participation_term_id'})
  id: string

  @Column()
  name: string

  @OneToMany(() => Profiles, (profiles) => profiles.participation_terms)
  profiles: Profiles
}
