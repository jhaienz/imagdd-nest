import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Designation, School } from './registration.schema';

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

  @ApiProperty({
    example: School.ATENEO,
    description:
      'For students: must be one of the three partner schools. For others: any school/company/organization.',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.designation === Designation.STUDENT)
  @IsIn(Object.values(School), {
    message: `Students must belong to one of the following schools: ${Object.values(School).join(', ')}`,
  })
  affiliation: string;

  @ApiProperty({ example: '+63 912 345 6789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[\d\s\-().]{7,20}$/, {
    message: 'contactNumber must be a valid phone number',
  })
  contactNumber: string;
}
