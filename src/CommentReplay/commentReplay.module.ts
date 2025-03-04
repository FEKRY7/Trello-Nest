import { BadRequestException, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/Users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CommentReplayController } from './commentReplay.controller';
import { CommentReplayService } from './commentReplay.service';
import { CommentReplay } from './commentReplay.entity';
import { User } from 'src/Users/users.entity';
import { Comment } from 'src/Comment/comment.entity';
import { CommentsModule } from 'src/Comment/comment.module';
import { Card } from 'src/Card/card.entity';
import { CardsModule } from 'src/Card/card.module';

@Module({
  controllers: [CommentReplayController],
  providers: [CommentReplayService],
  exports: [CommentReplayService],
  imports: [
    TypeOrmModule.forFeature([CommentReplay,User,Comment,Card]),
    forwardRef(() => UsersModule),
    CommentsModule,
    CardsModule,
    JwtModule,
  ],
})
export class CommentReplayModule {}