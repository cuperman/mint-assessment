import { MongoMemoryServer } from 'mongodb-memory-server';
import * as path from 'path';
import * as fs from 'fs';

export interface DatabaseConfig {
  uri: string;
  memoryServer?: MongoMemoryServer;
}

export class DatabaseConfigService {
  private static memoryServer: MongoMemoryServer | undefined;

  static async getConfig(): Promise<DatabaseConfig> {
    const nodeEnv = process.env.NODE_ENV || 'development';

    // Check for individual MongoDB configuration parameters
    const mongoHost = process.env.MONGODB_HOST;
    const mongoPort = process.env.MONGODB_PORT;
    const mongoUsername = process.env.MONGODB_USERNAME;
    const mongoPassword = process.env.MONGODB_PASSWORD;
    const mongoSsl = process.env.MONGODB_SSL;
    const mongoDatabase = process.env.MONGODB_DATABASE || 'wizard_app';

    // Production or Docker: Use provided MongoDB configuration
    if (mongoHost) {
      // Construct MongoDB URI from individual components
      let mongoUri = 'mongodb://';

      // Add authentication if provided
      if (mongoUsername && mongoPassword) {
        mongoUri += `${encodeURIComponent(mongoUsername)}:${encodeURIComponent(mongoPassword)}@`;
      }

      // Add host and port
      mongoUri += mongoHost;
      if (mongoPort) {
        mongoUri += `:${mongoPort}`;
      }

      // Add database name
      mongoUri += `/${mongoDatabase}`;

      // Add SSL option if specified
      if (mongoSsl === 'true') {
        // Path to the AWS DocumentDB certificate
        const certPath = path.join(__dirname, '../../global-bundle.pem');

        // Check if certificate file exists
        if (fs.existsSync(certPath)) {
          mongoUri += `?ssl=true&tlsCAFile=${encodeURIComponent(certPath)}&authMechanism=SCRAM-SHA-1&retryWrites=false`;

          console.log(
            `🗄️  Connecting to MongoDB with SSL certificate: ${mongoUri.replace(/:[^@]*@/, ':***@')}`,
          );

          return { uri: mongoUri };
        } else {
          mongoUri +=
            '?ssl=true&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true&authMechanism=SCRAM-SHA-1&retryWrites=false';

          console.log(
            `⚠️  SSL enabled but certificate not found at ${certPath}. Using SSL without certificate validation.`,
          );
          console.log(
            `🗄️  Connecting to MongoDB with SSL (no cert validation): ${mongoUri.replace(/:[^@]*@/, ':***@')}`,
          );

          return { uri: mongoUri };
        }
      }

      // Add retryWrites=false for DocumentDB compatibility
      mongoUri += '?retryWrites=false';

      console.log(
        `🗄️  Connecting to MongoDB: ${mongoUri.replace(/:[^@]*@/, ':***@')}`,
      );
      return { uri: mongoUri };
    }

    // Development/Test: Use MongoDB Memory Server
    if (nodeEnv === 'development' || nodeEnv === 'test') {
      if (!this.memoryServer) {
        console.log('🧪 Starting MongoDB Memory Server for development...');
        this.memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'wizard_app_dev',
          },
        });
      }

      const uri = this.memoryServer.getUri();
      console.log(`🗄️  MongoDB Memory Server running: ${uri}`);

      return {
        uri,
        memoryServer: this.memoryServer,
      };
    }

    throw new Error(
      'No MongoDB configuration found. Set MONGODB_HOST environment variable or ensure NODE_ENV is set to development/test for MongoDB Memory Server.',
    );
  }

  static async cleanup(): Promise<void> {
    if (this.memoryServer) {
      await this.memoryServer.stop();
      this.memoryServer = undefined;
    }
  }
}
