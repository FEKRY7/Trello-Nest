//import { Product } from 'src/Products/product.entity';
import { CURRENT_TIMESTAMP } from 'src/untils/constants';
import { User } from 'src/Users/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'tokens' })
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  user: number;

  @Column({default:true})
  isValied: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  // @OneToOne(() => User, (user) => user.token, {
  //   eager: true,
  //   onDelete: 'CASCADE',
  // })
  // user: User;
}

// onDelete:'CASCADE' that men if you delit your profil from user any reviw you do also delete.
