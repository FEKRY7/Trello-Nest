import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from 'src/untils/constants';
import { Card } from 'src/Card/card.entity';
import { User } from 'src/Users/users.entity';

@Entity({ name: 'attachments' })
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'json',
    nullable: false,
  })
  attachmentfiles: { secure_url: string; public_id: string }[];

  @Column({ type: 'varchar', length: 250 })
  fileName: string;

  @Column({ type: 'varchar', length: 250 })
  fileType: string;

  @ManyToOne(() => Card, (card) => card.attachments, { onDelete: 'CASCADE' })
  card: Card;

  @ManyToOne(() => User, (user) => user.attachments, { nullable: false, onDelete: 'CASCADE' })
  addedBy: User;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}