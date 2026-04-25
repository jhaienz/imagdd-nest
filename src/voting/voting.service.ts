import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVotingDto } from './dto/voting.dto';
import { resolve4, resolve6, resolveMx } from 'node:dns/promises';
import {
  Designation,
  Games,
  School,
  Voting,
  VotingDocument,
} from './schema/voting.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class VotingService {
  constructor(
    @InjectModel(Voting.name)
    private readonly votingModel: Model<VotingDocument>,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async hasResolvableDomain(domain: string): Promise<boolean> {
    try {
      const mxRecords = await resolveMx(domain);
      if (mxRecords.length > 0) {
        return true;
      }
    } catch {
      // Fallback to A/AAAA if MX lookup fails.
    }

    const [ipv4Lookup, ipv6Lookup] = await Promise.allSettled([
      resolve4(domain),
      resolve6(domain),
    ]);

    const hasIpv4 =
      ipv4Lookup.status === 'fulfilled' && ipv4Lookup.value.length > 0;
    const hasIpv6 =
      ipv6Lookup.status === 'fulfilled' && ipv6Lookup.value.length > 0;

    return hasIpv4 || hasIpv6;
  }

  private async ensureEmailDomainExists(email: string): Promise<void> {
    const [, domain] = email.split('@');

    if (!domain || !(await this.hasResolvableDomain(domain))) {
      throw new BadRequestException('Email domain does not exist.');
    }
  }

  private getGameName(gameNumber: number): Games {
    const games = Object.values(Games);
    const game = games[gameNumber - 1];
    if (!game) {
      throw new BadRequestException('Invalid game number. Use 1 to 18.');
    }
    return game;
  }

  private getVotingCutoffTime(): { hour: number; minute: number } {
    const cutoff = process.env.VOTING_CUTOFF || '16:30';
    const [hourString, minuteString] = cutoff.split(':');
    const hour = Number(hourString);
    const minute = Number(minuteString);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
      return { hour: 16, minute: 30 };
    }

    return { hour, minute };
  }

  private isVotingClosed(): boolean {
    const now = new Date();
    const { hour, minute } = this.getVotingCutoffTime();
    const cutoff = new Date(now);
    cutoff.setHours(hour, minute, 0, 0);
    return now >= cutoff;
  }

  private resolveVoterProfile(createVotingDto: CreateVotingDto): {
    school?: School;
    proffesional?: Designation;
  } {
    const { school, proffesional } = createVotingDto;

    if (!school && !proffesional) {
      throw new BadRequestException(
        'Provide either school (student) or proffesional.',
      );
    }

    if (school && proffesional) {
      throw new BadRequestException(
        'Provide only one voter type: school or proffesional.',
      );
    }

    return {
      school: school as School | undefined,
      proffesional: proffesional as Designation | undefined,
    };
  }

  async vote(createVotingDto: CreateVotingDto) {
    const email = this.normalizeEmail(createVotingDto.email);
    const gameNumber = createVotingDto.vote;
    this.getGameName(gameNumber);

    if (this.isVotingClosed()) {
      const { hour, minute } = this.getVotingCutoffTime();
      const formattedMinute = minute.toString().padStart(2, '0');
      throw new BadRequestException(
        `Voting is closed after ${hour}:${formattedMinute} today.`,
      );
    }

    await this.ensureEmailDomainExists(email);
    const voterProfile = this.resolveVoterProfile(createVotingDto);

    const existingVote = await this.votingModel
      .findOne({ email })
      .lean()
      .exec();
    if (existingVote) {
      throw new BadRequestException('This email has already voted.');
    }

    const vote = await this.votingModel.create({
      email,
      vote: gameNumber,
      ...voterProfile,
    });

    return {
      message: 'Vote submitted successfully.',
      vote,
    };
  }

  async getVotesStatistics() {
    const votes = await this.votingModel.find().lean().exec();
    const byGame = Array.from({ length: 18 }, (_, index) => {
      const gameNumber = index + 1;
      const game = this.getGameName(gameNumber);
      const gameVotes = votes.filter((vote) => vote.vote === gameNumber);

      const studentVotesBySchool = Object.values(School).reduce<
        Record<string, number>
      >((acc, school) => {
        acc[school] = gameVotes.filter((vote) => vote.school === school).length;
        return acc;
      }, {});

      const professionalVotesByDesignation = Object.values(Designation).reduce<
        Record<string, number>
      >((acc, designation) => {
        acc[designation] = gameVotes.filter(
          (vote) => vote.proffesional === designation,
        ).length;
        return acc;
      }, {});

      const topSchool = Object.entries(studentVotesBySchool).sort(
        (a, b) => b[1] - a[1],
      )[0] ?? [null, 0];
      const topProfessional = Object.entries(
        professionalVotesByDesignation,
      ).sort((a, b) => b[1] - a[1])[0] ?? [null, 0];

      return {
        game,
        gameNumber,
        totalVotes: gameVotes.length,
        studentVotesBySchool,
        professionalVotesByDesignation,
        topStudentSchool: {
          school: topSchool[0],
          votes: topSchool[1],
        },
        topProfessionalDesignation: {
          designation: topProfessional[0],
          votes: topProfessional[1],
        },
      };
    });

    return {
      totalVotes: votes.length,
      byGame,
    };
  }
}
