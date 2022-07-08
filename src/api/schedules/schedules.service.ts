import { Injectable } from '@nestjs/common';
import { ApiGatewayTimeoutResponse } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import {
  PaginatedDto,
  PaginatedRequestDtoForSchedule,
} from '../dto/pagination.dto';
import { Schedule } from '../dto/schedules.response.dto';

import { schedules } from './coop.json';
export type CoopSchedule = typeof import('./coop.json');

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async find(start_time: number): Promise<number> {
    return;
  }

  async findMany(
    request: PaginatedRequestDtoForSchedule
  ): Promise<PaginatedDto<Schedule>> {
    if (request.include_futures === true) {
      // 未来のシフトを含むならすべて返す
      const schedules = await this.prisma.schedule.findMany({
        take: request.limit,
        skip: request.offset,
        orderBy: {
          startTime: 'desc',
        },
      });
      const response = new PaginatedDto<Schedule>();
      response.limit = request.limit;
      response.offset = request.offset;
      response.results = schedules.map((schedule) =>
        plainToClass(Schedule, snakecaseKeys(schedule))
      );
      return response;
    } else {
      // 終了時間が現在時刻よりも遅いリザルトを取得

      const schedules = (
        await this.prisma.$transaction([
          this.prisma.schedule.findMany({
            skip: 0,
            take: -2,
            where: {
              endTime: {
                gte: dayjs().toDate(),
              },
            },
            orderBy: {
              startTime: 'desc',
            },
          }),
          this.prisma.schedule.findMany({
            skip: request.offset,
            take: request.limit - 2,
            where: {
              endTime: {
                lte: dayjs().toDate(),
              },
            },
            orderBy: {
              startTime: 'desc',
            },
          }),
        ])
      ).flat();
      const response = new PaginatedDto<Schedule>();
      response.limit = request.limit;
      response.offset = request.offset;
      response.results = schedules.map((schedule) =>
        plainToClass(Schedule, snakecaseKeys(schedule))
      );
      return response;
    }
  }

  async create() {
    await this.prisma.schedule.createMany({
      data: schedules.map((schedule) => ({
        stageId: schedule.stage_id,
        startTime: dayjs.unix(schedule.start_time).toDate(),
        endTime: dayjs.unix(schedule.end_time).toDate(),
        rareWeapon: schedule.rare_weapon,
        weaponList: schedule.weapon_list,
      })),
    });
  }
}
