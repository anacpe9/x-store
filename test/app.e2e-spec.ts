import { ErrorFilter } from './../src/common/filters/error.filter';
import { closeInMongodConnection } from '../src/common/database/mongo/mongoose-database-test.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { sign } from 'jsonwebtoken';
import { AppModule } from '../src/app.module';

import configurations from '../src/configurations';
const config = configurations();

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let adminToken;
  let userToken;

  afterAll(async () => {
    await closeInMongodConnection();
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalFilters(new ErrorFilter());

    await app.init();
    httpServer = app.getHttpServer();

    const privateKey = Buffer.from(config.auth.jwt.private_key, 'base64');
    adminToken = sign({ id: '0', email: 'admin@x-store.local', role: 'admin' }, privateKey, {
      algorithm: 'ES256',
      expiresIn: '1m',
    });
    userToken = sign({ id: '100', email: 'user@x-store.local', role: 'user' }, privateKey, {
      algorithm: 'ES256',
      expiresIn: '1d',
    });
  });

  // beforeEach(async () => {
  // });

  it('(GET) /', async () => {
    const res = await request(httpServer).get('/').expect('Content-Type', /json/).expect(200);

    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('description');
  });

  it('(GET) /auth - without auth and return 403', async () => {
    await request(httpServer).get('/auth').expect('Content-Type', /json/).expect(403);
  });

  it('(GET) /auth - with invalid-auth and return 403', async () => {
    await request(httpServer).get('/').auth('the-username', 'the-password').expect('Content-Type', /json/).expect(200);
  });

  it('(GET) /auth - with valid-auth and return 200', async () => {
    const res = await request(httpServer).get('/').auth('user1', 'pass1').expect('Content-Type', /json/).expect(200);

    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('description');
  });

  it('(GET) /books - without token, must failed', async () => {
    const res = await request(httpServer).get('/books');

    expect(res.status).toEqual(401);
  });

  it('(GET) /books - with adminToken, must success', async () => {
    const res = await request(httpServer)
      .get('/books')
      .set('Accept', 'application/json')
      .set('acl-token', `${adminToken}`);

    expect(res.status).toEqual(200);
  });

  it('(GET) /books - with userToken, must success', async () => {
    const res = await request(httpServer)
      .get('/books')
      .set('Accept', 'application/json')
      .set('acl-token', `${userToken}`);

    expect(res.status).toEqual(200);
  });

  it('(POST) /books/buy ', async () => {
    const res = await request(httpServer)
      .post('/books/buy')
      .set('Accept', 'application/json')
      .set('acl-token', `${userToken}`)
      .send(['0']);

    expect(res.status).toEqual(201);
  });

  it('(GET) /purchased - with userToken, must success', async () => {
    const res = await request(httpServer)
      .get('/books/purchased')
      .set('Accept', 'application/json')
      .set('acl-token', `${userToken}`);

    expect(res.status).toEqual(200);
  });
});
