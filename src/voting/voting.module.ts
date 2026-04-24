import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VotingService } from './voting.service';
import { VotingController } from './voting.controller';
import { Voting, VotingSchema } from './schema/voting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Voting.name, schema: VotingSchema }]),
  ],
  controllers: [VotingController],
  providers: [VotingService],
})
export class VotingModule {}
