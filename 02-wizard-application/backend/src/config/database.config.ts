import { MongoMemoryServer } from 'mongodb-memory-server';

export interface DatabaseConfig {
  uri: string;
  memoryServer?: MongoMemoryServer;
}

export class DatabaseConfigService {
  private static memoryServer: MongoMemoryServer | undefined;

  static async getConfig(): Promise<DatabaseConfig> {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const mongoUri = process.env.MONGODB_URI;

    // Production or Docker: Use provided MongoDB URI
    if (mongoUri) {
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
      'No MongoDB configuration found. Set MONGODB_URI environment variable.',
    );
  }

  static async cleanup(): Promise<void> {
    if (this.memoryServer) {
      await this.memoryServer.stop();
      this.memoryServer = undefined;
    }
  }
}
