import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as MongoosePagination from 'mongoose-paginate';

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = () =>
  MongooseModule.forRootAsync({
    imports: [ConfigModule.forRoot()],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const mongoConfig = configService.get('db.mongo');

      mongod = new MongoMemoryServer();

      await mongod.start();
      await mongod.ensureInstance();

      const mongoUri = await mongod.getUri();

      return {
        uri: mongoUri,
        ...(mongoConfig.options || {}),
        connectionFactory: async (connection) => {
          Logger.log('Use mongodb-memory-server for testing');

          if (!connection) {
            throw new Error('Mongo: Can not connect to database');
          } else {
            Logger.log('Mongo: inject MongoosePagination');
            connection.plugin(MongoosePagination);

            Logger.log('Mongo: Connect to database success');
            // connection.use({ useCreateIndex: true })
            return connection;
          }
        },
      };
    },
  });

export const closeInMongodConnection = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};
