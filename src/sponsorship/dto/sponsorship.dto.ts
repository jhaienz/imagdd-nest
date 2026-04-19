import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateSponsorshipDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  companyWebsite!: string;

  @IsString()
  @IsNotEmpty()
  companyDescription!: string;

  @IsString()
  @IsNotEmpty()
  contactPerson!: string;

  @IsEmail()
  @IsNotEmpty()
  emailAdress!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[+]?[\d\s\-().]{7,20}$/, {
    message: 'contactNumber must be a valid phone number',
  })
  contactNumber!: string;

  @IsString()
  @IsOptional()
  sponsorshipDescription?: string;

  @IsString()
  @IsOptional()
  comments?: string;
}