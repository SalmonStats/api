import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NicknameAndIconController } from './nickname_and_icon.controller';
import { NicknameAndIconService } from './nickname_and_icon.service';

@Module({
  imports: [HttpModule],
  controllers: [NicknameAndIconController],
  providers: [NicknameAndIconService],
})
export class NicknameAndIconModule {}
