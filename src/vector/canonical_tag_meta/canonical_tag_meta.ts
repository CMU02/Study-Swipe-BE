import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CanonicalTags } from '../canonical_tags/canonical_tags.entity';

@Entity()
export class CanonicalTagMeta {
  @PrimaryGeneratedColumn('uuid', { name: 'canon_uid' })
  uid: string;

  @Column()
  source: string; // EX: ESCO, INTERNAL

  @Column()
  tag: string;

  @ManyToOne(() => CanonicalTags, (tag) => tag.tag_meta)
  canonical_tags: CanonicalTags;
}
