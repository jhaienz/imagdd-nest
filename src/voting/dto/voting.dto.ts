import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Designation, School } from '../schema/voting.schema';

export class CreateVotingDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsEnum(School)
  school?: string;

  @IsOptional()
  @IsEnum(Designation)
  proffesional?: string;

  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(18)
  vote!: number;
}
