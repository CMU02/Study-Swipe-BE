import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Universities {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  university_name: string;

  @OneToMany(() => User, (user) => user.universities)
  users: User[];
}
