import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiBadRequestResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRegistrationDto } from './registration.dto';
import { AttendanceDay } from './registration.schema';
import { RegistrationService } from './registration.service';

@ApiTags('Registration')
@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a participant' })
  @ApiBody({ type: CreateRegistrationDto })
  @ApiCreatedResponse({
    description: 'Registration successful.',
    schema: {
      example: {
        message: 'Registration successful.',
        data: {
          _id: '664a1f2e3b1c2d4e5f6a7b8c',
          email: 'juan.dela.cruz@email.com',
          fullName: 'Juan Dela Cruz',
          designation: 'student',
          affiliation: 'ADNU',
          contactNumber: '+63 912 345 6789',
          attendanceDay: AttendanceDay.DAY_1,
          attendanceType: 'workshop',
          workshopDay1: 'workshop1',
          workshopDay2: 'workshop4',
          createdAt: '2026-04-17T08:00:00.000Z',
          updatedAt: '2026-04-17T08:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error or duplicate email.',
    schema: {
      example: {
        statusCode: 400,
        message: 'This email address is already registered.',
        error: 'Bad Request',
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Overall, school, professional, or workshop slots are full.',
    schema: {
      example: {
        statusCode: 503,
        message: 'Workshop 1 — DIA Lab 1 (Day 1) is full (30-slot limit reached).',
        error: 'Service Unavailable',
      },
    },
  })
  async register(@Body() dto: CreateRegistrationDto) {
    const data = await this.registrationService.register(dto);
    return { message: 'Registration successful.', data };
  }

  @Get('slots')
  @ApiOperation({ summary: 'Get available registration slot counts' })
  @ApiOkResponse({
    description:
      'Returns fee totals, overall capacity, per-day counts, per-school counts, professional pool, attendance type, and per-workshop counts.',
    schema: {
      example: {
        fees: { perDay: 250, max: 500 },
        overall: { registered: 43, remaining: 457, limit: 500 },
        attendanceDays: {
          day1: { registered: 22, remaining: 228, limit: 250 },
          day2: { registered: 21, remaining: 229, limit: 250 },
          unassigned: 0,
        },
        schools: [
          {
            school: 'ADNU',
            registered: 10,
            limit: 50,
            remaining: 40,
            byDay: {
              day1: { registered: 10, remaining: 40, limit: 50 },
              day2: { registered: 0, remaining: 50, limit: 50 },
            },
          },
          {
            school: 'NCF',
            registered: 5,
            limit: 50,
            remaining: 45,
            byDay: {
              day1: { registered: 2, remaining: 48, limit: 50 },
              day2: { registered: 3, remaining: 47, limit: 50 },
            },
          },
          {
            school: 'BISCAST',
            registered: 20,
            limit: 50,
            remaining: 30,
            byDay: {
              day1: { registered: 12, remaining: 38, limit: 50 },
              day2: { registered: 8, remaining: 42, limit: 50 },
            },
          },
        ],
        professionals: {
          registered: 8,
          remaining: 92,
          limit: 100,
          byDay: {
            day1: { registered: 5, remaining: 95, limit: 100 },
            day2: { registered: 3, remaining: 97, limit: 100 },
          },
        },
        attendance: { seminar: 25, workshop: 18 },
        workshops: [
          { id: 'workshop1', label: 'Workshop 1 — DIA Lab 1 (Day 1)', registered: 12, limit: 30, remaining: 18 },
          { id: 'workshop2', label: 'Workshop 2 — DIA Lab 2 (Day 1)', registered: 6, limit: 30, remaining: 24 },
          { id: 'workshop4', label: 'Workshop 4 — DIA Lab 1 (Day 2)', registered: 9, limit: 30, remaining: 21 },
          { id: 'workshop5', label: 'Workshop 5 — DIA Lab 2 (Day 2)', registered: 3, limit: 30, remaining: 27 },
        ],
      },
    },
  })
  async getSlots() {
    return this.registrationService.getCount();
  }
}
