import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayloadType } from 'src/untils/types';
import { Board } from './board.entity';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UsersService } from 'src/Users/users.service';
import { User } from 'src/Users/users.entity';
import { UpdateBoardDto } from './dtos/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  public async getAllBoards() {
    const boards = await this.boardRepository.find();
    if (!boards) {
      throw new NotFoundException('No boards found');
    }

    return { message: 'Done', boards };
  }

  public async getAllBoardsOfUser(payload: JWTPayloadType) {
    console.log(payload);
    const boards = await this.boardRepository.find({
      where: { createdBy: { id: payload.id } },
    });
    if (!boards) {
      throw new NotFoundException('No boards found for this user');
    } else {
      return { message: 'Done', boards };
    }
  }

  public async getBoardByID(id: number) {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['createdBy', 'teams'], 
    });
  
    if (!board) {
      throw new NotFoundException(`Board with id ${id} not found`);
    }
  
    // ✅ Ensure `teams` is always an array (prevents undefined errors)
    board.teams = board.teams ?? [];  
  
    return board;
  }
  

  public async createBoard(
    createBoardDto: CreateBoardDto,
    payload: JWTPayloadType,
  ) {
    const { title, description, teams } = createBoardDto;

    const user = await this.usersService.getCurrentUser(payload.id);
    if (!user) {
      throw new NotFoundException(`User with id ${payload.id} not found`);
    }

    let validTeamMembers = [];

    if (teams) {
      for (let member of teams) {
        let teamMember = await this.usersRepository.findOne({
          where: { id: member },
        });
        if (!teamMember) {
          throw new NotFoundException(`This User: ${member} Is Not Exist`);
        }
        validTeamMembers.push(teamMember);
      }
    }

    const board = this.boardRepository.create({
      title,
      description,
      teams: validTeamMembers,
      createdBy: user,
    });

    await this.boardRepository.save(board);
    return { message: 'Done', board };
  }

  public async updateBoard(
    boardId: number,
    updateBoardDto: UpdateBoardDto,
    payload: JWTPayloadType,
  ) {
    const { title, description } = updateBoardDto;

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['createdBy'], // Ensure related data is fetched
    });

    if (!board) {
      throw new NotFoundException(`Board with id ${boardId} not found`);
    }

    // Check if the user is authorized to update the board
    if (board.createdBy && board.createdBy.id !== payload.id) {
      throw new ForbiddenException(
        'You are not authorized to update this board',
      );
    }

    // Update only provided fields
    if (title) board.title = title;
    if (description) board.description = description;

    await this.boardRepository.save(board); // Save changes directly

    return { message: 'Board updated successfully', board };
  }

  public async deleteBoard(boardId: number, payload: JWTPayloadType) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['createdBy'],
    });
    if (!board) {
      throw new NotFoundException(`Category with id ${boardId} not found`);
    }

    // Check if the user is authorized to update the board
    if (board.createdBy && board.createdBy.id !== payload.id) {
      throw new ForbiddenException(
        'You are not authorized to update this board',
      );
    }

    await this.boardRepository.remove(board);

    return { message: 'Board deleted successfully' };
  }

  public  async addTeamMembers(
    boardId: number,
    payload: JWTPayloadType,
    members: number[],
  ) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['teams'],
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    // Check if the user is authorized to update the board
    if (board.createdBy && board.createdBy.id !== payload.id) {
      throw new ForbiddenException(
        'You are not authorized to update this board',
      );
    }

    if (!Array.isArray(members) || members.length === 0) {
      throw new NotFoundException('Members should be an array of user IDs');
    }


    const validMembers = await this.usersRepository.findByIds(members);
    const validMemberIds = validMembers.map((user) => user.id);
    const invalidMembers = members.filter((id) => !validMemberIds.includes(id));

    if (invalidMembers.length > 0) {
      throw new NotFoundException(
        `Invalid members: ${invalidMembers.join(', ')}`,
      );
    }

   
    board.teams = [...new Set([...board.teams, ...validMembers])];
    await this.boardRepository.save(board);
    console.log(board);
     
    return { message: 'Members added successfully', board };
  }
}  
