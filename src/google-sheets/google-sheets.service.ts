import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';
import { RegistrationDocument } from '../registration/registration.schema';

const HEADERS = [
  'Email',
  'Full Name',
  'Designation',
  'Affiliation',
  'Contact Number',
  'Attendance Type',
  'Workshop Day 1',
  'Workshop Day 2',
  'Registered At',
];

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets: sheets_v4.Sheets | null = null;
  private sheetId: string | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const credentialsB64 = this.configService.get<string>('GOOGLE_CREDENTIALS_JSON');
    this.sheetId = this.configService.get<string>('GOOGLE_SHEET_ID') ?? null;

    if (!credentialsB64 || !this.sheetId) {
      this.logger.warn('Google Sheets credentials not configured — sheet sync disabled.');
      return;
    }

    try {
      const credentials = JSON.parse(
        Buffer.from(credentialsB64, 'base64').toString('utf-8'),
      );
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      this.sheets = google.sheets({ version: 'v4', auth });
      this.logger.log('Google Sheets client initialised.');
    } catch (err) {
      this.logger.error('Failed to initialise Google Sheets client.', err);
    }
  }

  private toRow(reg: RegistrationDocument): string[] {
    return [
      reg.email,
      reg.fullName,
      reg.designation,
      reg.affiliation,
      reg.contactNumber,
      reg.attendanceType,
      reg.workshopDay1 ?? '',
      reg.workshopDay2 ?? '',
      reg.createdAt instanceof Date ? reg.createdAt.toISOString() : String(reg.createdAt ?? ''),
    ];
  }

  async syncAll(registrations: RegistrationDocument[]): Promise<void> {
    if (!this.sheets || !this.sheetId) return;

    try {
      // Clear everything below the header, then write all rows
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.sheetId,
        range: 'Sheet1!A2:Z',
      });

      if (registrations.length === 0) return;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [HEADERS, ...registrations.map((r) => this.toRow(r))],
        },
      });

      this.logger.log(`Synced ${registrations.length} registrations to Google Sheets.`);
    } catch (err) {
      this.logger.error('Failed to sync registrations to Google Sheets.', err);
    }
  }

  async appendRow(registration: RegistrationDocument): Promise<void> {
    if (!this.sheets || !this.sheetId) return;

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [this.toRow(registration)] },
      });
    } catch (err) {
      this.logger.error('Failed to append registration row to Google Sheets.', err);
    }
  }
}
