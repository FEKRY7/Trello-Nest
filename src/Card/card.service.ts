import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Like, Repository } from 'typeorm';
import { JWTPayloadType } from 'src/untils/types';
import { Card } from './card.entity';
import { BoardService } from 'src/Board/board.service';
import { List } from 'src/List/list.entity';
import { CreateCardDto } from './dtos/create-card.dto';
import { User } from 'src/Users/users.entity';
import { UpdateCardDto } from './dtos/update-card.dto';
import { StatusType } from 'src/untils/enums';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly boardService: BoardService,
  ) {}

  public async getAllCardsOnList(
    boardId: number,
    listId: number,
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

    const cards = await this.cardRepository.find({
      where: { list: { id: listId } },
    });
    if (!cards.length) {
      throw new NotFoundException('No cards found in this list.');
    }

    return { message: 'Done', cards };
  }

  public async getCardByID(
    boardId: number,
    listId: number,
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

    const cards = await this.cardRepository.findOne({ where: { id } });
    if (!cards) {
      throw new NotFoundException('Card not found.');
    }

    return { message: 'Done', cards };
  }

  public async createNewCard(
    boardId: number,
    listId: number,
    payload: JWTPayloadType,
    createCardDto: CreateCardDto,
  ) {
    const { title, description, assignTo, deadline, status } = createCardDto;
  
    // Verify board access
    const board = await this.boardService.getBoardByID(boardId);
    if (!board || !Array.isArray(board.teams) || !board.teams.some(member => member?.id === payload.id)) {
      throw new NotFoundException('You are not authorized to view this board.');
    }
  
    // Verify list existence
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['cards'],
    });
    if (!list) {
      throw new NotFoundException('List not found.');
    }
  
    // Verify card creator
    const createdBy = await this.usersRepository.findOne({ where: { id: payload.id } });
    if (!createdBy) {
      throw new NotFoundException('User not found.');
    }
  
    // Validate assigned user
    let assignedUser: User | null = null;
    if (assignTo) {
      assignedUser = await this.usersRepository.findOne({ where: { id: assignTo } });
      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found.');
      }
    }
  
    // Validate deadline format
    let deadlineDate: Date | null = null;
    if (deadline) {
      const parsedDate = new Date(deadline);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid deadline format.');
      }
      deadlineDate = parsedDate;
    }
  
    // Create and save card
    const card = this.cardRepository.create({
      title,
      description,
      list,
      status,
      createdBy,
      assignTo: assignedUser ? assignedUser.id : null, // Now storing as number, not string
      deadline: deadlineDate,
    });
  
    await this.cardRepository.save(card);
  
    return { message: 'Done', card };
  }
  
  public async updateCard(
    boardId: number,
    listId: number,
    cardId: number,
    payload: JWTPayloadType,
    updateCardDto: UpdateCardDto,
  ) {
    const { title, description, assignTo, deadline } = updateCardDto;

    const board = await this.boardService.getBoardByID(boardId);
    if (
      !board ||
      !Array.isArray(board.teams) ||
      !board.teams.some((member) => member?.id === payload.id)
    ) {
      throw new NotFoundException('You are not authorized to view this board.');
    }

    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['cards'],
    });
    if (!list) {
      throw new NotFoundException('List not found.');
    }

    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    if (title) card.title = title;
    if (description) card.description = description;

    if (assignTo) {
      const assignToId = Number(assignTo);
      if (isNaN(assignToId)) {
        throw new BadRequestException(
          'Assigned user ID must be a valid number.',
        );
      }

      const assignedUser = await this.usersRepository.findOne({
        where: { id: assignToId },
      });
      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found.');
      }

      card.assignTo = assignToId
    }

    if (deadline) {
      const parsedDate = new Date(deadline);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid deadline format.');
      }
      card.deadline = parsedDate;
    }

    await this.cardRepository.save(card);

    return { message: 'Card updated successfully', card };
  }

  public async deleteCard(
    boardId: number,
    listId: number,
    cardId: number,
    payload: JWTPayloadType,
  ) {
    // Verify board and user access
    const board = await this.boardService.getBoardByID(boardId);

    // Check if the user is authorized to update the board
    if (board.createdBy && board.createdBy.id !== payload.id) {
      throw new ForbiddenException(
        'You are not authorized to update this board',
      );
    }

    // Verify list existence
    const list = await this.listRepository.findOne({
      where: { id: listId },
      relations: ['cards'],
    });
    if (!list) {
      throw new NotFoundException('List not found.');
    }

    // Find the card to delete
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }

    // Delete the card
    await this.cardRepository.remove(card);

    return { message: 'Card deleted successfully' };
  }

  public async getAllCardsAfterDeadline() {
    const expiredCards = await this.cardRepository.find({
      where: {
        deadline: LessThanOrEqual(new Date()),
        status: In([StatusType.TODO, StatusType.DOING]),
      },
    });

    if (!expiredCards.length) {
      throw new NotFoundException('No cards found after the deadline.');
    }

    return { message: 'Done', cards: expiredCards };
  }
}
