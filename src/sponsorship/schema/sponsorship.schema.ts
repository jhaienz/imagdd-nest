                import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SponsorshipDocument = Sponsorship & Document;

@Schema({ timestamps: true })
export class Sponsorship {
  @Prop({ required: true, trim: true })
  companyName!: string;

  @Prop({ required: true, trim: true })
  companyWebsite!: string;

  @Prop({ required: true, trim: true })
  companyDescription!: string;

  @Prop({ required: true, trim: true })
  contactPerson!: string;

  @Prop({ required: true, trim: true })
  emailAdress!: string;

  @Prop({ required: true, trim: true })
  contactNumber!: string;

  @Prop({trim: true })
  sponsorshipDescription?: string;

  @Prop({ trim: true })
  comments?: string;

}

export const SponsorshipSchema = SchemaFactory.createForClass(Sponsorship);