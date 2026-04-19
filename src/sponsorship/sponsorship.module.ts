import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SponsorshipService } from './sponsorship.service';
import { SponsorshipController } from './sponsorship.controller';
import { Sponsorship, SponsorshipSchema } from './schema/sponsorship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sponsorship.name, schema: SponsorshipSchema },
    ]),
  ],
  controllers: [SponsorshipController],
  providers: [SponsorshipService],
})
export class SponsorshipModule {}
