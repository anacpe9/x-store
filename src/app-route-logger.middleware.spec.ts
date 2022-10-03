import { AppRouteLoggerMiddleware } from './app-route-logger.middleware';
import * as httpMock from 'node-mocks-http';
import { NextFunction } from 'express';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

describe('AppRouteLoggerMiddleware', () => {
  // let httpLoggingMiddleware: HttpLoggingMiddleware;

  // beforeEach(async () => {
  //   const module = await Test.createTestingModule({
  //     providers: [HttpLoggingMiddleware],
  //   }).compile();

  //   httpLoggingMiddleware = module.get<HttpLoggingMiddleware>(
  //     HttpLoggingMiddleware,
  //   );
  // });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(new AppRouteLoggerMiddleware()).toBeDefined();
  });

  it('print log', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const events = require('events');
    const mockRequest = httpMock.createRequest({
      method: 'GET',
      url: '/',
      ip: '127.0.0.1',
      eventEmitter: events.EventEmitter,
    });
    const mockResponse = httpMock.createResponse({
      eventEmitter: events.EventEmitter,
    });
    const mockUser = {};
    mockRequest.user = mockUser;

    // const nextSpy = jest.fn();
    const nextFunction: NextFunction = jest.fn(() => {
      mockRequest.emit('close');
    });

    const mdw = new AppRouteLoggerMiddleware();
    mdw.use(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(nextFunction).toBeCalledTimes(1);
    await delay(1000);
  });
});
