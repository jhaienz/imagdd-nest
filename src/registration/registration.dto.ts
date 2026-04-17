import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { Designation } from './registration.schema';

export class CreateRegistrationDto {
  @ApiProperty({ example: 'juan.dela.cruz@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Juan Dela Cruz' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    enum: Designation,
    example: Designation.STUDENT,
    description: 'Participant designation',
  })
  @IsEnum(Designation, {
    message:
      'designation must be one of: student, game developer, educator, industry professional, other',
  })
  designation: Designation;

  @ApiProperty({ example: 'University of the Philippines' })
  @IsString()
  @IsNotEmpty()
  affiliation: string;

  @ApiProperty({ example: '+63 912 345 6789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[\d\s\-().]{7,20}$/, {
    message: 'contactNumber must be a valid phone number',
  })
  contactNumber: string;
}
