import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsInt,
  isInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { FailureReason } from './result.response.dto';

class JobResult {
  @IsOptional()
  @IsInt()
  @Max(3)
  @Min(1)
  @ApiProperty({ example: 1 })
  failure_wave: number;

  @IsOptional()
  @ApiProperty({ enum: FailureReason, example: FailureReason.TIMELIMIT })
  failure_reason: FailureReason;

  @IsBoolean()
  @ApiProperty({ example: false })
  is_clear: boolean;
}

export class RestoreSchedule {
  @ApiProperty()
  @IsInt()
  stage_id: number;

  @ApiProperty()
  @IsDate()
  start_time: Date;

  @ApiProperty()
  @IsDate()
  end_time: Date;

  @ApiProperty()
  @IsArray()
  weapon_list: number[];
}

export class RestoreWave {
  @ApiProperty()
  @IsInt()
  event_type: number;

  @ApiProperty()
  @IsInt()
  water_level: number;

  @ApiProperty()
  @IsInt()
  golden_ikura_num: number;

  @ApiProperty()
  @IsInt()
  golden_ikura_pop_num: number;

  @ApiProperty()
  @IsInt()
  quota_num: number;

  @ApiProperty()
  @IsInt()
  ikura_num: number;
}

export class RestorePlayer {
  @ApiProperty()
  nsaid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsArray()
  @ArrayMaxSize(9)
  @ArrayMinSize(9)
  boss_kill_counts: number[];

  @ApiProperty()
  @IsInt()
  dead_count: number;

  @ApiProperty()
  @IsInt()
  help_count: number;

  @ApiProperty()
  @IsInt()
  golden_ikura_num: number;

  @ApiProperty()
  @IsInt()
  ikura_num: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  job_id: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  job_score: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  job_rate: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  kuma_point: number;

  @ApiProperty()
  style: string;

  @ApiProperty()
  species: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  grade_id: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  grade_point: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  grade_point_delta: number;

  @ApiProperty()
  @IsInt()
  special_id: number;

  @ApiProperty()
  @IsArray()
  special_counts: number[];

  @ApiProperty()
  @IsArray()
  weapon_list: number[];
}

export class RestoreResult {
  @ApiProperty()
  @IsArray()
  @ArrayMaxSize(9)
  @ArrayMinSize(9)
  boss_counts: number[];

  @ApiProperty()
  @IsArray()
  @ArrayMaxSize(9)
  @ArrayMinSize(9)
  boss_kill_counts: number[];

  @ApiProperty()
  @IsBoolean()
  no_night_waves: boolean;

  @ApiProperty()
  @IsNumber()
  danger_rate: number;

  @ApiProperty()
  @IsInt()
  golden_ikura_num: number;

  @ApiProperty()
  @IsInt()
  ikura_num: number;

  @ApiProperty()
  @IsDateString()
  play_time: Date;

  @ApiProperty()
  @IsDateString()
  start_time: Date;

  @ApiProperty()
  @IsDateString()
  end_time: Date;

  @ApiProperty()
  @IsArray()
  members: string[];

  @ApiProperty({ type: JobResult })
  @Type(() => JobResult)
  job_result: JobResult;

  @ApiProperty({ type: [RestorePlayer] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestorePlayer)
  players: RestorePlayer[];

  @ApiProperty({ type: RestoreSchedule })
  @Type(() => RestoreSchedule)
  schedule: RestoreSchedule;

  @ApiProperty({ type: [RestoreWave] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestoreWave)
  waves: RestoreWave[];
}

export class RestoreResults {
  @ApiProperty({ type: [RestoreResult], minItems: 1, maxItems: 200 })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => RestoreResult)
  results: RestoreResult[];
}
