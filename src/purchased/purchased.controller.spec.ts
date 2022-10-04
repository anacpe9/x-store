import { Test, TestingModule } from '@nestjs/testing';
import { PurchasedController } from './purchased.controller';

describe('PurchasedController', () => {
  let controller: PurchasedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasedController],
    }).compile();

    controller = module.get<PurchasedController>(PurchasedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
