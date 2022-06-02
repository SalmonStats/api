import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty } from 'class-validator';

export class NicknameAndIconRequestDto {
  constructor(id: string[]) {
    this.id = id;
  }

  @Expose()
  @ApiProperty({
    example: [
      '3f89c3791c43ea57',
      '8db26d4c24ee37fd',
      '7690d838ab4db5d2',
      'f28328d99d9dba3c',
    ],
    maxItems: 200,
    minItems: 0,
  })
  @Transform((params) => {
    // 型変換
    const values: string[] = (function () {
      if (typeof params.value === 'string') {
        return [params.value];
      }
      return params.value;
    })();

    const regex = new RegExp('^[a-f0-9]{16}$');

    // 正規表現でチェック
    const valid = values.filter((value) => {
      return regex.test(value);
    });

    // 重複を取り除く
    return Array.from(new Set(valid));
  })
  @IsArray()
  @IsNotEmpty()
  @ArrayMaxSize(200)
  id: string[];
}
