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
          affiliation: 'University of the Philippines',
          contactNumber: '+63 912 345 6789',
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
    description: 'School or professional slots are full.',
    schema: {
      example: {
        statusCode: 503,
        message:
          'Registration slots for Ateneo De Naga are full (50-slot limit reached).',
        error: 'Service Unavailable',
      },
    },
  })
  async register(@Body() dto: CreateRegistrationDto) {
    const data = await this.registrationService.register(dto);
    return { message: 'Registration successful.', data };
  }

  @Get('slots')
  @ApiOperation({ summary: 'Get available registration slot counts per school and professional pool' })
  @ApiOkResponse({
    description: 'Returns slot counts per school (50 each) and professional pool (100 total).',
    schema: {
      example: {
        schools: [
          { school: 'Ateneo De Naga', registered: 10, limit: 50, remaining: 40 },
          { school: 'Naga College Foundation', registered: 5, limit: 50, remaining: 45 },
          {
            school: 'Bicol State College of Applied Sciences and Technology',
            registered: 20,
            limit: 50,
            remaining: 30,
          },
        ],
        professionals: { registered: 8, remaining: 92, limit: 100 },
      },
    },
  })
  async getSlots() {
    return this.registrationService.getCount();
  }
}
