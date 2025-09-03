import { ProfileAvailabilityWeekly } from "src/profile_availability_weekly/profile_availability_weekly.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class DaysOfWeek {
    /**
     * 요일을 식별하기 위한 기본키
     * 1:월, 2:화, 3:수, 4:목, 5:금, 6:토, 7:일
     */
    @PrimaryColumn({ type: 'smallint' }) 
    dow: number; 

    @Column()
    name: string; // 요일명

    @OneToMany(() => ProfileAvailabilityWeekly, (paw) => paw.days_of_week)
    profiles_availability_weekly: ProfileAvailabilityWeekly
}
