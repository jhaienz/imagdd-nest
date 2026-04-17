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
    description: 'Registration slots are full (250 limit reached).',
    schema: {
      example: {
        statusCode: 503,
        message: 'Registration is full. The 250-slot limit has been reached.',
        error: 'Service Unavailable',
      },
    },
  })
  async register(@Body() dto: CreateRegistrationDto) {
    const data = await this.registrationService.register(dto);
    return { message: 'Registration successful.', data };
  }

  @Get('slots')
  @ApiOperation({ summary: 'Get available registration slot count' })
  @ApiOkResponse({
    description: 'Returns how many slots are registered and remaining.',
    schema: {
      example: {
        registered: 42,
        remaining: 208,
      },
    },
  })
  async getSlots() {
    return this.registrationService.getCount();
  }
}
