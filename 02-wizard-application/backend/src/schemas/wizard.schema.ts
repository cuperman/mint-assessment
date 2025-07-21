import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ACUnitQuantity,
  SystemType,
  HeatingType,
  QuoteStatus,
} from '../dto/wizard.dto';

@Schema({ timestamps: true })
export class QuoteRequest extends Document {
  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ required: false })
  street: string;

  @Prop({ required: false })
  city: string;

  @Prop({ required: false, minlength: 2, maxlength: 2 })
  state: string;

  @Prop({ required: false, match: /^\d{5}$/ })
  zipCode: string;

  @Prop({ required: false, enum: Object.values(ACUnitQuantity) })
  acUnitQuantity: ACUnitQuantity;

  @Prop({ required: false, enum: Object.values(SystemType) })
  systemType: SystemType;

  @Prop({ required: false, enum: Object.values(HeatingType) })
  heatingType: HeatingType;

  @Prop({ required: false })
  contactName: string;

  @Prop({ required: false, match: /^\d{10}$/ })
  contactNumber: string;

  @Prop({ required: false })
  emailAddress: string;

  @Prop({
    required: true,
    enum: Object.values(QuoteStatus),
    default: QuoteStatus.QUESTIONNAIRE,
  })
  status: QuoteStatus;

  // Explicitly define timestamp fields for TypeScript
  createdAt?: Date;
  updatedAt?: Date;
}

export const QuoteRequestSchema = SchemaFactory.createForClass(QuoteRequest);
