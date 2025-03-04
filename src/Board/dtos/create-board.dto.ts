import { 
  IsString, 
  IsNotEmpty, 
  Length, 
  IsArray, 
  ArrayNotEmpty, 
  IsInt 
} from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @Length(1, 150) // Ensures the length is between 1 and 150
  @IsNotEmpty()
  title: string;

  @IsString()
  @Length(1, 250) // Ensures the length is between 1 and 250
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayNotEmpty() // Ensures at least one team member is provided
  @IsInt({ each: true }) // Ensures each value in the array is an integer
  teams: number[];
}
