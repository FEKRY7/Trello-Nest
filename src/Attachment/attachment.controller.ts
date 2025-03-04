import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserType } from 'src/untils/enums';
import { AuthRolesGuard } from 'src/guards/auth.roles.guard';
import { Roles } from 'src/Users/decorators/user-role.decorator';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { AttachmentService } from './attachment.service';
import { CurrentUser } from 'src/Users/decorators/current-user.decorator';
import { JWTPayloadType } from 'src/untils/types';
import { CreateAttachmentDto } from './dtos/create-attachment.dto';
import { UpdateAttachmentDto } from './dtos/update-attachment.dto';

@Controller('/api/attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  // GET: /api/attachment/:boardId/:listId/:cardId
  @Get(':boardId/:listId/:cardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetAllAttachmentsOnCard(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.attachmentService.getAllAttachmentsOnCard(
      boardId,
      listId,
      cardId,
      payload,
    );
  }

  // GET: /api/attachment/:boardId/:attachmentId
  @Get(':boardId/:attachmentId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async GetAttachmentByID(
    @Param('boardId') boardId: number,
    @Param('attachmentId') attachmentId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.attachmentService.getAttachmentByID(
      boardId,
      attachmentId,
      payload,
    );
  }

  // POST: /api/attachment/:boardId/:listId/:cardId
  @Post(':boardId/:listId/:cardId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachment-files', maxCount: 10 }]),
  )
  async AddNewAttachment(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() createAttachmentDto: CreateAttachmentDto,
    @UploadedFiles()
    files: {
      'attachment-files'?: Express.Multer.File[];
    },
  ) {
    const attachmentfiles = files['attachment-files'] || [];

    return this.attachmentService.addNewAttachment(
      boardId,
      listId,
      cardId,
      payload,
      createAttachmentDto,
      attachmentfiles,
    );
  }

  // PUT: /api/attachment/:boardId/:listId/:cardId/:attachmentId
  @Put(':boardId/:listId/:cardId/:attachmentId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachment-files', maxCount: 10 }]),
  )
  async UpdateAttachment(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @Param('attachmentId') attachmentId: number,
    @CurrentUser() payload: JWTPayloadType,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
    @UploadedFiles()
    files: {
      'attachment-files'?: Express.Multer.File[];
    },
  ) {
    const attachmentfiles = files['attachment-files'] || [];

    return this.attachmentService.updateAttachment(
      boardId,
      listId,
      cardId,
      attachmentId,
      payload,
      updateAttachmentDto,
      attachmentfiles,
    );
  }

  // DELETE: /api/attachment/:boardId/:listId/:cardId/:attachmentId
  @Delete(':boardId/:listId/:cardId/:attachmentId')
  @Roles(UserType.USER)
  @UseGuards(AuthRolesGuard)
  async DeleteAttachment(
    @Param('boardId') boardId: number,
    @Param('listId') listId: number,
    @Param('cardId') cardId: number,
    @Param('attachmentId') attachmentId: number,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    return this.attachmentService.deleteAttachment(
      boardId,
      listId,
      cardId,
      attachmentId,
      payload,
    );
  }
}
