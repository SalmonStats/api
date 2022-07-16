import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Player, Prisma, PrismaPromise } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PaginatedRequestDtoForUser } from '../dto/pagination.dto';
import { UserData, UserStats } from '../dto/results/stage.result.dto';
import { NicknameAndIconRequestDto } from '../nickname_and_icon/nickname_and_icon.request';
import { NicknameAndIcon } from '../nickname_and_icon/nickname_and_icon.response';
import { NicknameAndIconService } from '../nickname_and_icon/nickname_and_icon.service';
import { UserRole } from '../users/users.service';

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

  private queryBuilderUser(nsaid: string): PrismaPromise<UserRole[]> {
    return this.prisma.$queryRaw<UserRole[]>`
    WITH results AS (
      SELECT
      salmon_Id,
      players.nsaid,
      boss_kill_counts,
      job_id,
      is_clear,
      failure_reason,
      is_verified,
      is_imperial_scholars,
      is_friend_code_public,
      is_twitter_id_public
      FROM
      players
      INNER JOIN
      job_results
      ON
      players."resultId" = job_results.salmon_id
      INNER JOIN
      accounts
      ON
      players.nsaid = accounts.nsaid
      INNER JOIN
      users
      ON
      accounts."userId" = users.id
      WHERE
      players.nsaid = ${nsaid}
    )
    SELECT
    nsaid,
    (SELECT COUNT(*) FROM results WHERE is_clear = true)::INT AS is_clear,
    (SELECT COUNT(*) FROM results WHERE is_clear = false)::INT AS is_failure,
    MAX(job_id)::INT AS job_id,
    is_imperial_scholars,
    is_verified,
    is_friend_code_public,
    is_twitter_id_public
    FROM
    results
    GROUP BY
    nsaid, is_imperial_scholars, is_verified, is_friend_code_public, is_twitter_id_public
    `;
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
    const user: UserRole = await (async () => {
      const users = await this.queryBuilderUser(nsaid);
      // ヒットしなかったらエラーを返す
      if (users.length === 0) {
        throw new NotFoundException();
      }

      const user = users.shift();
      // インペリアルスカラーでなければエラーを返す
      if (user.is_imperial_scholars === false) {
        throw new ForbiddenException();
      }
      return user;
    })();

    const result: UserData[] = await (async () => {
      const results = await this.queryBuilder(nsaid);
      return results;
    })();

    // ユーザーがインペリアルスカラーでなければエラーを返す
    const nicknameAndIcons: NicknameAndIcon = (
      await this.service.findMany(new NicknameAndIconRequestDto([nsaid]))
    ).nickname_and_icons.shift();

    const response = new UserStats(result, user, nicknameAndIcons);
    return response;
  }
}
