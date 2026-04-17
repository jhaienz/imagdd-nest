import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRegistrationDto } from './registration.dto';
import {
  Designation,
  PROFESSIONAL_SLOT_LIMIT,
  Registration,
  RegistrationDocument,
  School,
  SCHOOL_SLOT_LIMIT,
} from './registration.schema';

const PROFESSIONAL_DESIGNATIONS = [
  Designation.EDUCATOR,
  Designation.INDUSTRY_PROFESSIONAL,
  Designation.GAME_DEVELOPER,
  Designation.OTHER,
];

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
  ) {}

  async register(dto: CreateRegistrationDto): Promise<Registration> {
    const existing = await this.registrationModel
      .findOne({ email: dto.email.toLowerCase() })
      .exec();
    if (existing) {
      throw new BadRequestException(
        'This email address is already registered.',
      );
    }

    if (dto.designation === Designation.STUDENT) {
      const schoolCount = await this.registrationModel.countDocuments({
        affiliation: dto.affiliation,
        designation: Designation.STUDENT,
      });
      if (schoolCount >= SCHOOL_SLOT_LIMIT) {
        throw new ServiceUnavailableException(
          `Registration slots for ${dto.affiliation} are full (${SCHOOL_SLOT_LIMIT}-slot limit reached).`,
        );
      }
    } else {
      const professionalCount = await this.registrationModel.countDocuments({
        designation: { $in: PROFESSIONAL_DESIGNATIONS },
      });
      if (professionalCount >= PROFESSIONAL_SLOT_LIMIT) {
        throw new ServiceUnavailableException(
          `Registration slots for professionals/educators are full (${PROFESSIONAL_SLOT_LIMIT}-slot limit reached).`,
        );
      }
    }

    const registration = new this.registrationModel(dto);
    return registration.save();
  }

  async getCount() {
    const [schools, professionals] = await Promise.all([
      Promise.all(
        Object.values(School).map(async (school) => ({
          school,
          registered: await this.registrationModel.countDocuments({
            affiliation: school,
            designation: Designation.STUDENT,
          }),
          limit: SCHOOL_SLOT_LIMIT,
        })),
      ),
      this.registrationModel.countDocuments({
        designation: { $in: PROFESSIONAL_DESIGNATIONS },
      }),
    ]);

    return {
      schools: schools.map((s) => ({
        ...s,
        remaining: SCHOOL_SLOT_LIMIT - s.registered,
      })),
      professionals: {
        registered: professionals,
        remaining: PROFESSIONAL_SLOT_LIMIT - professionals,
        limit: PROFESSIONAL_SLOT_LIMIT,
      },
    };
  }
}
