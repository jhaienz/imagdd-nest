import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum School {
  ADNU = 'ADNU',
  NCF = 'NCF',
  BISCAST = 'BISCAST',
  OTHER = 'other',
}

export enum Designation {
  STUDENT = 'student',
  GAME_DEVELOPER = 'game developer',
  EDUCATOR = 'educator',
  INDUSTRY_PROFESSIONAL = 'industry professional',
  ANIMATOR = 'animator',
  LGU = 'lgu',
  OTHER = 'other',
}

export enum Games {
  TUSOX_RUSH = 'TUSOX RUSH',
  SIPA = 'SIPA',
  PALTOKALYPSE = 'PALTOKALYPSE',
  POGS = 'POGS',
  PALTOK = 'PALTOK',
  KALAYO_MAYON = 'KALAYO MAYON',
  BAYBAYIN = 'BAYBAYIN',
}
export type VotingDocument = Voting & Document;

@Schema({ timestamps: true })
export class Voting {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: false, enum: School })
  school?: School;

  @Prop({ required: false, enum: Designation })
  proffesional?: Designation;

  @Prop({ required: true, min: 1, max: 7 })
  vote!: number;
}

export const VotingSchema = SchemaFactory.createForClass(Voting);
