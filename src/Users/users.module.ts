import {
  ClassSerializerInterceptor,
  forwardRef,
  Module,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthProvider } from './auth.provider';
import { Token } from 'src/Token/token.entity';
import { Board } from 'src/Board/board.entity';
import { BoardModule } from 'src/Board/board.module';
import { MailModule } from 'src/mail/mail.module';
import { OtpService } from './otpGenerator.provider';
import { CardsModule } from 'src/Card/card.module';
import { Card } from 'src/Card/card.entity';
import { CommentsModule } from 'src/Comment/comment.module';
import { CommentReplayModule } from 'src/CommentReplay/commentReplay.module';

@Module({
  controllers: [UsersController],
  exports: [UsersService], // Export UsersService for use in other modules
  imports: [
    TypeOrmModule.forFeature([User,Board,Card]), // Registers User entity
    TypeOrmModule.forFeature([Token]),
    JwtModule.registerAsync({ 
      imports: [ConfigModule],
      useFactory: () => ({
        global: true,
        secret: process.env.JWT_SECRET, // Ensure the JWT secret is set in .env
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
      }),
    }),
    BoardModule,
    forwardRef(() => CardsModule),
    CommentsModule,
    CommentReplayModule,
    MailModule,
  ],
  providers: [
    UsersService,
    AuthProvider,
    OtpService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor, // Applies serialization globally
    },
  ],
})
export class UsersModule {}
