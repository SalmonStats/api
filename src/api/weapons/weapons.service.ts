import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';

interface SuppliedWeapon {
  rank: number
  waves: number
  supplied_count: number
  nsaid: string
  name: string
}

@Injectable()
export class WeaponsService {
  constructor(private readonly prisma: PrismaService) { }
  
  private queryBuilder(
    start_time: number,
    limit: number
  ): PrismaPromise<SuppliedWeapon[]> {
    return this.prisma.$queryRaw`
    WITH results AS (
	    SELECT
	    RANK() OVER(ORDER BY CARDINALITY(ARRAY_AGG(DISTINCT weapon_lists)) DESC)::INT,
	    COUNT(name)::INT AS waves,
	    CARDINALITY(ARRAY_AGG(DISTINCT weapon_lists)) supplied_count,
	    nsaid,
	    MIN(name) AS name
	    FROM (
	    	SELECT
	    	*
	    	FROM
	    	players
	    	INNER JOIN
	    	results
	    	ON
	    	players."resultId" = results.salmon_id
	    ) AS results,
	    UNNEST(weapon_list) AS weapon_lists
	    WHERE
	    results.start_time = TO_TIMESTAMP(${start_time})
	    GROUP BY nsaid
	    LIMIT ${limit}
    )
    SELECT
    *
    FROM
    results
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
