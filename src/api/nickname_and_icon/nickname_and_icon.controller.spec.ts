import { Test, TestingModule } from '@nestjs/testing';
import { NicknameAndIconController } from './nickname_and_icon.controller';

describe('NicknameAndIconController', () => {
  let controller: NicknameAndIconController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NicknameAndIconController],
    }).compile();

    controller = module.get<NicknameAndIconController>(NicknameAndIconController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
