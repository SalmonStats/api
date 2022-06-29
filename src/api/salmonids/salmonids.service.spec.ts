import { Test, TestingModule } from '@nestjs/testing';
import { SalmonidsService } from './salmonids.service';

describe('SalmonidsService', () => {
  let service: SalmonidsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalmonidsService],
    }).compile();

    service = module.get<SalmonidsService>(SalmonidsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
