import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayloadType } from 'src/untils/types';
import { CommentReplay } from './commentReplay.entity';
import { Card } from 'src/Card/card.entity';
import { Comment } from 'src/Comment/comment.entity';
import { CreateCommentReplayDto } from './dtos/create-commentReplay.dto';
import { User } from 'src/Users/users.entity';
import { UpdateCommentReplayDto } from './dtos/update-commentReplay.dto';

@Injectable()
export class CommentReplayService {
  constructor(
    @InjectRepository(CommentReplay)
    private readonly commentReplayRepository: Repository<CommentReplay>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  public async getAllcommentReplays(cardId: number, commentId: number) {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const comment = await this.commentRepository.find({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }

    const commentReplay = await this.commentReplayRepository.find({});

    return { message: 'Done', commentReplay };
  }

  public async getCommentReplayById(
    cardId: number,
    commentId: number,
    replyId: number,
    payload: JWTPayloadType,
  ) {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const isExistComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!isExistComment) {
      throw new NotFoundException('Invalid Comment Id');
    }

    const isExistcommentReplay = await this.commentReplayRepository.findOne({
      where: { id: replyId },
      relations: ['author'], // Ensure we fetch the author relation
    });

    if (!isExistcommentReplay) {
      throw new NotFoundException('This commentReplay does not exist');
    }

    if (isExistcommentReplay.author?.id !== payload.id) {
      throw new ForbiddenException('Not authorized to access this comment');
    }

    return { message: 'Done', isExistcommentReplay };
  }

  public async createCommentReplay(
    cardId: number,
    commentId: number,
    payload: JWTPayloadType,
    createCommentReplayDto: CreateCommentReplayDto,
  ) {
    const { replytext } = createCommentReplayDto;

    if (!payload.id) {
      throw new ForbiddenException('User is not authenticated');
    }

    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('Invalid Comment Id');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.id },
    });
    if(!user) {
      throw new NotFoundException('User not found.');
    }

    const commentReplay = this.commentReplayRepository.create({
      replytext,
      author: user,
      card,
      comment,
    });

    await this.commentReplayRepository.save(commentReplay);

    return { message: 'Done', commentReplay };
  }

  public async updateCommentReplay(
    cardId: number,
    commentId: number,
    replyId: number,
    payload: JWTPayloadType,
    updateCommentReplayDto: UpdateCommentReplayDto,
  ) {
    const { replytext } = updateCommentReplayDto;
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const isExistComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!isExistComment) {
      throw new NotFoundException('Invalid Comment Id');
    }

    const commentReplay = await this.commentReplayRepository.findOne({
      where: { id: replyId },
      relations: ['author'], // Ensure we fetch the author relation
    });

    if (!commentReplay) {
      throw new NotFoundException('This commentReplay does not exist');
    }

    if (commentReplay.author?.id !== payload.id) {
      throw new ForbiddenException('Not Auth To update This Comment');
    }

    if (replytext) commentReplay.replytext = replytext;

    await this.commentReplayRepository.save(commentReplay);

    return { message: 'CommentReplay updated successfully', commentReplay };
  }

  public async deleteCommentReplay(
    cardId: number,
    commentId: number,
    replyId: number,
    payload: JWTPayloadType,
  ) {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    const isExistComment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!isExistComment) {
      throw new NotFoundException('Invalid Comment Id');
    }

    const isExistcommentReplay = await this.commentReplayRepository.findOne({
      where: { id: replyId },
      relations: ['author'], // Ensure we fetch the author relation
    });

    if (!isExistcommentReplay) {
      throw new NotFoundException('This comment reply does not exist');
    }

    if (isExistcommentReplay.author?.id !== payload.id) {
      throw new ForbiddenException(
        'Not authorized to delete this comment reply',
      );
    }

    await this.commentReplayRepository.remove(isExistcommentReplay);

    return { message: 'CommentReplay deleted successfully' };
  }
}
