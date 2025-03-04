import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JWTPayloadType } from 'src/untils/types';
import { Attachment } from './attachment.entity';
import { List } from 'src/List/list.entity';
import { BoardService } from 'src/Board/board.service';
import { Card } from 'src/Card/card.entity';
import { CreateAttachmentDto } from './dtos/create-attachment.dto';
import { CloudinaryService } from 'src/Cloudinary/cloudinary.service';
import { User } from 'src/Users/users.entity';
import { UpdateAttachmentDto } from './dtos/update-attachment.dto';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly boardService: BoardService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async getAllAttachmentsOnCard(
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

    const attachments = await this.attachmentRepository.find({
      where: { card: { id: cardId } },
    });
    if (!attachments.length) {
      throw new NotFoundException('No attachments found in this card.');
    }

    return { message: 'Done', attachments };
  }

  public async getAttachmentByID(
    boardId: number,
    attachmentId: number,
    payload: JWTPayloadType,
  ) {
    const board = await this.boardService.getBoardByID(boardId);

    if (!board.teams.some((member) => member.id === payload.id)) {
      throw new NotFoundException('You are not authorized to view this board.');
    }

    const attachments = await this.attachmentRepository.find({
      where: { id: attachmentId },
    });
    if (!attachments) {
      throw new NotFoundException('attachments Is Not Found');
    }

    return { message: 'Done', attachments };
  }

  public async addNewAttachment(
    boardId: number,
    listId: number,
    cardId: number,
    payload: JWTPayloadType,
    createAttachmentDto: CreateAttachmentDto,
    attachmentfiles: Express.Multer.File[],
  ) {
    const { fileName, fileType } = createAttachmentDto;
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

    const user = await this.usersRepository.findOne({
      where: { id: payload.id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const AttachmentFilesUploadResults =
      await this.cloudinaryService.uploadAttachmentFiles(cardId, attachmentfiles);
    const formattedAttachmentFiles = AttachmentFilesUploadResults.map(
      (result) => ({
        secure_url: result.secure_url,
        public_id: result.public_id,
      }),
    );
 
    const attachments = await this.attachmentRepository.create({
      fileName,
      fileType,
      card,
      addedBy: user,
      attachmentfiles: formattedAttachmentFiles,
    });

    await this.attachmentRepository.save(attachments);
    return { message: 'Done', attachments };
  }

  public async updateAttachment(
    boardId: number,
    listId: number,
    cardId: number,
    attachmentId: number,
    payload: JWTPayloadType,
    updateAttachmentDto: UpdateAttachmentDto,
    attachmentfiles: Express.Multer.File[],
  ) {
    const { fileName, fileType } = updateAttachmentDto;
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

    const attachments = await this.attachmentRepository.findOne({
      where: { id: attachmentId },
    });
    if (!attachments) {
      throw new NotFoundException('attachments Is Not Found');
    }

    const AttachmentFilesUploadResults =
      await this.cloudinaryService.uploadAttachmentFiles(cardId, attachmentfiles);
    const formattedAttachmentFiles = AttachmentFilesUploadResults.map(
      (result) => ({
        secure_url: result.secure_url,
        public_id: result.public_id,
      }),
    );
    if (attachments.attachmentfiles) {
      await Promise.all(
        attachments.attachmentfiles.map(async (image) => {
          await this.cloudinaryService.destroyImage(image.public_id);
        }),
      );
    }

    if (fileName) attachments.fileName = fileName;
    if (fileType) attachments.fileType = fileType;
    if (attachmentfiles) attachments.attachmentfiles = formattedAttachmentFiles;
    attachments.updatedAt = new Date();
    const updatedAttachment = await this.attachmentRepository.save(attachments);

    return { message: 'Attachment updated successfully', updatedAttachment };
  }

  public async deleteAttachment(
    boardId: number,
    listId: number,
    cardId: number,
    attachmentId: number,
    payload: JWTPayloadType,
  ) {
    const board = await this.boardService.getBoardByID(boardId);
  
    if (!board || !board.teams.some((member) => member.id === payload.id)) {
      throw new ForbiddenException('You are not authorized to perform this action.');
    }
  
    const list = await this.listRepository.findOne({ where: { id: listId } });
    if (!list) {
      throw new NotFoundException('List not found.');
    }
  
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }
  
    const attachment = await this.attachmentRepository.findOne({ where: { id: attachmentId } });
    if (!attachment) {
      throw new NotFoundException('Attachment not found.');
    }
  

    if (attachment.attachmentfiles?.length) {
      await Promise.all(
        attachment.attachmentfiles.map(async (file) => {
          if (file.public_id) {
            await this.cloudinaryService.destroyImage(file.public_id);
          }
        }),
      );
    }
  

    await this.attachmentRepository.delete(attachmentId);
  
    return { message: 'Attachment deleted successfully' };
  }  
}
