import { AuthzService } from './authz/authz.service';
import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseDatabaseModule } from './common/database/mongo/mongoose-database.module';
// import { PostgresDatabaseModule } from './common/database/postgres/pg-database.module';
import { AppRouteLoggerMiddleware } from './app-route-logger.middleware';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { JwtIgnoreExpirationStrategy, JwtStrategy } from './authz/jwt.guard';
import { InitialDataService } from './common/services/initial-data/initial-data.service';

import { Book, BookSchema } from './common/database/schemas/books.schema';
import { PurchasedBook, PurchasedBookSchema } from './common/database/schemas/purchased-book.schema';
import configuration from './configurations';
import { HttpModule } from '@nestjs/axios';
import { BooksController } from './books/books.controller';

const config = configuration();
const dbModules: any[] = [];

// if (config?.db?.pg?.activate) {
//   const dbModule =
//     process.env.NODE_ENV === 'test'
//       ? // eslint-disable-next-line @typescript-eslint/no-var-requires
//         require('./common/database/postgres/pg-database-test.module').rootMongooseTestModule()
//       : PostgresDatabaseModule;
//   dbModules.push(dbModule);
// }

const mongooseModules: DynamicModule[] = [];
if (config?.db?.mongo?.activate) {
  const dbModule =
    process.env.NODE_ENV === 'test'
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('./common/database/mongo/mongoose-database-test.module').rootMongooseTestModule()
      : MongooseDatabaseModule;
  dbModules.push(dbModule);
  mongooseModules.push(MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]));
  mongooseModules.push(MongooseModule.forFeature([{ name: PurchasedBook.name, schema: PurchasedBookSchema }]));
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ...mongooseModules,
    ...dbModules,
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // secret: configService.get<string>('auth.jwt.secret'),
        publicKey: Buffer.from(configService.get<string>('auth.jwt.public_key'), 'base64'),
        privateKey: Buffer.from(configService.get<string>('auth.jwt.private_key'), 'base64'),
        signOptions: {
          algorithm:
            configService.get<string>('auth.jwt.algorithms') === 'ES256'
              ? 'ES256'
              : configService.get<string>('auth.jwt.algorithms') === 'ES384'
              ? 'ES384'
              : configService.get<string>('auth.jwt.algorithms') === 'ES512'
              ? 'ES512'
              : 'RS256',
        },
      }),
    }),
  ],
  controllers: [AppController, BooksController],
  exports: [AppService, JwtStrategy, JwtIgnoreExpirationStrategy, InitialDataService, AuthzService],
  providers: [AppService, JwtStrategy, JwtIgnoreExpirationStrategy, InitialDataService, AuthzService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppRouteLoggerMiddleware)
      .exclude('/access-control(/+)(.*)', '/health-check(.*)', '/worker(/+)(.*)')
      .forRoutes('/');
  }
}
