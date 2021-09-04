import { Logger, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

function setupSwagger(app: INestApplication) {
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Workplace Plus Server')
    .setDescription('Workplace Plus Server, Backend and Management API')
    .setVersion('0.0.1')
    .addServer('/')
    .addServer('/data')
    .addBasicAuth()
    // .addApiKey({
    //   type: 'apiKey',
    //   name: 'access-token',
    //   in: 'header',
    // })
    .build();

  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      urls: [
        {
          url: '../swagger-ui-json',
          description: 'Workplace Plus API Spec (json)',
        },
      ],
    },
  };

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('swagger-ui', app, swaggerDocument, swaggerCustomOptions);
}

async function bootstrap() {
  const env = process.env.NODE_ENV || 'development';
  Logger.log(`Application starting on ${env} environment`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['debug'],
  });

  // app.useGlobalFilters(new ErrorsFilter());
  app.disable('x-powered-by');
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('http.port') || 3000;

  if (env === 'development') setupSwagger(app);

  await app.listen(port);
  Logger.log(`Application started and listen on ${await app.getUrl()}`);
}
bootstrap();
