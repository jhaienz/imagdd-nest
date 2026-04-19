import { Controller, Post,Body } from '@nestjs/common';
import { SponsorshipService } from './sponsorship.service';
import { CreateSponsorshipDto } from './dto/sponsorship.dto';

@Controller('sponsorship')
export class SponsorshipController {
  constructor(private readonly sponsorshipService: SponsorshipService) {}

  @Post()
  async create(@Body() createSponsorshipDto: CreateSponsorshipDto) {
    return this.sponsorshipService.create(createSponsorshipDto);
  }
}
