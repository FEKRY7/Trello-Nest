import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserType } from 'src/untils/enums';
import { AuthRolesGuard } from 'src/guards/auth.roles.guard';
import { Roles } from 'src/Users/decorators/user-role.decorator';
import { CommentReplayService } from './commentReplay.service';
import { CurrentUser } from 'src/Users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/untils/types';
import { CreateCommentReplayDto } from './dtos/create-commentReplay.dto';
import { UpdateCommentReplayDto } from './dtos/update-commentReplay.dto';

@Controller('/api/commentReplay')
export class CommentReplayController {
  constructor(private readonly commentReplayService: CommentReplayService) {}

  // GET: /api/commentReplay/:cardId/:commentId
  @Get(':cardId/:commentId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetAllcommentReplays(
    @Param('cardId') cardId: number,
    @Param('commentId') commentId: number,
  ) {
    return this.commentReplayService.getAllcommentReplays(cardId,commentId);
  }

  // GET: /api/commentReplay/:cardId/:commentId/:replyId
  @Get(':cardId/:commentId/:replyId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetCommentReplayById(
    @Param('cardId') cardId: number,
    @Param('commentId') commentId: number,
    @Param('replyId') replyId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.commentReplayService.getCommentReplayById(
      cardId,
      commentId,
      replyId,
      payload,
    );
  }

  // POST: /api/commentReplay/:cardId/:commentId
  @Post(':cardId/:commentId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async CreateCommentReplay(
    @Param('cardId') cardId: number,
    @Param('commentId') commentId: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() createCommentReplayDto: CreateCommentReplayDto,
  ) {
    return this.commentReplayService.createCommentReplay(
      cardId,
      commentId,
      payload,
      createCommentReplayDto,
    );
  }

  // Put: /api/commentReplay/:cardId/:commentId/:replyId
  @Put(':cardId/:commentId/:replyId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async UpdateCommentReplay(
    @Param('cardId') cardId: number,
    @Param('commentId') commentId: number,
    @Param('replyId') replyId: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateCommentReplayDto: UpdateCommentReplayDto,
  ) {
    return this.commentReplayService.updateCommentReplay(
      cardId,
      commentId,
      replyId,
      payload,
      updateCommentReplayDto,
    );
  }

  // DELETE: /api/commentReplay/:cardId/:commentId/:replyId
  @Delete(':cardId/:commentId/:replyId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async DeleteCommentReplay(
    @Param('cardId') cardId: number,
    @Param('commentId') commentId: number,
    @Param('replyId') replyId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.commentReplayService.deleteCommentReplay(
      cardId,
      commentId,
      replyId,
      payload,
    );
  }
}
