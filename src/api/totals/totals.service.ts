import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';
import { Total } from '../waves/waves.service';

@Injectable()
export class TotalsService {
  constructor(private readonly prisma: PrismaService) {}

  private queryBuilder(
    start_time: number,
    nightLess: boolean,
    limit: number,
    threshold: number
  ): PrismaPromise<Total[]> {
    return this.prisma.$queryRaw<Total[]>`
      WITH results AS (
        SELECT 
          MAX(golden_ikura_num) AS golden_ikura_num, 
          RANK() OVER(
            ORDER BY 
              MAX(golden_ikura_num) DESC
          ):: INT, 
          no_night_waves, 
          members, 
          names 
        FROM 
          (
            SELECT 
              results.salmon_id, 
              results.golden_ikura_num, 
              results.no_night_waves, 
              results.members, 
              (
                SELECT 
                  ARRAY_AGG(name) 
                FROM 
                  (
                    SELECT 
                      UNNEST(
                        ARRAY_AGG(players.name)
                      ) AS name 
                    ORDER BY 
                      name
                  ) AS name
              ) AS names 
            FROM 
              results 
              INNER JOIN players ON results.salmon_id = players."resultId" 
            WHERE 
              results.start_time = TO_TIMESTAMP(${start_time}) 
              AND results.no_night_waves = ${nightLess}
              AND results.golden_ikura_num >= ${threshold}
            GROUP BY 
              results.salmon_id, 
              results.golden_ikura_num, 
              results.no_night_waves, 
              results.members 
            ORDER BY 
              results.golden_ikura_num DESC
          ) AS results 
        GROUP BY 
          results.no_night_waves, 
          results.members, 
          results.names 
        LIMIT 
          ${limit}
      ) 
      SELECT 
        * 
      FROM 
        results;
    `;
  }

  find(
    startTime: number,
    nightless: boolean,
    limit: number = 25,
    threshold: number = 130
  ): Promise<Total[]> {
    return this.queryBuilder(startTime, nightless, limit, threshold);
  }
}
