import { Test, TestingModule } from '@nestjs/testing';
import { NicknameAndIconService } from './nickname_and_icon.service';

describe('NicknameAndIconService', () => {
  let service: NicknameAndIconService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NicknameAndIconService],
    }).compile();

    service = module.get<NicknameAndIconService>(NicknameAndIconService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
