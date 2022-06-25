import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

export interface TotalResponse {
  total: {
    night: Total[];
    nightless: Total[];
  };
  waves: {
    high_tide: {
      water_levels: Total[];
      rush: Total[];
      'goldie-seeking': Total[];
      griller: Total[];
      "the-mothership": Total[];
      fog: Total[];
    };
    normal_tide: {
      water_levels: Total[];
      rush: Total[];
      'goldie-seeking': Total[];
      griller: Total[];
      "the-mothership": Total[];
      fog: Total[];
    };
    low_tide: {
      water_levels: Total[];
      fog: Total[];
      "the-mothership": Total[];
      'cohock-charge': Total[];
    };
  };
}

export interface Total {
  water_level?: number;
  event_type?: number;
  nightless?: boolean;
  golden_ikura_num: number;
  rank: number;
  members: string[];
}

@Injectable()
export class WavesService {
  constructor(private readonly prisma: PrismaService) {}

  async findWaves(startTime: number, goldenIkuraNum: number): Promise<TotalResponse> {
    const total = await this.prisma.$queryRaw<Total[]>`
      (SELECT false as nightless, MAX(golden_ikura_num) AS golden_ikura_num, (RANK() OVER(ORDER BY MAX(golden_ikura_num) DESC)::INT), members
        FROM results
        WHERE no_night_waves = false
        AND start_time = TO_TIMESTAMP(${startTime})
        AND golden_ikura_num >= ${goldenIkuraNum}
        GROUP BY no_night_waves, members
        ORDER BY MAX(golden_ikura_num) DESC
        LIMIT 100)
      UNION ALL
      (SELECT true as nightless, MAX(golden_ikura_num) AS golden_ikura_num, (RANK() OVER(ORDER BY MAX(golden_ikura_num) DESC)::INT), members
	      FROM results
	      WHERE no_night_waves = true
	      AND start_time = TO_TIMESTAMP(${startTime})
	      AND golden_ikura_num >= ${goldenIkuraNum}
	      GROUP BY no_night_waves, members
	      ORDER BY MAX(golden_ikura_num) DESC
        LIMIT 100)
    `;

    return {
      total: {
        night: total.filter(t => t.nightless === false),
        nightless: total.filter(t => t.nightless === true),
      },
      waves: {
        high_tide: {
          water_levels: [],
          rush: [],
          "goldie-seeking": [],
          "griller": [],
          "the-mothership": [],
          fog: [],
        },
        normal_tide: {
          water_levels: [],
          rush: [],
          "goldie-seeking": [],
          "griller": [],
          "the-mothership": [],
          fog: [],
        },
        low_tide: {
          water_levels: [],
          "the-mothership": [],
          fog: [],
          "cohock-charge": [],
        }
      }
    }
  }
}
