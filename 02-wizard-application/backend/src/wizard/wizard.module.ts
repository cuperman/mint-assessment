import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WizardController } from '../controllers/wizard.controller';
import { WizardService } from '../services/wizard.service';
import { QuoteRequest, QuoteRequestSchema } from '../schemas/wizard.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuoteRequest.name, schema: QuoteRequestSchema },
    ]),
  ],
  controllers: [WizardController],
  providers: [WizardService],
})
export class WizardModule {}
