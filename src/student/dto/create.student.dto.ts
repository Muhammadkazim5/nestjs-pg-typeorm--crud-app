import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsOptional()
  @IsString()
  image?: string;
}
