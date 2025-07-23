import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { WizardModule } from './wizard/wizard.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  imports: [DatabaseModule, WizardModule],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
