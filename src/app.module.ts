import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseDatabaseModule } from './database/mongo/mongoose-database.module';
import { PostgresDatabaseModule } from './database/postgres/pg-database.module';
import { AppRouteLoggerMiddleware } from './app-route-logger.middleware';

import configuration from './configurations';

const config = configuration();
const dbModules: any[] = [];

// if (config?.db?.pg?.activate) {
//   const dbModule =
//     process.env.NODE_ENV === 'test'
//       ? // eslint-disable-next-line @typescript-eslint/no-var-requires
//         require('./database/postgres/pg-database-test.module').rootMongooseTestModule()
//       : PostgresDatabaseModule;
//   dbModules.push(dbModule);
// }

if (config?.db?.mongo?.activate) {
  const dbModule =
    process.env.NODE_ENV === 'test'
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('./database/mongo/mongoose-database-test.module').rootMongooseTestModule()
      : MongooseDatabaseModule;
  dbModules.push(dbModule);
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ...dbModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppRouteLoggerMiddleware)
      .exclude('/access-control(/+)(.*)', '/health-check(.*)', '/worker(/+)(.*)')
      .forRoutes('/');
  }
}
