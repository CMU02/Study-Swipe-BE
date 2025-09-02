import { Profiles } from "src/profiles/profiles.entity";
import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";

@Entity()
export class Major {
    @PrimaryColumn({ name: 'major_id'})
    id: string;

    @Column()
    name: string

    @ManyToMany(() => Profiles, (profile) => profile.major)
    profiles: Profiles[]
}
