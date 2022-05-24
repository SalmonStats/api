import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

class Rank {
  @ApiProperty()
  rank: number;

  @ApiProperty()
  score: number;
}

export class RankIkura {
  @ApiProperty()
  @Type(() => Rank)
  golden_ikura_num: Rank;

  @ApiProperty()
  @Type(() => Rank)
  ikura_num: Rank;
}

export class RankWaveIkura {
  @ApiProperty()
  golden_ikura_num: number;

  @ApiProperty()
  ikura_num: number;
}

export class RankBoss {
  @ApiProperty()
  boss_counts: number[];

  @ApiProperty()
  boss_kill_counts: number[];

  @ApiProperty()
  golden_ikura_num: number;

  @ApiProperty()
  ikura_num: number;
}

export class RankWave {
  @ApiProperty()
  @Type(() => RankWaveIkura)
  max: RankWaveIkura;

  @ApiProperty()
  @Type(() => RankWaveIkura)
  min: RankWaveIkura;

  @ApiProperty()
  @Type(() => RankWaveIkura)
  avg: RankWaveIkura;

  @ApiProperty()
  @Type(() => RankWaveIkura)
  count: number;
}

export class UserRankWave {
  waves: {
    normal: {
      'water-levels': RankIkura;
      rush: RankIkura;
      'goldie-seeking': RankIkura;
      griller: RankIkura;
      'the-mothership': RankIkura;
      fog: RankIkura;
    };
    high: {
      'water-levels': RankIkura;
      rush: RankIkura;
      'goldie-seeking': RankIkura;
      griller: RankIkura;
      'the-mothership': RankIkura;
      fog: RankIkura;
    };
    low: {
      'water-levels': RankIkura;
      'the-mothership': RankIkura;
      fog: RankIkura;
      'cohock-charge': RankIkura;
    };
  };
}

// export class UserRankTotal {
//   all: RankIkura;
//   no_night_waves: RankIkura;
// }

export class UserRank {
  total: {
    all: RankIkura;
    no_night_waves: RankIkura;
  };
  waves: UserRankWave;
}
