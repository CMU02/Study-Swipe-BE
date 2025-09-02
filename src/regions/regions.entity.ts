import { Profiles } from 'src/profiles/profiles.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Regions {
  @PrimaryColumn({ name: 'regions_id' })
  id: string;

  @Column()
  city_first: string;

  @Column()
  city_second: string;

  @Column({ type: 'float' })
  lat: number; // 위도

  @Column({ type: 'float' })
  lng: number; // 경도

  @ManyToMany(() => Profiles, (profile) => profile.regions)
  profiles: Profiles[]
}
