import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { Registration, RegistrationSchema } from './registration.schema';
import { GoogleSheetsModule } from '../google-sheets/google-sheets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    GoogleSheetsModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}
