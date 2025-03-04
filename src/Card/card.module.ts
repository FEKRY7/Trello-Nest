import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { Card } from './card.entity';
import { List } from 'src/List/list.entity';
import { Attachment } from 'src/Attachment/attachment.entity';
import { Comment } from 'src/Comment/comment.entity';
import { User } from 'src/Users/users.entity';
import { UsersModule } from 'src/Users/users.module';
import { ListsModule } from 'src/List/list.module';
import { CommentsModule } from 'src/Comment/comment.module';
import { AttachmentsModule } from 'src/Attachment/attachment.module';
import { BoardModule } from 'src/Board/board.module';

@Module({
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
  imports: [
    TypeOrmModule.forFeature([Card, List, User]),
    forwardRef(() => UsersModule),
    forwardRef(() => ListsModule),
    forwardRef(() => BoardModule),
    JwtModule, 
  ], 
})
export class CardsModule {}
