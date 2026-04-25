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
  LISTO = "LISTO",
  LANGIT_LUPA_IMPYERNO = "LANGIT LUPA IMPYERNO",
  STATE_OF_EMERGENCY = "STATE OF EMERGENCY",
  GET_ICED = "GET ICED",
  DONT_TOUCH_MY_DUCK = "DONT TOUCH MY DUCK",
  ALAGAD_DIVINE_WAR = "ALAGAD DIVINE WAR",
  INSUREKSYON = "INSUREKSYON",
  MENDVILLE = "MENDVILLE",
  BOL2 = "BOL2",
  SANTELMO = "SANTELMO",
  SORT_IT_OUT = "SORT IT OUT"

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

  @Prop({ required: true, min: 1, max: 18 })
  vote!: number;
}

export const VotingSchema = SchemaFactory.createForClass(Voting);
