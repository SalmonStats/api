import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum Status {
  Created = 'created',
  Updated = 'updated',
}

export class UploadResult {
  constructor(salmon_id: number, status: Status) {
    this.salmon_id = salmon_id;
    this.status = status;
  }
  @ApiProperty({ description: 'リザルトID' })
  salmon_id: number;

  @ApiProperty({ enum: Status })
  status: Status;
}

export class UploadResults {
  constructor(results: UploadResult[]) {
    this.results = results;
  }

  @ApiProperty({ type: [UploadResult] })
  @Type(() => UploadResult)
  results: UploadResult[];
}
