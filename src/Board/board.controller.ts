import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserType } from 'src/untils/enums';
import { AuthRolesGuard } from 'src/guards/auth.roles.guard';
import { Roles } from 'src/Users/decorators/user-role.decorator';
import { BoardService } from './board.service';
import { JWTPayloadType } from 'src/untils/types';
import { CurrentUser } from 'src/Users/decorators/current-user.decorator';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UpdateBoardDto } from './dtos/update-board.dto';


@Controller('/api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // GET: /api/board
  @Get()
  public GetAllBoards() {
    return this.boardService.getAllBoards();
  }

  // GET: /api/board/boardsofUuser
  @Get('/boardsofUuser')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public GetAllBoardsOfUser(@CurrentUser() payload: JWTPayloadType) {
    return this.boardService.getAllBoardsOfUser(payload);
  }

  // GET: /api/board/:id
  @Get('/:id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public GetBoardByID(@Param('id', ParseIntPipe) id: number) {
    return this.boardService.getBoardByID(id);
  }

  // POST: /api/board
  @Post()
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async CreateBoard(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.boardService.createBoard(createBoardDto, payload);
  }

  // PUT: /api/board/:boardId
  @Put(':boardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async UpdateBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() updateBoardDto: UpdateBoardDto,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.boardService.updateBoard(boardId, updateBoardDto, payload);
  }

  // DELETE: /api/board/:id
  @Delete(':boardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  public DeleteBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.boardService.deleteBoard(boardId, payload);
  }

  // POST: /api/board/:boardId/add-members
  @Post('/add-members/:boardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async AddMembers(
    @Param('boardId') boardId: number,
    @Body('members') members: number[],
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return await this.boardService.addTeamMembers(boardId, payload, members);
  }
}
