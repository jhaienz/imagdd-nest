import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { VotingService } from './voting.service';
import { Voting } from './schema/voting.schema';

describe('VotingService', () => {
  let service: VotingService;
  let votingModel: {
    findOne: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(() => {
    votingModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotingService,
        {
          provide: getModelToken(Voting.name),
          useValue: votingModel,
        },
      ],
    }).compile();

    service = module.get<VotingService>(VotingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject vote when email domain is not resolvable', async () => {
    jest
      .spyOn(service as any, 'hasResolvableDomain')
      .mockResolvedValueOnce(false);

    await expect(
      service.vote({
        email: 'user@invalid-domain.tld',
        school: 'QCU',
        vote: 1,
      }),
    ).rejects.toThrow(new BadRequestException('Email domain does not exist.'));

    expect(votingModel.findOne).not.toHaveBeenCalled();
    expect(votingModel.create).not.toHaveBeenCalled();
  });

  it('should reject duplicate votes for same email', async () => {
    jest
      .spyOn(service as any, 'hasResolvableDomain')
      .mockResolvedValueOnce(true);

    votingModel.findOne.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve({ _id: 'existing-vote' }),
      }),
    });

    await expect(
      service.vote({
        email: 'duplicate@example.com',
        school: 'QCU',
        vote: 2,
      }),
    ).rejects.toThrow(new BadRequestException('This email has already voted.'));

    expect(votingModel.create).not.toHaveBeenCalled();
  });

  it('should create vote for valid payload', async () => {
    jest
      .spyOn(service as any, 'hasResolvableDomain')
      .mockResolvedValueOnce(true);

    votingModel.findOne.mockReturnValue({
      lean: () => ({
        exec: () => Promise.resolve(null),
      }),
    });
    votingModel.create.mockResolvedValue({
      _id: 'new-vote',
      email: 'voter@example.com',
      school: 'QCU',
      vote: 3,
    });

    const result = await service.vote({
      email: '  Voter@Example.Com  ',
      school: 'QCU',
      vote: 3,
    });

    expect(votingModel.create).toHaveBeenCalledWith({
      email: 'voter@example.com',
      school: 'QCU',
      vote: 3,
    });
    expect(result).toEqual({
      message: 'Vote submitted successfully.',
      vote: {
        _id: 'new-vote',
        email: 'voter@example.com',
        school: 'QCU',
        vote: 3,
      },
    });
  });
});
