import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CORE_DESIGNATIONS,
  CreateRegistrationDto,
  FILTER_WORKSHOPS,
  FilterRegistrationsDto,
  OTHER_DESIGNATIONS_FILTER,
  OTHER_SCHOOLS_FILTER,
} from './registration.dto';
import {
  AttendanceDay,
  AttendanceType,
  DAILY_SLOT_LIMIT,
  Designation,
  MAX_REGISTRATION_FEE,
  OVERALL_SLOT_LIMIT,
  PROFESSIONAL_SLOT_LIMIT,
  REGISTRATION_FEE_PER_DAY,
  Registration,
  RegistrationDocument,
  School,
  SCHOOL_SLOT_LIMIT,
  WORKSHOP_SLOT_LIMIT,
} from './registration.schema';
import { GoogleSheetsService } from '../google-sheets/google-sheets.service';
  
const WORKSHOP_LABELS: Record<string, string> = {
  workshop1: 'Workshop 1 — DIA Lab 1 (Day 1)',
  workshop3: 'Workshop 2 — DIA Lab 2 (Day 1)',
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

const DAY_QUERY_MAP = {
  day1: AttendanceDay.DAY_1,
  day2: AttendanceDay.DAY_2,
} as const;

// Partner-school students use the school pool; everyone else uses the professional pool
const isPartnerSchool = (affiliation: string): boolean =>
  (Object.values(School) as string[]).includes(affiliation);

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class RegistrationService implements OnModuleInit {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async onModuleInit() {
    const all = await this.registrationModel.find().exec();
    await this.googleSheetsService.syncAll(all);
  }

  async register(dto: CreateRegistrationDto): Promise<Registration> {
    // 1. Per-day cap
    const dayCount = await this.registrationModel.countDocuments({
      attendanceDay: dto.attendanceDay,
    });
    if (dayCount >= DAILY_SLOT_LIMIT) {
      throw new ServiceUnavailableException(
        `Registration is full for ${dto.attendanceDay} (${DAILY_SLOT_LIMIT}-slot limit reached).`,
      );
    }

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
        attendanceDay: dto.attendanceDay,
      });
      if (schoolCount >= SCHOOL_SLOT_LIMIT) {
        throw new ServiceUnavailableException(
          `Registration slots for ${dto.affiliation} on ${dto.attendanceDay} are full (${SCHOOL_SLOT_LIMIT}-slot limit reached).`,
        );
      }
    } else {
      // Other-school students and all non-students share the professional pool
      const professionalCount = await this.registrationModel.countDocuments({
        attendanceDay: dto.attendanceDay,
        $or: [
          { designation: { $in: PROFESSIONAL_DESIGNATIONS } },
          { designation: Designation.STUDENT, affiliation: { $nin: Object.values(School) } },
        ],
      });
      if (professionalCount >= PROFESSIONAL_SLOT_LIMIT) {
        throw new ServiceUnavailableException(
          `Registration slots for this group on ${dto.attendanceDay} are full (${PROFESSIONAL_SLOT_LIMIT}-slot limit reached).`,
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
    const saved = await registration.save();
    await this.googleSheetsService.appendRow(saved);
    return saved;
  }

  async getRegistrations(filters: FilterRegistrationsDto): Promise<Registration[]> {
    const query: Record<string, unknown> = {};
    const partnerSchools = Object.values(School);

    if (filters.name?.trim()) {
      query.fullName = {
        $regex: escapeRegExp(filters.name.trim()),
        $options: 'i',
      };
    }

    if (filters.attendanceDay) {
      query.attendanceDay = filters.attendanceDay;
    }

    if (filters.schools?.length) {
      const includeOtherSchools = filters.schools.includes(OTHER_SCHOOLS_FILTER);
      const explicitSchools = filters.schools.filter(
        (school) => school !== OTHER_SCHOOLS_FILTER,
      );

      if (includeOtherSchools && explicitSchools.length) {
        query.$and = [
          ...(Array.isArray(query.$and)
            ? (query.$and as Record<string, unknown>[])
            : []),
          {
            $or: [
              { affiliation: { $in: explicitSchools } },
              { affiliation: { $nin: partnerSchools } },
            ],
          },
        ];
      } else if (includeOtherSchools) {
        query.affiliation = { $nin: partnerSchools };
      } else {
        query.affiliation = { $in: explicitSchools };
      }
    }

    if (filters.designations?.length) {
      const includeOthers = filters.designations.includes(OTHER_DESIGNATIONS_FILTER);
      const explicitDesignations = filters.designations.filter(
        (designation) => designation !== OTHER_DESIGNATIONS_FILTER,
      );

      if (includeOthers && explicitDesignations.length) {
        query.$and = [
          ...(Array.isArray(query.$and)
            ? (query.$and as Record<string, unknown>[])
            : []),
          {
            $or: [
              { designation: { $in: explicitDesignations } },
              { designation: { $nin: CORE_DESIGNATIONS } },
            ],
          },
        ];
      } else if (includeOthers) {
        query.designation = { $nin: CORE_DESIGNATIONS };
      } else {
        query.designation = { $in: explicitDesignations };
      }
    }

    if (filters.workshops?.length) {
      const day1WorkshopSet = new Set<string>([FILTER_WORKSHOPS[0], FILTER_WORKSHOPS[1]]);
      const day2WorkshopSet = new Set<string>([FILTER_WORKSHOPS[2], FILTER_WORKSHOPS[3]]);

      const day1Workshops = filters.workshops.filter((workshop) => day1WorkshopSet.has(workshop));
      const day2Workshops = filters.workshops.filter((workshop) => day2WorkshopSet.has(workshop));

      const workshopClauses: Record<string, unknown>[] = [];

      if (day1Workshops.length) {
        workshopClauses.push({ workshopDay1: { $in: day1Workshops } });
      }

      if (day2Workshops.length) {
        workshopClauses.push({ workshopDay2: { $in: day2Workshops } });
      }

      if (workshopClauses.length === 1) {
        Object.assign(query, workshopClauses[0]);
      }

      if (workshopClauses.length > 1) {
        query.$or = workshopClauses;
      }
    }

    return this.registrationModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getCount() {
    const partnerSchools = Object.values(School);
    const professionalPoolQuery = {
      $or: [
        { designation: { $in: PROFESSIONAL_DESIGNATIONS } },
        { designation: Designation.STUDENT, affiliation: { $nin: partnerSchools } },
      ],
    };

    const [
      schools,
      professionals,
      professionalsDay1,
      professionalsDay2,
      total,
      seminarCount,
      workshopCount,
      day1Count,
      day2Count,
      unassignedCount,
      workshops,
    ] = await Promise.all([
        Promise.all(
          partnerSchools.map(async (school) => {
            const [totalRegistered, day1Registered, day2Registered] = await Promise.all([
              this.registrationModel.countDocuments({
                affiliation: school,
                designation: Designation.STUDENT,
              }),
              this.registrationModel.countDocuments({
                affiliation: school,
                designation: Designation.STUDENT,
                attendanceDay: DAY_QUERY_MAP.day1,
              }),
              this.registrationModel.countDocuments({
                affiliation: school,
                designation: Designation.STUDENT,
                attendanceDay: DAY_QUERY_MAP.day2,
              }),
            ]);

            return {
              school,
              registered: totalRegistered,
              limit: SCHOOL_SLOT_LIMIT,
              byDay: {
                day1: {
                  registered: day1Registered,
                  limit: SCHOOL_SLOT_LIMIT,
                  remaining: Math.max(0, SCHOOL_SLOT_LIMIT - day1Registered),
                },
                day2: {
                  registered: day2Registered,
                  limit: SCHOOL_SLOT_LIMIT,
                  remaining: Math.max(0, SCHOOL_SLOT_LIMIT - day2Registered),
                },
              },
            };
          }),
        ),
        this.registrationModel.countDocuments(professionalPoolQuery),
        this.registrationModel.countDocuments({
          ...professionalPoolQuery,
          attendanceDay: DAY_QUERY_MAP.day1,
        }),
        this.registrationModel.countDocuments({
          ...professionalPoolQuery,
          attendanceDay: DAY_QUERY_MAP.day2,
        }),
        this.registrationModel.countDocuments(),
        this.registrationModel.countDocuments({ attendanceType: AttendanceType.SEMINAR }),
        this.registrationModel.countDocuments({ attendanceType: AttendanceType.WORKSHOP }),
        this.registrationModel.countDocuments({ attendanceDay: AttendanceDay.DAY_1 }),
        this.registrationModel.countDocuments({ attendanceDay: AttendanceDay.DAY_2 }),
        this.registrationModel.countDocuments({
          $or: [
            { attendanceDay: { $exists: false } },
            { attendanceDay: null },
            { attendanceDay: '' },
          ],
        }),
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
        byDay: {
          day1: {
            registered: professionalsDay1,
            limit: PROFESSIONAL_SLOT_LIMIT,
            remaining: Math.max(0, PROFESSIONAL_SLOT_LIMIT - professionalsDay1),
          },
          day2: {
            registered: professionalsDay2,
            limit: PROFESSIONAL_SLOT_LIMIT,
            remaining: Math.max(0, PROFESSIONAL_SLOT_LIMIT - professionalsDay2),
          },
        },
      },
      fees: {
        perDay: REGISTRATION_FEE_PER_DAY,
        max: MAX_REGISTRATION_FEE,
      },
      attendanceDays: {
        day1: {
          registered: day1Count,
          remaining: Math.max(0, DAILY_SLOT_LIMIT - day1Count),
          limit: DAILY_SLOT_LIMIT,
        },
        day2: {
          registered: day2Count,
          remaining: Math.max(0, DAILY_SLOT_LIMIT - day2Count),
          limit: DAILY_SLOT_LIMIT,
        },
        unassigned: unassignedCount,
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
