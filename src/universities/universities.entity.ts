import { User } from 'src/user/user.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Universities {
  @PrimaryColumn()
  id: string;

  @Column()
  university_name: string;

  @OneToMany(() => User, (user) => user.universities)
  users: User;
}
