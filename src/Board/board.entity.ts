import { List } from 'src/List/list.entity';
import { User } from 'src/Users/users.entity';
import { CURRENT_TIMESTAMP } from 'src/untils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity({ name: 'board' })
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  description: string;

  @OneToMany(() => List, (list) => list.board, { cascade: true })
  lists: List[];

  @ManyToOne(() => User, (user) => user.boards, { onDelete: 'CASCADE' })
  createdBy: User;

  @ManyToMany(() => User, (user) => user.boardsAsTeam, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  teams: User[];

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
