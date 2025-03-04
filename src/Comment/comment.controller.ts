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
import { CommentService } from './comment.service';
import { CurrentUser } from 'src/Users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/untils/types';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Controller('/api/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // GET: /api/comment/:boardId/:listId/:cardId
  @Get(':boardId/:listId/:cardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetAllComments(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.commentService.getAllCommentOnCard(
      boardId,
      listId,
      cardId,
      payload,
    );
  }

  // GET: /api/comment/:boardId/:listId/:cardId/:commentId
  @Get(':boardId/:listId/:cardId/:id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetCommentByID(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @Param('id') id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.commentService.getCommentByID(
      boardId,
      listId,
      cardId,
      id,
      payload,
    );
  }

  // POST: /api/comment/:boardId/:listId/:cardId
  @Post(':boardId/:listId/:cardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async CreateComment(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createNewComment(
      boardId,
      listId,
      cardId,
      payload,
      createCommentDto,
    );
  }

  // Put: /api/comment/:boardId/:listId/:cardId/:commentId
  @Put(':boardId/:listId/:cardId/:id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async UpdateComment(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @Param('id') id: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(
      boardId,
      listId,
      cardId,
      id,
      payload,
      updateCommentDto,
    );
  }

    // DELETE: /api/comment/:boardId/:listId/:cardId/:commentId
    @Delete(':boardId/:listId/:cardId/:id')
    @Roles(UserType.USER)
    @UseGuards(AuthRolesGuard)
    async DeleteComment(
      @Param('boardId') boardId: number,
      @Param('listId') listId: number,
      @Param('cardId') cardId: number,
      @Param('id') id: number,
      @CurrentUser() payload: JWTPayloadType,   
    ) {
      return this.commentService.deleteComment(
        boardId,
        listId,
        cardId,
        id,
        payload,
      );
    }
}
