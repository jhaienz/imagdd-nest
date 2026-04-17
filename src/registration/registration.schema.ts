import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RegistrationDocument = Registration & Document;

export enum Designation {
  STUDENT = 'student',
  GAME_DEVELOPER = 'game developer',
  EDUCATOR = 'educator',
  INDUSTRY_PROFESSIONAL = 'industry professional',
  OTHER = 'other',
}

export enum School {
  ATENEO = 'Ateneo De Naga',
  NCF = 'Naga College Foundation',
  BISCAST = 'Bicol State College of Applied Sciences and Technology',
}

export const SCHOOL_SLOT_LIMIT = 50;
export const PROFESSIONAL_SLOT_LIMIT = 100;

@Schema({ timestamps: true })
export class Registration {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, enum: Designation })
  designation: Designation;

  @Prop({ required: true, trim: true })
  affiliation: string;

  @Prop({ required: true, trim: true })
  contactNumber: string;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
