import { Module } from '@nestjs/common';
import { NicknameAndIconController } from './nickname_and_icon.controller';
import { NicknameAndIconService } from './nickname_and_icon.service';

@Module({
  controllers: [NicknameAndIconController],
  providers: [NicknameAndIconService]
})
export class NicknameAndIconModule {}
