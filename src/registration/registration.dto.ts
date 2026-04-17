import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import {
  AttendanceType,
  Designation,
  School,
  WorkshopDay1,
  WorkshopDay2,
} from './registration.schema';

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
      'designation must be one of: student, game developer, educator, industry professional, animator, lgu, other',
  })
  designation: Designation;

  @ApiProperty({
    example: School.ADNU,
    description:
      'Partner-school students: ADNU | NCF | BISCAST. Other-school students: their school name. Non-students: company/office/organization.',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.designation === Designation.STUDENT)
  @IsIn(Object.values(School), {
    message: `Partner-school students must use one of: ${Object.values(School).join(', ')}. Other-school students are placed in the general pool.`,
  })
  affiliation: string;

  @ApiProperty({ example: '+63 912 345 6789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[\d\s\-().]{7,20}$/, {
    message: 'contactNumber must be a valid phone number',
  })
  contactNumber: string;

  @ApiProperty({
    enum: AttendanceType,
    example: AttendanceType.SEMINAR,
    description: 'seminar (talks/panels) or workshop (DIA Lab hands-on sessions)',
  })
  @IsEnum(AttendanceType, {
    message: 'attendanceType must be either: seminar or workshop',
  })
  attendanceType: AttendanceType;

  @ApiProperty({
    enum: WorkshopDay1,
    required: false,
    example: WorkshopDay1.WORKSHOP1,
    description:
      'Required for students choosing workshop. Day 1 (Apr 24): workshop1 = DIA Lab 1, workshop2 = DIA Lab 2',
  })
  @ValidateIf(
    (o) =>
      o.designation === Designation.STUDENT &&
      o.attendanceType === AttendanceType.WORKSHOP,
  )
  @IsNotEmpty()
  @IsEnum(WorkshopDay1, {
    message: 'workshopDay1 must be either: workshop1 or workshop2',
  })
  @IsOptional()
  workshopDay1?: WorkshopDay1;

  @ApiProperty({
    enum: WorkshopDay2,
    required: false,
    example: WorkshopDay2.WORKSHOP4,
    description:
      'Required for students choosing workshop. Day 2 (Apr 25): workshop4 = DIA Lab 1, workshop5 = DIA Lab 2',
  })
  @ValidateIf(
    (o) =>
      o.designation === Designation.STUDENT &&
      o.attendanceType === AttendanceType.WORKSHOP,
  )
  @IsNotEmpty()
  @IsEnum(WorkshopDay2, {
    message: 'workshopDay2 must be either: workshop4 or workshop5',
  })
  @IsOptional()
  workshopDay2?: WorkshopDay2;
}
