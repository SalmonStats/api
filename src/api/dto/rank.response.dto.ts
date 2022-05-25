import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { NodeTracing } from 'inspector';

export class RankResult {
  @ApiPropertyOptional()
  salmon_id: number;

  @ApiProperty()
  rank: number;

  @ApiProperty()
  golden_ikura_num: number;

  @ApiProperty()
  ikura_num: number;

  @ApiPropertyOptional()
  members: string[];
}

export class RankIkura<T> {
  @ApiProperty()
  golden_ikura_num: T;

  @ApiProperty()
  ikura_num: T;
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

export class RankDetail {
  @ApiProperty()
  @Type(() => RankIkura)
  max: RankIkura<number>;

  @ApiProperty()
  @Type(() => RankIkura)
  min: RankIkura<number>;

  @ApiProperty()
  @Type(() => RankIkura)
  avg: RankIkura<number>;

  @ApiProperty()
  count: number;
}

export class RankWave<T> {
  waves: {
    normal: {
      'water-levels': T;
      rush: T;
      'goldie-seeking': T;
      griller: T;
      'the-mothership': T;
      fog: T;
    };
    high: {
      'water-levels': T;
      rush: T;
      'goldie-seeking': T;
      griller: T;
      'the-mothership': T;
      fog: T;
    };
    low: {
      'water-levels': T;
      'the-mothership': T;
      fog: T;
      'cohock-charge': T;
    };
  };
}

class RankTotal {
  @ApiProperty({ type: RankIkura })
  @Type(() => RankIkura)
  all: RankIkura<number>;

  @ApiProperty({ type: RankIkura })
  @Type(() => RankIkura)
  no_night_waves: RankIkura<number>;
}

export class Rank {
  @ApiProperty({ type: RankTotal })
  total: RankTotal;

  // @ApiProperty({ type: RankWave })
  // waves: RankWave;
}
