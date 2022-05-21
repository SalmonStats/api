import { ApiProduces, ApiProperty } from '@nestjs/swagger';

class JobWaveResult {
  @ApiProperty()
  clear: number;

  @ApiProperty()
  time_limit: number;

  @ApiProperty()
  wipe_out: number;
}

class Statistics {
  @ApiProperty()
  max: number;

  @ApiProperty()
  avg: number;

  @ApiProperty()
  var: number;

  @ApiProperty()
  sd: number;
}

class Stats {
  @ApiProperty()
  job_num: number;

  @ApiProperty({ type: [JobWaveResult] })
  job_results: JobWaveResult[];

  @ApiProperty({ type: Statistics })
  golden_ikura_num: Statistics;

  @ApiProperty({ type: Statistics })
  ikura_num: Statistics;

  @ApiProperty({ type: Statistics })
  help_count: Statistics;

  @ApiProperty({ type: Statistics })
  dead_count: Statistics;

  @ApiProperty({ type: [Statistics] })
  boss_counts: Statistics[];

  @ApiProperty({ type: [Statistics] })
  boss_kill_counts: Statistics[];

  @ApiProperty({ type: [Number] })
  total_boss_counts: number[];

  @ApiProperty({ type: [Number] })
  total_boss_kill_counts: number[];
}

export class StatsResult {
  @ApiProperty({ type: Stats })
  my_result: Stats;

  @ApiProperty({ type: Stats })
  other_result: Stats;
}
