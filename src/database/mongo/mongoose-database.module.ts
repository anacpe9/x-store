import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as MongoosePagination from 'mongoose-paginate';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mongoConfig = configService.get('db.mongo');
        return {
          uri: mongoConfig.url,
          ...(mongoConfig.options || {}),
          useNewUrlParser: true,
          useUnifiedTopology: true,
          driverInfo: { name: 'Mongoose', version: '6.6.3' },
          connectionFactory: async (connection) => {
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
    }),
  ],
})
export class MongooseDatabaseModule {}
