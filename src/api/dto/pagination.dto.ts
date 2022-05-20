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
  IsBooleanString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
  @ApiPropertyOptional({
    title: '',
    default: false,
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
    default: false,
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

  @ApiPropertyOptional()
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

  @ApiPropertyOptional()
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
