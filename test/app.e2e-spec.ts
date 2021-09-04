import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  it('/ (GET)', async () => {
    const res = await request(httpServer)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('description');
  });
});
