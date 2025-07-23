import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsEmail,
  Matches,
  Length,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ACUnitQuantity {
  ONE = '1',
  TWO = '2',
  MORE_THAN_THREE = 'more_than_three',
  I_DONT_KNOW = 'i_dont_know',
}

export enum SystemType {
  SPLIT = 'split',
  PACKAGE = 'package',
  I_DONT_KNOW = 'i_dont_know',
}

export enum HeatingType {
  HEAT_PUMP = 'heat_pump',
  GAS = 'gas',
  I_DONT_KNOW = 'i_dont_know',
}

export enum QuoteStatus {
  QUESTIONNAIRE = 'questionnaire',
  CONTACT_INFO = 'contact_info',
  SUBMITTED = 'submitted',
}

export class QuoteRequest {
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  state: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{5}$/, { message: 'Zip code must be exactly 5 digits' })
  zipCode: string;

  @IsNotEmpty()
  @IsEnum(ACUnitQuantity)
  acUnitQuantity: ACUnitQuantity;

  @IsNotEmpty()
  @IsEnum(SystemType)
  systemType: SystemType;

  @IsNotEmpty()
  @IsEnum(HeatingType)
  heatingType: HeatingType;

  @IsNotEmpty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    // Strip all non-digit characters from phone number
    return typeof value === 'string' ? value.replace(/\D/g, '') : '';
  })
  @Matches(/^\d{10}$/, { message: 'Contact number must be exactly 10 digits' })
  contactNumber: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  emailAddress: string;

  @IsNotEmpty()
  @IsEnum(QuoteStatus)
  status: QuoteStatus;

  isQuestionnaireComplete?: boolean;

  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @IsOptional()
  @IsDateString()
  updatedAt?: Date;
}

export class SubmitQuoteRequest {
  @IsNotEmpty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    // Strip all non-digit characters from phone number
    return typeof value === 'string' ? value.replace(/\D/g, '') : '';
  })
  @Matches(/^\d{10}$/, { message: 'Contact number must be exactly 10 digits' })
  contactNumber: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  emailAddress: string;
}
