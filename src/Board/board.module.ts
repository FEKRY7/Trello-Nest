import { BadRequestException, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/Users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { Board } from './board.entity';
import { User } from 'src/Users/users.entity';
import { List } from 'src/List/list.entity';
import { ListsModule } from 'src/List/list.module';
import { CardsModule } from 'src/Card/card.module';

@Module({
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
  imports: [
    TypeOrmModule.forFeature([Board,User,List]),
    forwardRef(() => UsersModule),
    forwardRef(() => CardsModule),
    JwtModule,
    ListsModule,
  ],
})
export class BoardModule {}