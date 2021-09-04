import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createConnection, getManager } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pgConfig = configService.get('db.pg');

        return {
          type: 'postgres',
          // url: pgConfig.url,
          host: pgConfig.connection.host,
          port: +pgConfig.connection.port,
          username: pgConfig.connection.username,
          password: pgConfig.connection.password,
          database: pgConfig.connection.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      connectionFactory: async (options) => {
        Logger.log('Postgres: Connection creating ...');
        const connection = await createConnection(options);

        Logger.log('Postgres: Connection connected.');
        const manager = await getManager(connection.name);

        Logger.log('Postgres: Connection testing ...');
        const result = await manager.query('SELECT now() AS curr_time');
        Logger.log(`Postgres: ${result[0].curr_time}`);

        Logger.log('Postgres: Connection confirm.');
        return connection;
      },
    }),
  ],
})
export class DatabaseModule {}
