import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayloadType } from 'src/untils/types';
import { Comment } from './comment.entity';
import { BoardService } from 'src/Board/board.service';
import { List } from 'src/List/list.entity';
import { Card } from 'src/Card/card.entity';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { User } from 'src/Users/users.entity';
import { UpdateCommentDto } from './dtos/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly boardService: BoardService,
  ) {}

  public async getAllCommentOnCard(
    boardId: number,
    listId: number,
    cardId: number,
    payload: JWTPayloadType,
  ) {
    const board = await this.boardService.getBoardByID(boardId);

    if (!board.teams.some((member) => member.id === payload.id)) {
      throw new NotFoundException('You are not authorized to view this board.');
    }

    const list = await this.listRepository.findOne({ where: { id: listId } });

    if (!list) {
      throw new NotFoundException('No lists found.');
    }

    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('No cards found');
    }

    const comments = await this.commentRepository.find({
      where: { card: { id: cardId } },
    });
    if (!comments.length) {
      throw new NotFoundException('No comments found in this card.');
    }

    return { message: 'Done',comments };
  }

  public async getCommentByID(
    boardId: number,
    listId: number,
    cardId: number,
    id: number,
    payload: JWTPayloadType,
  ) {
    const board = await this.boardService.getBoardByID(boardId);

    if (
      !Array.isArray(board.teams) ||
      !board.teams.some((member) => member?.id === payload.id)
    ) {
      throw new NotFoundException('You are not authorized to view this board.');
    }

    const list = await this.listRepository.findOne({ where: { id: listId } });

    if (!list) {
      throw new NotFoundException('List not found.');
    }

    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const comment = await this.commentRepository.find({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    return { message: 'Done', comment };
  }

  public async createNewComment(
    boardId: number,
    listId: number,
    cardId: number,
    payload: JWTPayloadType,
    createCommentDto: CreateCommentDto,
  ) {
    const { text } = createCommentDto;
    const board = await this.boardService.getBoardByID(boardId);

    if (!board || !board.teams?.some((member) => member?.id === payload.id)) {
      throw new ForbiddenException(
        'You are not authorized to view this board.',
      );
    }

    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found.');
    }

    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['comments'],
    });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const comment = this.commentRepository.create({
      text,
      author: user,
      card,
    });

    await this.commentRepository.save(comment);

    return { message: 'Done', comment };
  }

  public async updateComment(
    boardId: number,
    listId: number,
    cardId: number,
    id: number,
    payload: JWTPayloadType,
    updateCommentDto: UpdateCommentDto,
  ) {
    const { text } = updateCommentDto;

    const board = await this.boardService.getBoardByID(boardId);

    if (!board || !board.teams?.some((member) => member?.id === payload.id)) {
      throw new ForbiddenException(
        'You are not authorized to modify this board.',
      );
    }

    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found.');
    }

    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    if (comment.author.id !== payload.id) {
      throw new ForbiddenException('You are not allowed to edit this comment.');
    }

    if (text) comment.text = text;

    await this.commentRepository.save(comment);

    return { message: 'Comment updated successfully', comment };
  }

  public async deleteComment(
    boardId: number,
    listId: number,
    cardId: number,
    id: number,
    payload: JWTPayloadType,
  ) {
    const board = await this.boardService.getBoardByID(boardId);

    if (!board || !board.teams?.some((member) => member?.id === payload.id)) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment.',
      );
    }

    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found.');
    }

    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    // Only allow the author to delete the comment
    if (
      comment.author.id !== payload.id &&
      board.createdBy &&
      board.createdBy.id !== payload.id
    ) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment.',
      );
    }

    await this.commentRepository.remove(comment);

    return { message: 'Comment deleted successfully' };
  }
}
