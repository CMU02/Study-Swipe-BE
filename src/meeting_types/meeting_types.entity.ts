import { Profiles } from "src/profiles/profiles.entity";
import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";

@Entity()
export class MeetingTypes {
    @PrimaryColumn({ name: 'meeting_types_id'})
    id: string;

    @Column()
    name: string

    @ManyToMany(() => Profiles, (profile) => profile.meeting_types)
    profiles: Profiles[]
}
