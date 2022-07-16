import { Injectable, NotFoundException } from '@nestjs/common';
import { Player, Prisma, PrismaPromise } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PaginatedRequestDtoForUser } from '../dto/pagination.dto';
import { UserData, UserStats } from '../dto/results/stage.result.dto';
import { NicknameAndIconRequestDto } from '../nickname_and_icon/nickname_and_icon.request';
import { NicknameAndIcon } from '../nickname_and_icon/nickname_and_icon.response';
import { NicknameAndIconService } from '../nickname_and_icon/nickname_and_icon.service';

@Injectable()
export class PlayersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: NicknameAndIconService
  ) {}

  async findMany(
    query: PaginatedRequestDtoForUser
  ): Promise<Partial<Player>[]> {
    return await this.prisma.player.findMany({
      where: {
        OR: [
          {
            name: {
              startsWith: query.nickname,
            },
          },
          {
            name: {
              endsWith: query.nickname,
            },
          },
        ],
      },
      distinct: ['nsaid'],
      select: {
        nsaid: true,
        name: true,
      },
      skip: query.offset,
      take: query.limit,
    });
  }

  private queryBuidlerUser(nsaid: string): PrismaPromise<any> {
    return this.prisma.$queryRaw<any>``;
  }
  private queryBuilder(nsaid: string): PrismaPromise<UserData[]> {
    return this.prisma.$queryRaw<UserData[]>`
    WITH results AS (
      SELECT
      nsaid,
      players.golden_ikura_num AS player_golden_ikura_num,
      players.ikura_num AS player_ikura_num,
      results.golden_ikura_num,
      results.ikura_num,
      grade_point,
      players.boss_kill_counts,
      dead_count,
      help_count,
      stage_id,
      results.start_time,
      kuma_point,
      no_night_waves
      FROM
      players
      INNER JOIN
      results
      ON
      players."resultId" = results.salmon_id
      INNER JOIN
      schedules
      ON
      results.start_time = schedules.start_time
      WHERE
      nsaid = ${nsaid}
    )
    SELECT
    stage_id,
    MAX(player_golden_ikura_num) AS player_golden_ikura_num,
    MAX(player_ikura_num) AS player_ikura_num,
    MAX(golden_ikura_num) AS golden_ikura_num,
    MAX(ikura_num) AS ikura_num,
    MAX(grade_point) AS grade_point,
    COUNT(*)::INT AS shifts_worked,
    SUM(kuma_point)::INT AS kuma_point,
    no_night_waves AS nightless
    FROM
    results
    GROUP BY
    stage_id,
    no_night_waves
    ORDER BY
    no_night_waves,
    stage_id
    `;
  }

  // ユーザー検索
  async find(nsaid: string): Promise<UserStats> {
    // 指定されたユーザーの情報を検索
    const result = (
      await this.prisma.$transaction([this.queryBuilder(nsaid)])
    ).flat();

    if (result.length === 0) {
      throw new NotFoundException();
    }

    const nicknameAndIcons: NicknameAndIcon = (
      await this.service.findMany(new NicknameAndIconRequestDto([nsaid]))
    ).nickname_and_icons.shift();

    const response = new UserStats(result, nicknameAndIcons);

    return response;
  }
}
