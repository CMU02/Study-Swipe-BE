import { Profiles } from 'src/profiles/profiles.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class CollabStyle {
  @PrimaryColumn({ name: 'collab_style_id' })
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Profiles, (profile) => profile.collab_style)
  profiles: Profiles[];
}
