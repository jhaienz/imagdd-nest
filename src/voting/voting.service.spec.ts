import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { VotingService } from './voting.service';
import { Voting } from './schema/voting.schema';

describe('VotingService', () => {
  let service: VotingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotingService,
        {
          provide: getModelToken(Voting.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<VotingService>(VotingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
