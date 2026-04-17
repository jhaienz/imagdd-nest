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
