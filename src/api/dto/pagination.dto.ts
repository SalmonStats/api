/**
 * pagination.dto.ts
 * @author SONODA Yudai
 * @date 2020-10-11
 */

import { applyDecorators, ParseBoolPipe, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import dayjs from 'dayjs';

export class PaginatedRequestDto {
  @Expose()
  @Transform((params) => parseInt(params.value || 0, 10))
  @IsInt()
  @ApiProperty({
    title: 'offset',
    minimum: 0,
    default: 0,
  })
  readonly offset: number;

  @Expose()
  @Transform((params) => parseInt(params.value || 25, 10))
  @IsInt()
  @ApiProperty({
    title: 'limit',
    minimum: 0,
    maximum: 200,
    default: 25,
  })
  readonly limit: number;
}

export class PaginatedRequestDtoForResult extends PaginatedRequestDto {
  @Expose()
  @Transform((params) => params.value === 'true')
  @IsBoolean()
  @ApiPropertyOptional({
    title: 'order',
    default: null,
  })
  readonly order: boolean;

  @ApiPropertyOptional({
    title: '',
    type: Number,
    description: 'スケジュールID',
  })
  @Expose()
  @Transform((params) => {
    if (params.value === undefined) {
      return undefined;
    }
    return dayjs.unix(params.value).toDate();
  })
  @IsOptional()
  @IsDate()
  readonly start_time?: Date;

  @ApiPropertyOptional({
    title: '',
    description: 'プレイヤーID',
  })
  @Expose()
  @Transform((params) => {
    if (params.value === undefined) {
      return undefined;
    }
    return params.value;
  })
  @IsOptional()
  @IsString()
  readonly nsaid?: string;

  @ApiPropertyOptional({
    title: '',
    description: 'クリアしたリザルトのみ',
  })
  @Expose()
  @Transform((params) => {
    if (params.value === undefined) {
      return undefined;
    }
    return params.value === 'true';
  })
  @IsOptional()
  @IsBoolean()
  readonly is_clear?: boolean;

  @ApiPropertyOptional({
    title: '',
    description: '夜イベントを含まないかどうか',
  })
  @Expose()
  @Transform((params) => {
    if (params.value === undefined) {
      return undefined;
    }
    return params.value === 'true';
  })
  @IsOptional()
  @IsBoolean()
  readonly no_night_waves?: boolean;

  @ApiPropertyOptional({
    title: '',
    description: '最小納品金イクラ数',
  })
  @Expose()
  @Transform((params) => {
    if (params.value === undefined) {
      return undefined;
    }
    return parseInt(params.value, 10);
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly golden_ikura_num?: number;

  @ApiPropertyOptional({
    title: '',
    description: '最小取得赤イクラ数',
  })
  @Expose()
  @Transform((params) => {
    if (params.value === undefined) {
      return undefined;
    }
    return parseInt(params.value, 10);
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly ikura_num?: number;
}

export class PaginatedDto<T> {
  @ApiProperty({ type: 'integer', description: '総数' })
  total: number;

  @ApiProperty({ type: 'integer', description: '取得数' })
  limit: number;

  @ApiProperty({ type: 'integer', description: 'オフセット' })
  offset: number;

  results: T[];
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(PaginatedDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    })
  );
};
