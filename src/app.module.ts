import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ConfigModule } from '@nestjs/config';
import { User } from './Users/users.entity';
import { Token } from './Token/token.entity';
import { UsersModule } from './Users/users.module';
import { TokenModule } from './Token/token.module';
import { CloudinaryModule } from './Cloudinary/cloudinary.module';
import { Attachment } from './Attachment/attachment.entity';
import { AttachmentsModule } from './Attachment/attachment.module';
import { BoardModule } from './Board/board.module';
import { Board } from './Board/board.entity';
import { Card } from './Card/card.entity';
import { CardsModule } from './Card/card.module';
import { CommentsModule } from './Comment/comment.module';
import { Comment } from './Comment/comment.entity'
import { CommentReplay } from './CommentReplay/commentReplay.entity';
import { CommentReplayModule } from './CommentReplay/commentReplay.module';
import { ListsModule } from './List/list.module';
import { List } from './List/list.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Ensure it's available globally
      envFilePath: '.env.development', // Specify the correct path to your environment file
    }),
    TokenModule, 
    UsersModule,
    AttachmentsModule,
    BoardModule,
    CardsModule,
    CommentsModule,
    CommentReplayModule,
    ListsModule,
    CloudinaryModule,
    TypeOrmModule.forRoot({
      type: 'postgres',  
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10),
      host: 'localhost',
      database: process.env.DB_DATABASS,
      synchronize: true,
      entities: [
      Token,
      User,
      Attachment,
      Board,
      Card,
      Comment,
      CommentReplay,
      List,
      ], 
    }),
  ], 
})
export class AppModule {}
