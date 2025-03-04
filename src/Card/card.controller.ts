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
import { CurrentUser } from 'src/Users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/untils/types';
import { CardService } from './card.service';
import { CreateCardDto } from './dtos/create-card.dto';
import { UpdateCardDto } from './dtos/update-card.dto';

@Controller('/api/card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  // GET: /api/card/:boardId/:listId
  @Get(':boardId/:listId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetAllCards(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.cardService.getAllCardsOnList(boardId, listId, payload);
  }

  // GET: /api/card/:boardId/:listId/:cardId
  @Get(':boardId/:listId/:id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetCardByID(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('id') id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.cardService.getCardByID(boardId, listId, id, payload);
  }

  // POST: /api/card/:boardId/:listId
  @Post(':boardId/:listId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async CreateCard(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.cardService.createNewCard(
      boardId,
      listId,
      payload,
      createCardDto,
    );
  }

  // PUT: /api/card/:boardId/:listId/:cardId
  @Put(':boardId/:listId/:cardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async UpdateCard(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardService.updateCard(
      boardId,
      listId,
      cardId,
      payload,
      updateCardDto,
    );
  }

  // DELETE: /api/card/:boardId/:listId/:cardId
  @Delete(':boardId/:listId/:id')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async DeleteCard(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('id') id: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.cardService.deleteCard(boardId, listId, id, payload);
  }

  // GET: /api/card/deadline
  @Get('/deadline')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetAllCardsAfterDeadline() {
    return this.cardService.getAllCardsAfterDeadline();
  }

}
