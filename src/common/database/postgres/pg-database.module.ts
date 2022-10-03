import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pgConfig = configService.get('db.pg');

        return {
          type: 'postgres',
          // type: 'postgres',
          // url: pgConfig.url,
          host: pgConfig.connection.host,
          port: +pgConfig.connection.port,
          username: pgConfig.connection.username,
          password: pgConfig.connection.password,
          database: pgConfig.connection.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        } as TypeOrmModuleOptions;
      },
      dataSourceFactory: async (options) => {
        Logger.log('Postgres: DataSource creating ...');
        const ds = new DataSource(options);

        Logger.log('pg-mem: DataSource initialize ...');
        await ds.initialize();

        if (options.synchronize) {
          Logger.log('pg-mem: Staring synchronize ...');
          await ds.synchronize();
        }

        Logger.log('pg-mem: DataSource testing ...');
        const result = await ds.query('SELECT now() AS curr_time');
        Logger.log(`'Postgres: ${result[0].curr_time}`);

        Logger.log('pg-mem: DataSource confirm.');
        return ds;
      },
    }),
  ],
})
export class PostgresDatabaseModule {}
