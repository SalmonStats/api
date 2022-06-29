import { Test, TestingModule } from '@nestjs/testing';
import { SalmonidsController } from './salmonids.controller';

describe('SalmonidsController', () => {
  let controller: SalmonidsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalmonidsController],
    }).compile();

    controller = module.get<SalmonidsController>(SalmonidsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
