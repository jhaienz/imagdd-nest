import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
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
  AttendanceDay,
  AttendanceType,
  Designation,
  School,
  WorkshopDay1,
  WorkshopDay2,
} from './registration.schema';

const parseCsvToArray = ({ value }: { value: unknown }): string[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        String(item)
          .split(',')
          .map((v) => v.trim()),
      )
      .filter(Boolean);
  }

  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

export const FILTER_WORKSHOPS = [
  WorkshopDay1.WORKSHOP1,
  WorkshopDay1.WORKSHOP2,
  WorkshopDay2.WORKSHOP4,
  WorkshopDay2.WORKSHOP5,
] as const;

export type FilterWorkshop = (typeof FILTER_WORKSHOPS)[number];

export const OTHER_SCHOOLS_FILTER = 'other';
export const OTHER_DESIGNATIONS_FILTER = 'others';

export const CORE_DESIGNATIONS = [
  Designation.STUDENT,
  Designation.EDUCATOR,
  Designation.GAME_DEVELOPER,
  Designation.INDUSTRY_PROFESSIONAL,
  Designation.LGU,
] as const;

export const DESIGNATION_FILTER_OPTIONS = [
  ...Object.values(Designation),
  OTHER_DESIGNATIONS_FILTER,
] as const;

export type FilterDesignation = (typeof DESIGNATION_FILTER_OPTIONS)[number];

export class CreateRegistrationDto {
  @ApiProperty({ example: 'juan.dela.cruz@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Juan Dela Cruz' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    enum: Designation,
    example: Designation.STUDENT,
    description: 'Participant designation',
  })
  @IsEnum(Designation, {
    message:
      'designation must be one of: student, game developer, educator, industry professional, animator, lgu, other',
  })
  designation!: Designation;

  @ApiProperty({
    example: School.ADNU,
    description:
      'Partner-school students: ADNU | NCF | BISCAST. Other-school students: their school name. Non-students: company/office/organization.',
  })
  @IsString()
  @IsNotEmpty()
  affiliation!: string;

  @ApiProperty({ example: '+63 912 345 6789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?\d[\d\s\-().]{6,19}$/, {
    message: 'contactNumber must be a valid phone number',
  })
  contactNumber!: string;

  @ApiProperty({
    enum: AttendanceDay,
    example: AttendanceDay.DAY_1,
    description: 'Select which day to attend: day 1 or day 2',
  })
  @IsEnum(AttendanceDay, {
    message: 'attendanceDay must be either: day 1 or day 2',
  })
  attendanceDay!: AttendanceDay;

  @ApiProperty({
    enum: AttendanceType,
    example: AttendanceType.SEMINAR,
    description: 'seminar (talks/panels) or workshop (DIA Lab hands-on sessions)',
  })
  @IsEnum(AttendanceType, {
    message: 'attendanceType must be either: seminar or workshop',
  })
  attendanceType!: AttendanceType;

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

export class FilterRegistrationsDto {
  @ApiPropertyOptional({
    enum: AttendanceDay,
    example: AttendanceDay.DAY_1,
    description: 'Filter by attendance day',
  })
  @IsOptional()
  @IsEnum(AttendanceDay)
  attendanceDay?: AttendanceDay;

  @ApiPropertyOptional({
    type: [String],
    enum: FILTER_WORKSHOPS,
    example: [WorkshopDay1.WORKSHOP1, WorkshopDay2.WORKSHOP4],
    description:
      'Filter by one or more workshops. Supports comma-separated values or repeated query params.',
  })
  @IsOptional()
  @Transform(parseCsvToArray)
  @IsArray()
  @IsEnum(FILTER_WORKSHOPS, { each: true })
  workshops?: FilterWorkshop[];

  @ApiPropertyOptional({
    type: [String],
    example: [School.ADNU, OTHER_SCHOOLS_FILTER],
    description:
      'Filter by one or more schools/affiliations. Use "other" to include schools outside ADNU, NCF, and BISCAST. Supports comma-separated values or repeated query params.',
  })
  @IsOptional()
  @Transform(parseCsvToArray)
  @IsArray()
  @IsString({ each: true })
  schools?: string[];

  @ApiPropertyOptional({
    type: [String],
    enum: DESIGNATION_FILTER_OPTIONS,
    example: [Designation.STUDENT, OTHER_DESIGNATIONS_FILTER],
    description:
      'Filter by one or more designations. Use "others" to include designations outside student, educator, game developer, industry professional, and lgu. Supports comma-separated values or repeated query params.',
  })
  @IsOptional()
  @Transform(parseCsvToArray)
  @IsArray()
  @IsIn(DESIGNATION_FILTER_OPTIONS, { each: true })
  designations?: FilterDesignation[];
}
