import { 
  IsString, 
  IsOptional, 
  Length, 
  IsNumber
} from 'class-validator';

export class UpdateListDto {
  @IsString()
  @Length(1, 150) // Ensures the length is between 1 and 150
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
