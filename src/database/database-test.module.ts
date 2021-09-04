import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { newDb } from 'pg-mem';
import { Connection, getManager } from 'typeorm';

const db = newDb({
  // https://github.com/nestjs/typeorm/issues/719
  // 👉 Recommended when using Typeorm .synchronize(), which creates foreign keys but not indices !
  autoCreateForeignKeyIndices: true,
});

// let pg: any; // MongoMemoryServer;
export const closeConnection = async () => {
  return Promise.resolve(true);
};

export const rootMongooseTestModule = () =>
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule.forRoot()],
    inject: [ConfigService],
    connectionFactory: async (): Promise<Connection> => {
      Logger.log('pg-mem: Connection creating ...');
      const connection = await db.adapters.createTypeormConnection({
        type: 'postgres',
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      });

      Logger.log('pg-mem: Connection connected.');
      const manager = await getManager(connection.name);

      Logger.log('pg-mem: Connection testing ...');
      const result = await manager.query('SELECT now() AS curr_time');
      Logger.log(`'Postgres: ${result[0].curr_time}`);

      Logger.log('pg-mem: Connection confirm.');
      return connection;
    },
    useFactory: async (configService: ConfigService) => {
      const pgConfig = configService.get('db.pg');

      const options = pgConfig.options || {};
      return {
        // type: 'postgres',
        // entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: true,
        ...options,
      };
    },
  });
