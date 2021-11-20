import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { newDb } from 'pg-mem';
import { Connection, getManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

const db = newDb({
  // https://github.com/nestjs/typeorm/issues/719
  // 👉 Recommended when using Typeorm .synchronize(), which creates foreign keys but not indices !
  autoCreateForeignKeyIndices: true,
});
// https://github.com/oguimbal/pg-mem/issues/148
db.public.registerFunction({
  implementation: () => 'postgres',
  name: 'current_database',
});

db.public.registerFunction({
  implementation: () => uuidv4(),
  name: 'uuid_generate_v4',
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
        // synchronize: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      });

      Logger.log('pg-mem: Connection connected.');
      const manager = await getManager(connection.name);

      Logger.log('pg-mem: Connection testing ...');
      const result = await manager.query('SELECT now() AS curr_time');
      Logger.log(`'Postgres: ${result[0].curr_time}`);

      Logger.log('pg-mem: Staring synchronize ...');
      await connection.synchronize();

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
