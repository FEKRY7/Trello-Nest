import { 
  IsString,  
  Length,
  IsOptional, 
} from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @Length(1, 150) // Ensures the length is between 1 and 150
  @IsOptional()
  title?: string;

  @IsString()
  @Length(1, 250) // Ensures the length is between 1 and 250
  @IsOptional()
  description?: string;
}
