import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Result } from '@prisma/client';
import dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';

import { schedules } from './coop.json';
export type CoopSchedule = typeof import('./coop.json');

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findManyResults(
    request: Prisma.ScheduleFindUniqueArgs
  ): Promise<Result[]> {
    try {
      const schedule = await this.prisma.schedule.findUnique({
        where: request.where,
        include: {
          results: true,
        },
        rejectOnNotFound: true,
      });
      return schedule.results;
    } catch {
      throw new NotFoundException();
    }
  }

  async findManyAggreataion() {
    const waves = await this.prisma.wave.groupBy({
      by: ['eventType', 'waterLevel'],
      where: {
        isClear: true,
        result: {
          schedule: {
            startTime: dayjs.unix(1648836000).toDate(),
          },
        },
      },
      _avg: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _min: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _max: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
    });
    console.log(waves);
    const results = this.prisma.result.groupBy({
      by: ['noNightWaves'],
      where: {
        startTime: dayjs.unix(1648836000).toDate(),
        jobResult: {
          isClear: true,
        },
      },
      _avg: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _max: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
      _min: {
        goldenIkuraNum: true,
        ikuraNum: true,
      },
    });
    return results;
  }

  async find(): Promise<void> {}

  async create() {}
}
