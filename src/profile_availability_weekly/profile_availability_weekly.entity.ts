import { DaysOfWeek } from 'src/days_of_week/days_of_week.entity';
import { Profiles } from 'src/profiles/profiles.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProfileAvailabilityWeekly {
  @PrimaryGeneratedColumn('increment', { name: 'availability_id' })
  id: number;

  @ManyToOne(() => Profiles, (profiles) => profiles.profile_availability_weekly)
  @JoinColumn()
  profiles: Profiles;

  @ManyToOne(
    () => DaysOfWeek,
    (dayOfWeek) => dayOfWeek.profiles_availability_weekly,
  )
  @JoinColumn()
  days_of_week: DaysOfWeek;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;
}
