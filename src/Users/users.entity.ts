import { Exclude } from 'class-transformer';
import { CURRENT_TIMESTAMP } from 'src/untils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  ManyToMany,
} from 'typeorm';
import { GenderType, UserType } from 'src/untils/enums';
import { Token } from 'src/Token/token.entity';
import { Board } from 'src/Board/board.entity';
import { Card } from 'src/Card/card.entity';
import { Comment } from 'src/Comment/comment.entity';
import { CommentReplay } from 'src/CommentReplay/commentReplay.entity';
import { Attachment } from 'src/Attachment/attachment.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  firstName: string;

  @Column({ type: 'varchar', length: 150 })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 250,
    unique: true,
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value: string) => value,
    },
  })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'varchar', length: 150 })
  phone: string;

  @Column({ default: false })
  confirmEmail: boolean;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'enum', enum: GenderType })
  gender: GenderType;

  @Column({ type: 'enum', enum: UserType, default: UserType.USER })
  role: UserType;

  @Column({ default: false })
  isLoggedIn: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'json', nullable: true })
  OTP?: { OTPCode: string; expireDate: Date };

  @Column({ type: 'int', default: 0 })
  OTPSentTimes: number;

  @OneToMany(() => Board, (board) => board.createdBy)
  boards: Board[];

  @ManyToMany(() => Board, (board) => board.teams)
  boardsAsTeam: Board[];

  @OneToOne(() => Token, (token) => token.user, { onDelete: 'CASCADE' })
  token: Token;

  @OneToMany(() => Card, (card) => card.createdBy)
  createdCards: Card[];

  @OneToMany(() => Card, (card) => card.assignToUser)
  assignedCards: Card[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => CommentReplay, (reply) => reply.author)
  commentReplies: CommentReplay[];

  @OneToMany(() => Attachment, (attachment) => attachment.addedBy, { cascade: true })
  attachments: Attachment[];

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
