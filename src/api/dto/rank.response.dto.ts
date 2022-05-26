import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class RankResult {
  @ApiPropertyOptional()
  salmon_id: number;

  @ApiProperty()
  rank: number;

  @ApiProperty()
  golden_ikura_num: number;

  @ApiProperty()
  ikura_num: number;

  @ApiPropertyOptional({
    type: [String],
    example: [
      '0000000000000000',
      '1111111111111111',
      '2222222222222222',
      '3333333333333333',
    ],
  })
  members: string[];
}

export class RankIkura<T> {
  @ApiProperty({ type: RankResult })
  golden_ikura_num: T;

  @ApiProperty({ type: RankResult })
  ikura_num: T;
}

/**
 * Aggregate
 */
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
  @Transform((params) => params.value['all'])
  count: number;
}

export class RankWave<T> {
  @ApiProperty({ type: RankIkura })
  normal: {
    'water-levels': T;
    rush: T;
    'goldie-seeking': T;
    griller: T;
    'the-mothership': T;
    fog: T;
  };
  @ApiProperty({ type: RankIkura })
  high: {
    'water-levels': T;
    rush: T;
    'goldie-seeking': T;
    griller: T;
    'the-mothership': T;
    fog: T;
  };
  @ApiProperty({ type: RankIkura })
  low: {
    'water-levels': T;
    'the-mothership': T;
    fog: T;
    'cohock-charge': T;
  };
}

class RankTotal<T> {
  @ApiProperty({ type: RankIkura })
  @Type(() => RankIkura)
  all: RankIkura<T>;

  @ApiProperty({ type: RankIkura })
  @Type(() => RankIkura)
  no_night_waves: RankIkura<T>;
}

export class Rank<T> {
  @ApiProperty({ type: RankTotal })
  total: RankTotal<T>;

  @ApiProperty({ type: RankWave })
  waves: RankWave<T>;
}
