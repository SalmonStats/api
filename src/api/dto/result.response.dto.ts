import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

export enum FailureReason {
  TIMELIMIT = 'time_limit',
  WIPEOUT = 'wipe_out',
}

export enum SpecialType {}

export enum BossType {}

export enum StageType {
  SHAKEUP = 5000,
  SHAKESHIP = 5001,
  SHAKEHOUSE = 5002,
  SHAKELIFT = 5003,
  SHAKELIDE = 5004,
}

export interface WaveResult {
  event_type: number;
  water_level: number;
  golden_ikura_num: number;
  golden_ikura_pop_num: number;
  quota_num: number;
  ikura_num: number;
}

export class Wave implements WaveResult {
  @Expose()
  @ApiProperty()
  event_type: number;

  @Expose()
  @ApiProperty()
  water_level: number;

  @Expose()
  @ApiProperty()
  golden_ikura_num: number;

  @Expose()
  @ApiProperty()
  golden_ikura_pop_num: number;

  @Expose()
  @ApiProperty()
  quota_num: number;

  @Expose()
  @ApiProperty()
  ikura_num: number;
}

interface PlayerResultType {
  nsaid: string;
  boss_kill_counts: number[];
  dead_count: number;
  golden_ikura_num: number;
  help_count: number;
  ikura_num: number;
  name: string;
  special_id: number;
  special_counts: number[];
  weapon_list: number[];
}

export class Player implements PlayerResultType {
  @Expose()
  @ApiProperty({ example: '0000000000000000' })
  nsaid: string;

  @Expose()
  @ApiProperty({ example: 'tkgling' })
  name: string;

  @Expose()
  @ApiProperty({ type: [Number], example: [0, 0, 0, 0, 0, 0, 0, 0, 0] })
  boss_kill_counts: number[];

  @Expose()
  @ApiProperty()
  dead_count: number;

  @Expose()
  @ApiProperty()
  golden_ikura_num: number;

  @Expose()
  @ApiProperty()
  help_count: number;

  @Expose()
  @ApiProperty()
  ikura_num: number;

  @Expose()
  @ApiProperty()
  special_id: number;

  @Expose()
  @ApiProperty({ type: [Number] })
  special_counts: number[];

  @Expose()
  @ApiProperty({ type: [Number] })
  weapon_list: number[];
}

export class Schedule {
  @Expose()
  @ApiProperty()
  start_time: Date;

  @Expose()
  @ApiProperty({ enum: StageType, example: StageType.SHAKEUP })
  stage_id: StageType;

  @Expose()
  @ApiProperty()
  end_time: Date;

  @Expose()
  @ApiProperty({ nullable: true, default: null })
  rare_weapon?: number;

  @Expose()
  @ApiProperty({ type: [Number] })
  weapon_list: number[];
}

export class JobResult {
  @Expose()
  @ApiProperty({ enum: FailureReason, nullable: true, example: null })
  failure_reason: FailureReason;

  @Expose()
  @ApiProperty({ nullable: true, example: null })
  failure_wave?: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    example: true,
  })
  is_clear: boolean;
}

export class Result {
  @Expose()
  @ApiProperty()
  salmon_id: number;

  @Expose()
  @ApiProperty({ type: [Number], example: [0, 0, 0, 0, 0, 0, 0, 0, 0] })
  boss_counts: number[];

  @Expose()
  @ApiProperty({ type: [Number], example: [0, 0, 0, 0, 0, 0, 0, 0, 0] })
  boss_kill_counts: number[];

  @Expose()
  @ApiProperty()
  golden_ikura_num: number;

  @Expose()
  @ApiProperty()
  ikura_num: number;

  @Expose()
  @ApiProperty()
  no_night_waves: boolean;

  @Expose()
  @ApiProperty()
  danger_rate: number;

  @Expose()
  @ApiProperty()
  end_time: Date;

  @Expose()
  @ApiProperty()
  play_time: Date;

  @Expose()
  @ApiProperty()
  start_time: Date;

  @Expose()
  @ApiProperty({
    type: [String],
    example: [
      '0000000000000000',
      '1111111111111111',
      '2222222222222222',
      '3333333333333333',
    ],
  })
  members: string[];

  @Expose()
  @Type(() => JobResult)
  @ApiProperty()
  job_result: JobResult;

  @Expose()
  @Type(() => Player)
  @ApiProperty({ type: [Player] })
  players: Player[];

  @Expose()
  @Type(() => Wave)
  @ApiProperty({ type: [Wave] })
  waves: Wave[];

  @Expose()
  @Type(() => Schedule)
  @ApiProperty({ type: Schedule })
  schedule: Schedule;
}
