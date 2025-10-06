import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TagSynonyms } from '../tag_synonyms/tag_synonyms.entity';

@Entity()
export class CanonicalTags {
  @PrimaryGeneratedColumn('uuid', { name: 'uid' })
  uid: string;

  @Column('text', { nullable: false })
  tag_name: string; // 표시/기준 이름 (예 : '프론트엔드', '백엔드', 'React', 'NestJS')

  @Column('vector')
  embed: number[] | Buffer;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  category: string;

  @OneToMany(() => TagSynonyms, (tag_synonyms) => tag_synonyms.canonical_tags)
  tag_synonyms: TagSynonyms;
}
