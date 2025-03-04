import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';
import { CardsModule } from 'src/Card/card.module';
import { Card } from 'src/Card/card.entity';
import { User } from 'src/Users/users.entity';
import { CommentReplay } from 'src/CommentReplay/commentReplay.entity';
import { UsersModule } from 'src/Users/users.module';
import { List } from 'src/List/list.entity';
import { Board } from 'src/Board/board.entity';
import { ListsModule } from 'src/List/list.module';
import { BoardModule } from 'src/Board/board.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
  imports: [
    TypeOrmModule.forFeature([Comment,Card,List,Board,User]),
    forwardRef(() => UsersModule),
    CardsModule,
    ListsModule,
    BoardModule,
    JwtModule,
  ],
})
export class CommentsModule {}
