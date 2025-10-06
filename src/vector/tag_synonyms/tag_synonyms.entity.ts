import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CanonicalTags } from '../canonical_tags/canonical_tags.entity';

@Entity('tag_synonyms')
export class TagSynonyms {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  // raw 키 정규화된 문자열
  @Column({ type: 'text', unique: true })
  raw: string;

  @ManyToOne(() => CanonicalTags, (canon) => canon.tag_synonyms, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  canonical_tags: CanonicalTags;

  @Column({ type: 'real' })
  confidence: number;

  @CreateDateColumn()
  create_at: Date;
}
