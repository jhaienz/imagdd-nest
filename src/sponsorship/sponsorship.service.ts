import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSponsorshipDto } from './dto/sponsorship.dto';
import { Sponsorship, SponsorshipDocument } from './schema/sponsorship.schema';

@Injectable()
export class SponsorshipService {
  constructor(
    @InjectModel(Sponsorship.name)
    private readonly sponsorshipModel: Model<SponsorshipDocument>,
  ) {}

  async create(dto: CreateSponsorshipDto): Promise<SponsorshipDocument> {
    const existing = await this.sponsorshipModel.findOne({
      emailAdress: dto.emailAdress.toLowerCase(),
    });

    if (existing) {
      throw new BadRequestException('This email address has already submitted a sponsorship inquiry.');
    }

    return this.sponsorshipModel.create({
      ...dto,
      emailAdress: dto.emailAdress.toLowerCase(),
    });
  }
}
