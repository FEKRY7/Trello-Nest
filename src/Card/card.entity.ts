import { StatusType } from 'src/untils/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from 'src/untils/constants';
import { List } from 'src/List/list.entity';
import { User } from 'src/Users/users.entity';
import { Comment } from 'src/Comment/comment.entity';
import { Attachment } from 'src/Attachment/attachment.entity';
import { CommentReplay } from 'src/CommentReplay/commentReplay.entity';

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  description: string;

  @Column({ type: 'enum', enum: StatusType })
  status: StatusType;

  @ManyToOne(() => User, (user) => user.createdCards, { nullable: false })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.assignedCards, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignTo' })
  assignToUser: User;

  @Column({ type: 'int', nullable: true })
  assignTo: number;

  @Column({ type: 'timestamp', nullable: false })
  deadline: Date;

  @ManyToOne(() => List, (list) => list.cards, { onDelete: 'CASCADE' })
  list: List;

  @OneToMany(() => Comment, (comment) => comment.card, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Attachment, (attachment) => attachment.card, {
    cascade: true,
  })
  attachments: Attachment[];

  @OneToMany(() => CommentReplay, (commentReplay) => commentReplay.card)
  commentReplies: CommentReplay[];

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
