import { Test, TestingModule } from '@nestjs/testing';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';

describe('VotingController', () => {
  let controller: VotingController;
  const votingServiceMock = {
    vote: jest.fn(),
    getVotesStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VotingController],
      providers: [{ provide: VotingService, useValue: votingServiceMock }],
    }).compile();

    controller = module.get<VotingController>(VotingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
