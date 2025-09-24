import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CanonicalTagMeta } from '../canonical_tag_meta/canonical_tag_meta';
import { TagSynonyms } from '../tag_synonyms/tag_synonyms.entity';

@Entity()
export class CanonicalTags {
  @PrimaryGeneratedColumn('uuid', { name: 'uid' })
  uid: string;

  @Column('text', { nullable: false })
  value: string; // 표시/기준 이름 (예 : '프론트엔드', '백엔드', 'React', 'NestJS')

  @Column('text', { nullable: true })
  description: string;

  @Column('vector')
  embed: number[] | Buffer;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => CanonicalTagMeta, (meta) => meta.canonical_tags)
  @JoinColumn()
  tag_meta: CanonicalTagMeta;

  @OneToMany(() => TagSynonyms, (tag_synonyms) => tag_synonyms.canonical_tags)
  tag_synonyms: TagSynonyms;
}
