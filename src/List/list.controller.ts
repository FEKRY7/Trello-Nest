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
import { ListService } from './list.service';
import { CurrentUser } from 'src/Users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/untils/types';
import { CreateListDto } from './dtos/create-list.dto';
import { UpdateListDto } from './dtos/update-list.dto';
import { UserType } from 'src/untils/enums';
import { AuthRolesGuard } from 'src/guards/auth.roles.guard';
import { Roles } from 'src/Users/decorators/user-role.decorator';

@Controller('/api/list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  // GET: /api/list/:boardId
  @Get(':boardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async getAllLists(
    @Param('boardId') boardId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.listService.GetAllListOnBorad(boardId, payload);
  }

  // GET: /api/list/:boardId/:id
  @Get('/:boardId/:id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async getListById(
    @Param('boardId') boardId: number,
    @Param('id') id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.listService.getListByID(boardId, id, payload);
  }

  // POST: /api/list/:boardId
  @Post('/:boardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async createList(
    @Body() createListDto: CreateListDto,
    @CurrentUser() payload: JWTPayloadType,
    @Param('boardId') boardId: number,
  ) {
    return this.listService.CreateList(createListDto, payload, boardId);
  }

  // PUT: /api/list/:boardId/:id
  @Put('/:boardId/:id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async updateList(
    @Body() updateListDto: UpdateListDto,
    @Param('boardId') boardId: number,
    @Param('id') id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.listService.UpdateList(updateListDto, id, boardId, payload);
  }

  // DELETE: /api/list/:boardId/:id
  @Delete('/:boardId/:id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async deleteList(
    @Param('id') id: number,
    @Param('boardId') boardId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.listService.DeleteList(id, boardId, payload);
  }
}
