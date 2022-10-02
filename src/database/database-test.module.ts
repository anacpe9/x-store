import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { newDb } from 'pg-mem';
import { DataSource } from 'typeorm';
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

// https://issueexplorer.com/issue/oguimbal/pg-mem/148
db.public.registerFunction({
  implementation: () => 'test',
  name: 'current_database',
});

db.public.registerFunction({
  implementation: () =>
    'PostgreSQL 11.17 (Debian 11.17-0+deb10u1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 8.3.0-6) 8.3.0, 64-bit',
  name: 'version',
});

// Problem with big decimal field on table creation
// https://lightrun.com/answers/oguimbal-pg-mem-problem-with-big-decimal-field-on-table-creation
db.public.interceptQueries((sql) => {
  const newSql = sql.replace(/\bnumeric\s*\(\s*\d+\s*,\s*\d+\s*\)/g, 'float');
  if (sql !== newSql) {
    return db.public.many(newSql);
  }
  // proceed to actual SQL execution for other requests.
  return null;
});

// let pg: any; // MongoMemoryServer;
export const closeConnection = async () => {
  return Promise.resolve(true);
};

export const rootMongooseTestModule = () =>
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule.forRoot()],
    inject: [ConfigService],
    dataSourceFactory: async (): Promise<DataSource> => {
      Logger.log('pg-mem: DataSource creating ...');

      const ds: DataSource = await db.adapters.createTypeormDataSource({
        type: 'postgres',
        // synchronize: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      });

      Logger.log('pg-mem: DataSource initialize ...');
      await ds.initialize();

      Logger.log('pg-mem: Staring synchronize ...');
      await ds.synchronize();

      Logger.log('pg-mem: DataSource testing ...');
      const result = await ds.query('SELECT now() AS curr_time');
      Logger.log(`'Postgres: ${result[0].curr_time}`);

      Logger.log('pg-mem: DataSource confirm.');
      return ds;
    },
    useFactory: async (configService: ConfigService) => {
      const pgConfig = configService.get('db.pg');

      const options = pgConfig.options || {};
      return {
        // type: 'postgres',
        // entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: true,
        ...options,
      } as TypeOrmModuleOptions;
    },
  });
