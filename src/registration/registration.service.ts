import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRegistrationDto } from './registration.dto';
import {
  AttendanceType,
  Designation,
  OVERALL_SLOT_LIMIT,
  PROFESSIONAL_SLOT_LIMIT,
  Registration,
  RegistrationDocument,
  School,
  SCHOOL_SLOT_LIMIT,
  WORKSHOP_SLOT_LIMIT,
} from './registration.schema';

const WORKSHOP_LABELS: Record<string, string> = {
  workshop1: 'Workshop 1 — DIA Lab 1 (Day 1)',
  workshop2: 'Workshop 2 — DIA Lab 2 (Day 1)',
  workshop4: 'Workshop 4 — DIA Lab 1 (Day 2)',
  workshop5: 'Workshop 5 — DIA Lab 2 (Day 2)',
};

const PROFESSIONAL_DESIGNATIONS = [
  Designation.EDUCATOR,
  Designation.INDUSTRY_PROFESSIONAL,
  Designation.GAME_DEVELOPER,
  Designation.ANIMATOR,
  Designation.LGU,
  Designation.OTHER,
];

// Partner-school students use the school pool; everyone else uses the professional pool
const isPartnerSchool = (affiliation: string): boolean =>
  (Object.values(School) as string[]).includes(affiliation);

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
  ) {}

  async register(dto: CreateRegistrationDto): Promise<Registration> {
    // 1. Overall cap
    const totalCount = await this.registrationModel.countDocuments();
    if (totalCount >= OVERALL_SLOT_LIMIT) {
      throw new ServiceUnavailableException(
        `Registration is full. The ${OVERALL_SLOT_LIMIT}-slot limit has been reached.`,
      );
    }

    // 2. Duplicate email
    const existing = await this.registrationModel
      .findOne({ email: dto.email.toLowerCase() })
      .exec();
    if (existing) {
      throw new BadRequestException('This email address is already registered.');
    }

    // 3. Per-group slot check
    if (dto.designation === Designation.STUDENT && isPartnerSchool(dto.affiliation)) {
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
      // Other-school students and all non-students share the professional pool
      const professionalCount = await this.registrationModel.countDocuments({
        $or: [
          { designation: { $in: PROFESSIONAL_DESIGNATIONS } },
          { designation: Designation.STUDENT, affiliation: { $nin: Object.values(School) } },
        ],
      });
      if (professionalCount >= PROFESSIONAL_SLOT_LIMIT) {
        throw new ServiceUnavailableException(
          `Registration slots for this group are full (${PROFESSIONAL_SLOT_LIMIT}-slot limit reached).`,
        );
      }
    }

    // 4. Per-workshop slot check (students only)
    if (
      dto.designation === Designation.STUDENT &&
      dto.attendanceType === AttendanceType.WORKSHOP &&
      dto.workshopDay1 &&
      dto.workshopDay2
    ) {
      const [day1Count, day2Count] = await Promise.all([
        this.registrationModel.countDocuments({ workshopDay1: dto.workshopDay1 }),
        this.registrationModel.countDocuments({ workshopDay2: dto.workshopDay2 }),
      ]);

      if (day1Count >= WORKSHOP_SLOT_LIMIT) {
        throw new ServiceUnavailableException(
          `${WORKSHOP_LABELS[dto.workshopDay1]} is full (${WORKSHOP_SLOT_LIMIT}-slot limit reached).`,
        );
      }
      if (day2Count >= WORKSHOP_SLOT_LIMIT) {
        throw new ServiceUnavailableException(
          `${WORKSHOP_LABELS[dto.workshopDay2]} is full (${WORKSHOP_SLOT_LIMIT}-slot limit reached).`,
        );
      }
    }

    const registration = new this.registrationModel(dto);
    return registration.save();
  }

  async getCount() {
    const partnerSchools = Object.values(School);

    const [schools, professionals, total, seminarCount, workshopCount, workshops] =
      await Promise.all([
        Promise.all(
          partnerSchools.map(async (school) => ({
            school,
            registered: await this.registrationModel.countDocuments({
              affiliation: school,
              designation: Designation.STUDENT,
            }),
            limit: SCHOOL_SLOT_LIMIT,
          })),
        ),
        this.registrationModel.countDocuments({
          $or: [
            { designation: { $in: PROFESSIONAL_DESIGNATIONS } },
            { designation: Designation.STUDENT, affiliation: { $nin: partnerSchools } },
          ],
        }),
        this.registrationModel.countDocuments(),
        this.registrationModel.countDocuments({ attendanceType: AttendanceType.SEMINAR }),
        this.registrationModel.countDocuments({ attendanceType: AttendanceType.WORKSHOP }),
        Promise.all(
          ['workshop1', 'workshop2', 'workshop4', 'workshop5'].map(async (w) => {
            const field = w.startsWith('workshop') && ['workshop1', 'workshop2'].includes(w)
              ? 'workshopDay1'
              : 'workshopDay2';
            return {
              id: w,
              label: WORKSHOP_LABELS[w],
              registered: await this.registrationModel.countDocuments({ [field]: w }),
              limit: WORKSHOP_SLOT_LIMIT,
            };
          }),
        ),
      ]);

    return {
      overall: {
        registered: total,
        remaining: OVERALL_SLOT_LIMIT - total,
        limit: OVERALL_SLOT_LIMIT,
      },
      schools: schools.map((s) => ({
        ...s,
        remaining: SCHOOL_SLOT_LIMIT - s.registered,
      })),
      professionals: {
        registered: professionals,
        remaining: PROFESSIONAL_SLOT_LIMIT - professionals,
        limit: PROFESSIONAL_SLOT_LIMIT,
      },
      attendance: {
        seminar: seminarCount,
        workshop: workshopCount,
      },
      workshops: workshops.map((w) => ({
        ...w,
        remaining: WORKSHOP_SLOT_LIMIT - w.registered,
      })),
    };
  }
}
