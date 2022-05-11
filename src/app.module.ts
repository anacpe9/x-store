import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AppRouteLoggerMiddleware } from './app-route-logger.middleware';

import configuration from './configurations';

const dbModule =
  process.env.NODE_ENV === 'test'
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('./database/database-test.module').rootMongooseTestModule()
    : DatabaseModule;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    dbModule,
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
