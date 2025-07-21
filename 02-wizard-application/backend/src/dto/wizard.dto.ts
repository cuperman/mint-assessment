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

export enum ACUnitQuantity {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  MORE_THAN_THREE = 'more_than_three',
  I_DONT_KNOW = 'i_dont_know',
}

export enum SystemType {
  SPLIT = 'split',
  PACKAGE = 'package',
  DUCTLESS = 'ductless',
  HEAT_PUMP = 'heat_pump',
  I_DONT_KNOW = 'i_dont_know',
}

export enum HeatingType {
  GAS = 'gas',
  ELECTRIC = 'electric',
  OIL = 'oil',
  HEAT_PUMP = 'heat_pump',
  GEOTHERMAL = 'geothermal',
  SOLAR = 'solar',
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
  @Matches(/^\d{10}$/, { message: 'Contact number must be exactly 10 digits' })
  contactNumber: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  emailAddress: string;

  @IsNotEmpty()
  @IsEnum(QuoteStatus)
  status: QuoteStatus;

  @IsOptional()
  @IsDateString()
  createdAt?: Date;

  @IsOptional()
  @IsDateString()
  updatedAt?: Date;
}
