import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';

export interface SuppliedWeapon {
  rank: number;
  shifts_worked: number;
  supplied_weapon_counts: number;
  nsaid: string;
  name: string;
}

@Injectable()
export class WeaponsService {
  constructor(private readonly prisma: PrismaService) {}

  private queryBuilder(
    start_time: number,
    limit: number
  ): PrismaPromise<SuppliedWeapon[]> {
    return this.prisma.$queryRaw`
    WITH results AS (
      SELECT
      DISTINCT supplied_weapon, MIN(job_id) AS job_id, nsaid, MIN(name) AS name
      FROM 
        (
        SELECT 
        * 
        FROM
            players 
            INNER JOIN results ON players."resultId" = results.salmon_id
        WHERE
        job_id IS NOT NULL
        AND start_time = TO_TIMESTAMP(${start_time})
        ) AS results,
      UNNEST(weapon_list) AS supplied_weapon
      GROUP BY
      supplied_weapon, nsaid
      ORDER BY
      nsaid
    )
    SELECT
    nsaid,
    MIN(name) AS name,
    MAX(job_id) - MIN(job_id) + 1 AS shifts_worked,
    COUNT(*)::INT AS supplied_weapon_counts,
    RANK() OVER(ORDER BY COUNT(*) DESC)::INT
    FROM 
    results
    GROUP BY
    nsaid
    ORDER BY
    rank,
    shifts_worked
    LIMIT ${limit}
    `;
  }

  async find(start_time: number): Promise<SuppliedWeapon[]> {
    const schedule = await this.prisma.schedule.findUnique({
      where: {
        startTime: dayjs.unix(start_time).toDate(),
      },
      rejectOnNotFound: true,
    });

    if (!schedule.weaponList.includes(-1)) {
      throw new BadRequestException(
        '指定されたスケジュールにはランダムブキが存在しません'
      );
    }

    return this.queryBuilder(start_time, 100);
  }
}
