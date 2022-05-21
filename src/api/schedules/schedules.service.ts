import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Result } from '@prisma/client';
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

  async find(): Promise<void> {}

  async create() {}
}
