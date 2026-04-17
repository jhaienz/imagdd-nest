import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRegistrationDto } from './registration.dto';
import { Registration, RegistrationDocument } from './registration.schema';

const MAX_SLOTS = 250;

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
  ) {}

  async register(dto: CreateRegistrationDto): Promise<Registration> {
    const count = await this.registrationModel.countDocuments();
    if (count >= MAX_SLOTS) {
      throw new ServiceUnavailableException(
        'Registration is full. The 250-slot limit has been reached.',
      );
    }

    const existing = await this.registrationModel
      .findOne({ email: dto.email.toLowerCase() })
      .exec();
    if (existing) {
      throw new BadRequestException(
        'This email address is already registered.',
      );
    }

    const registration = new this.registrationModel(dto);
    return registration.save();
  }

  async getCount(): Promise<{ registered: number; remaining: number }> {
    const registered = await this.registrationModel.countDocuments();
    return { registered, remaining: MAX_SLOTS - registered };
  }
}
