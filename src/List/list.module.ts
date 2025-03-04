import { BadRequestException, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/Users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from 'src/Cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { List } from './list.entity';
import { Board } from 'src/Board/board.entity';
import { Card } from 'src/Card/card.entity';
import { CardsModule } from 'src/Card/card.module';
import { BoardModule } from 'src/Board/board.module';


@Module({
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService],
  imports: [
    TypeOrmModule.forFeature([List,Board,Card]),
    forwardRef(() => UsersModule),
    forwardRef(() => BoardModule),
    CardsModule,
    JwtModule,
  ],
})
export class ListsModule {}