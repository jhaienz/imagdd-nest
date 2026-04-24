import { Controller, Post, Body, Get } from '@nestjs/common';
import { VotingService } from './voting.service';
import { CreateVotingDto } from './dto/voting.dto';

@Controller('voting')
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Post()
  async vote(@Body() createVotingDto: CreateVotingDto) {
    return this.votingService.vote(createVotingDto);
  }

  @Get('statistics')
  async getVotesStatistics() {
    return this.votingService.getVotesStatistics();
  }
}
