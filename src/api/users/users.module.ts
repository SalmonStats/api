import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { NicknameAndIconService } from '../nickname_and_icon/nickname_and_icon.service';
import { UsersService } from './users.service';

@Module({
  imports: [HttpModule],
  providers: [UsersService, PrismaService, NicknameAndIconService],
})
export class UsersModule {}
