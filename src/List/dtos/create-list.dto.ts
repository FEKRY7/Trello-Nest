import { 
  IsString, 
  IsNotEmpty, 
  Length, 
  IsNumber
} from 'class-validator';

export class CreateListDto {
  @IsString()
  @Length(1, 150) // Ensures the length is between 1 and 150
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  position: number;
}
