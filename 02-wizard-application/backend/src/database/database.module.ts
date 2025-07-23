import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfigService } from '../config/database.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const config = await DatabaseConfigService.getConfig();
        return {
          uri: config.uri,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
