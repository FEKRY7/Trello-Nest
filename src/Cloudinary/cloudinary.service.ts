import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Card } from 'src/Card/card.entity';
import { Readable } from 'stream';
import { Repository } from 'typeorm';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {
    cloudinary.config({
      cloud_name: process.env.COLUD_NAME, // Corrected the typo from COLUD_NAME
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  }

  public async destroyImage(publicId: string): Promise<{ result: string }> {
    if (!publicId) {
      throw new BadRequestException('Public ID is required to delete an image');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(new Error('Image deletion failed: ' + error.message));
        }
        resolve(result);
      });
    });
  }
 
  public async uploadAttachmentFiles(
    cardId: number,
    files: Express.Multer.File[]
  ): Promise<UploadApiResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
  
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException('Card not found.');
    }
  
    // Sanitize card title to remove special characters
    const sanitizedTitle = card.title.replace(/[^a-zA-Z0-9-_]/g, '-');
  
    console.log(`Uploading Attachment Files for Card: ${sanitizedTitle}`);
  
    const uploadPromises = files.map((file) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: `Trello-Attachments/Card-${sanitizedTitle}`
          },
          (error, result) => {
            if (error) {
              return reject(
                new InternalServerErrorException(
                  'Attachment file upload failed: ' + error.message
                )
              );
            }
            resolve(result);
          }
        );
  
        Readable.from(file.buffer).pipe(upload);
      });
    });
  
    return Promise.all(uploadPromises);
  }
  

}