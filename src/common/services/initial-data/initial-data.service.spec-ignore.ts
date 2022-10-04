import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { InitialDataService } from './initial-data.service';
import { Connection, connect, Model } from 'mongoose';
import { Book, BookSchema } from '../../database/schemas/books.schema';
import { HttpModule, HttpService } from '@nestjs/axios';

describe('InitialDataService', () => {
  let service: InitialDataService;
  // let appController: AppController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let bookModel: Model<Book>;

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();

    await mongoose.disconnect();

    if (mongod) await mongod.stop();
  });

  // afterEach(async () => {
  //   const collections = mongoConnection.collections;
  //   for (const key in collections) {
  //     const collection = collections[key];
  //     await collection.deleteMany({});
  //   }
  // });

  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    await mongod.start();
    await mongod.ensureInstance();

    const mongoUri = await mongod.getUri();
    mongoConnection = (await connect(mongoUri)).connection;
    bookModel = mongoConnection.model(Book.name, BookSchema);

    const module: TestingModule = await Test.createTestingModule({
      // imports: [HttpModule],
      providers: [InitialDataService, HttpService, { provide: getModelToken(Book.name), useValue: bookModel }],
    }).compile();

    service = module.get<InitialDataService>(InitialDataService);
    await service.onModuleInit();
  });

  // beforeEach(async () => {
  //   await service.onModuleInit();
  // });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('must have admin user', async () => {
    const cnt = bookModel.countDocuments();

    expect(cnt).toEqual(100);
  });
});
