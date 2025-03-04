import { BadRequestException, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/Users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Attachment } from './attachment.entity';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { CardsModule } from 'src/Card/card.module';
import { Card } from 'src/Card/card.entity';
import { CloudinaryModule } from 'src/Cloudinary/cloudinary.module';
import { List } from 'src/List/list.entity';
import { BoardModule } from 'src/Board/board.module';
import { User } from 'src/Users/users.entity';


@Module({
  controllers: [AttachmentController],
  providers: [AttachmentService],
  exports: [AttachmentService],
  imports: [
    TypeOrmModule.forFeature([Attachment,Card,List,User]),
    forwardRef(() => CardsModule),
    forwardRef(() => UsersModule),
    BoardModule,
    JwtModule,
    CloudinaryModule,
    MulterModule.register({
      storage: memoryStorage(), // Store files in memory
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image')) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  ],
})
export class AttachmentsModule {}