import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CanonicalTagMeta } from '../canonical_tag_meta/canonical_tag_meta';

@Entity()
export class CanonicalTags {
  @PrimaryGeneratedColumn('uuid', { name: 'uid' })
  uid: string;

  @Column('text', { nullable: false })
  value: string; // 표시/기준 이름 (예 : '프론트엔드', '백엔드', 'React', 'NestJS')

  @Column('text')
  description: string;

  @Column({ type: 'real_vector', length: 1536 })
  embed: number[] | Buffer;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => CanonicalTagMeta, (meta) => meta.canonical_tags)
  @JoinColumn()
  tag_meta: CanonicalTagMeta;
}
