import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable validation with detailed error responses
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert primitive types automatically
      },
      exceptionFactory: (errors) => {
        // Transform validation errors into a structured format
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          value: error.value as string | number | boolean | null | undefined,
          constraints: error.constraints,
          messages: Object.values(error.constraints || {}),
        }));

        return new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: formattedErrors,
        });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `Backend server running on http://localhost:${process.env.PORT ?? 3001}`,
  );
}
void bootstrap();
