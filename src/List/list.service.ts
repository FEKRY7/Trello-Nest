import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayloadType } from 'src/untils/types';
import { List } from './list.entity';
import { BoardService } from 'src/Board/board.service';
import { CreateListDto } from './dtos/create-list.dto';
import { UpdateListDto } from './dtos/update-list.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    private readonly boardService: BoardService,
  ) {}

  public async GetAllListOnBorad(boardId: number, payload: JWTPayloadType) {
    const board = await this.boardService.getBoardByID(boardId);

    if (!board.teams.some((member) => member.id === payload.id)) {
      throw new NotFoundException('You are not authorized to view this board.');
    }

    const lists = await this.listRepository.find({
      where: { board: { id: boardId } },
    });

    if (!lists.length) {
      throw new NotFoundException('No lists found in this board.');
    }

    return { message: 'Done', lists };
  }

  public async getListByID(
    boardId: number,
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

    const list = await this.listRepository.findOne({ where: { id } });

    if (!list) {
      throw new NotFoundException('List not found.');
    }

    return { message: 'Done', list };
  }

  public async CreateList(
    createListDto: CreateListDto,
    payload: JWTPayloadType,
    boardId: number,
  ) {
    const { title, position } = createListDto;
    const board = await this.boardService.getBoardByID(boardId);

    if (!Array.isArray(board.teams) || !board.teams?.length) {
      throw new NotFoundException(
        'No teams found or board.teams is not an array.',
      );
    }

    if (!board.teams.some((member) => member && member.id === payload.id)) {
      throw new NotFoundException('You are not authorized to view this board.');
    }

    const list = this.listRepository.create({ title, position, board });

    await this.listRepository.save(list);

    return { message: 'List created successfully', list };
  }

  public async UpdateList(
    updateListDto: UpdateListDto,
    id: number,
    boardId: number,
    payload: JWTPayloadType,
  ) {
    const { title, position } = updateListDto;
    const board = await this.boardService.getBoardByID(boardId);

    if (!board.teams.some((member) => member.id === payload.id)) {
      throw new NotFoundException(
        'You are not authorized to update lists on this board.',
      );
    }

    const lists = await this.listRepository.findOne({ where: { id } });
    if (!lists) {
      throw new NotFoundException('list not found.');
    }

    // Update only provided fields
    if (title) lists.title = title;
    if (position) lists.position = position;
    await this.listRepository.save(lists);

    return { message: 'List update successfully', lists };
  }

  public async DeleteList(
    id: number,
    boardId: number,
    payload: JWTPayloadType,
  ) {
    const board = await this.boardService.getBoardByID(boardId);

    // Check if the user is authorized to update the board
    if (board.createdBy && board.createdBy.id !== payload.id) {
      throw new ForbiddenException(
        'You are not authorized to update this board',
      );
    }

    const lists = await this.listRepository.findOne({ where: { id } });
    if (!lists) {
      throw new NotFoundException('list not found.');
    }

    await this.listRepository.remove(lists);

    return { message: 'List deleted successfully' };
  }
}
