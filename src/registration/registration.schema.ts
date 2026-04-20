  import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
  import { Document } from 'mongoose';

  export type RegistrationDocument = Registration & Document;

  export enum Designation {
    STUDENT = 'student',
    GAME_DEVELOPER = 'game developer',
    EDUCATOR = 'educator',
    INDUSTRY_PROFESSIONAL = 'industry professional',
    ANIMATOR = 'animator',
    LGU = 'lgu',
    OTHER = 'other',
  }

  export enum AttendanceDay {
    DAY_1 = 'day 1',
    DAY_2 = 'day 2',
  }

  // Abbreviations match what the frontend sends
  export enum School {
    ADNU = 'ADNU',
    NCF = 'NCF',
    BISCAST = 'BISCAST',
  }

  export enum AttendanceType {
    SEMINAR = 'seminar',
    WORKSHOP = 'workshop',
  }

  export enum WorkshopDay1 {
    WORKSHOP1 = 'workshop1',
    WORKSHOP2 = 'workshop2',
  }

  export enum WorkshopDay2 {
    WORKSHOP4 = 'workshop4',
    WORKSHOP5 = 'workshop5',
  }

  export const REGISTRATION_FEE_PER_DAY = 250;
  export const MAX_REGISTRATION_FEE = 500;
  export const DAILY_SLOT_LIMIT = 250;
  export const SCHOOL_SLOT_LIMIT = 50;
  export const PROFESSIONAL_SLOT_LIMIT = 100;
  export const OVERALL_SLOT_LIMIT = 500;
  export const WORKSHOP_SLOT_LIMIT = 30;

  @Schema({ timestamps: true })
  export class Registration {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true, trim: true })
    fullName!: string;

    @Prop({ required: true, type: String, enum: Designation })
    designation!: Designation;

    @Prop({ required: true, trim: true })
    affiliation!: string;

    @Prop({ required: true, trim: true })
    contactNumber!: string;

    @Prop({ required: true, type: String, enum: AttendanceDay })
    attendanceDay!: AttendanceDay;

    @Prop({ required: true, type: String, enum: AttendanceType })
    attendanceType!: AttendanceType;

    @Prop({ required: false, type: String, enum: WorkshopDay1 })
    workshopDay1?: WorkshopDay1;

    @Prop({ required: false, type: String, enum: WorkshopDay2 })
    workshopDay2?: WorkshopDay2;

    createdAt!: Date;
    updatedAt!: Date;
  }

  export const RegistrationSchema = SchemaFactory.createForClass(Registration);
