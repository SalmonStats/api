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
  @ApiProperty({ description: 'イベント' })
  event_type: number;

  @Expose()
  @ApiProperty({ description: '潮位' })
  water_level: number;

  @Expose()
  @ApiProperty({ description: '金イクラ数' })
  golden_ikura_num: number;

  @Expose()
  @ApiProperty({ description: '金イクラドロップ数' })
  golden_ikura_pop_num: number;

  @Expose()
  @ApiProperty({ description: '金イクラノルマ数' })
  quota_num: number;

  @Expose()
  @ApiProperty({ description: '赤イクラ数' })
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
  @ApiProperty({ example: '0000000000000000', description: 'プレイヤーID' })
  nsaid: string;

  @Expose()
  @ApiProperty({ example: 'tkgling', description: 'プレイヤー名' })
  name: string;

  @Expose()
  @ApiProperty({
    type: [Number],
    example: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    description: 'オオモノ討伐数',
  })
  boss_kill_counts: number[];

  @Expose()
  @ApiProperty({ description: '被救助数' })
  dead_count: number;

  @Expose()
  @ApiProperty({ description: '金イクラ数' })
  golden_ikura_num: number;

  @Expose()
  @ApiProperty({ description: '救助数' })
  help_count: number;

  @Expose()
  @ApiProperty({ description: '赤イクラ数' })
  ikura_num: number;

  @Expose()
  @ApiProperty({ description: '支給スペシャル' })
  special_id: number;

  @Expose()
  @ApiProperty({ type: [Number], description: 'スペシャル使用回数' })
  special_counts: number[];

  @Expose()
  @ApiProperty({ type: [Number], description: '支給ブキ' })
  weapon_list: number[];
}

export class Schedule {
  @Expose()
  @ApiProperty({ description: 'シフト開始時刻' })
  start_time: Date;

  @Expose()
  @ApiProperty({
    enum: StageType,
    example: StageType.SHAKEUP,
    description: 'ステージID',
  })
  stage_id: StageType;

  @Expose()
  @ApiProperty({ description: 'シフト終了時刻' })
  end_time: Date;

  @Expose()
  @ApiProperty({ nullable: true, default: null, description: '支給レアブキ' })
  rare_weapon?: number;

  @Expose()
  @ApiProperty({ type: [Number], description: '支給ブキリスト' })
  weapon_list: number[];
}

export class JobResult {
  @Expose()
  @ApiProperty({
    enum: FailureReason,
    nullable: true,
    example: null,
    description: 'バイト失敗理由',
  })
  failure_reason: FailureReason;

  @Expose()
  @ApiProperty({
    nullable: true,
    example: null,
    description: 'バイト失敗WAVE数',
  })
  failure_wave?: number;

  @Expose()
  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'クリアしたかどうか',
  })
  is_clear: boolean;
}

export class Result {
  @Expose()
  @ApiProperty({ description: 'リザルトID' })
  salmon_id: number;

  @Expose()
  @ApiProperty({
    type: [Number],
    example: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    description: 'オオモノ出現数',
  })
  boss_counts: number[];

  @Expose()
  @ApiProperty({
    type: [Number],
    example: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    description: 'オオモノ討伐数',
  })
  boss_kill_counts: number[];

  @Expose()
  @ApiProperty({ description: '金イクラ数' })
  golden_ikura_num: number;

  @Expose()
  @ApiProperty({ description: '赤イクラ数' })
  ikura_num: number;

  @Expose()
  @ApiProperty({ description: '夜WAVEを含むかどうか' })
  no_night_waves: boolean;

  @Expose()
  @ApiProperty({ description: 'キケン度' })
  danger_rate: number;

  @Expose()
  @ApiProperty({ description: 'シフト終了時刻' })
  end_time: Date;

  @Expose()
  @ApiProperty({ description: 'プレイ時刻' })
  play_time: Date;

  @Expose()
  @ApiProperty({ description: 'シフト開始時刻' })
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
    description: 'チームメンバー(ソート済み)',
  })
  members: string[];

  @Expose()
  @Type(() => JobResult)
  @ApiProperty({ description: 'バイト結果' })
  job_result: JobResult;

  @Expose()
  @Type(() => Player)
  @ApiProperty({ type: [Player], description: 'プレイヤーリザルト' })
  players: Player[];

  @Expose()
  @Type(() => Wave)
  @ApiProperty({ type: [Wave], description: 'WAVEリザルト' })
  waves: Wave[];

  @Expose()
  @Type(() => Schedule)
  @ApiProperty({ type: Schedule, description: 'スケジュール' })
  schedule: Schedule;
}
