import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Result, Schedule } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import snakecaseKeys from 'snakecase-keys';
import { PrismaService } from 'src/prisma.service';
import { IkuraStats } from '../dto/stats.response.dto';

import { schedules } from './coop.json';
export type CoopSchedule = typeof import('./coop.json');

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async find(start_time: number): Promise<number> {
    return;
  }

  async findMany(): Promise<any[]> {
    return (
      await this.prisma.schedule.findMany({
        orderBy: {
          startTime: 'desc',
        },
      })
    ).map((schedule) => snakecaseKeys(schedule));
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
