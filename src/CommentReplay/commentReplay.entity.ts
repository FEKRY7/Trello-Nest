import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from 'src/untils/constants';
import { Comment } from 'src/Comment/comment.entity';
import { User } from 'src/Users/users.entity';
import { Card } from 'src/Card/card.entity';

@Entity({ name: 'commentReplay' })
export class CommentReplay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  replytext: string;

  @ManyToOne(() => User, (user) => user.commentReplies, { nullable: false, onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => Card, (card) => card.commentReplies, { nullable: false, onDelete: 'CASCADE' })
  card: Card;

  @ManyToOne(() => Comment, (comment) => comment.replies, { onDelete: 'CASCADE' })
  comment: Comment;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}