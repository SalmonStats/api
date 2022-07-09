import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ServerStatusValue {
  @ApiProperty()
  x: number;
  @ApiProperty()
  y: number;
}

class OperatingSystem {
  @ApiProperty()
  dist: string;
  @ApiProperty()
  distversion: string;
}

class SysStatusData {
  @ApiProperty()
  arch: string;
  @ApiProperty()
  client: string;
  @ApiProperty()
  hostname: string;
  @ApiProperty()
  kernel: string;
  @ApiProperty()
  os: OperatingSystem;
  @ApiProperty()
  type: string;
}

class ServerStatusDataBase {
  @ApiPropertyOptional({ type: ServerStatusValue })
  system?: ServerStatusValue[];
  @ApiPropertyOptional({ type: ServerStatusValue })
  user?: ServerStatusValue[];
  @ApiPropertyOptional({ type: ServerStatusValue })
  wait?: ServerStatusValue[];
  @ApiPropertyOptional({ type: ServerStatusValue })
  buffers?: ServerStatusValue[];
  @ApiPropertyOptional({ type: ServerStatusValue })
  cache?: ServerStatusValue[];
  @ApiPropertyOptional({ type: ServerStatusValue })
  free?: ServerStatusValue[];
  @ApiPropertyOptional({ type: ServerStatusValue })
  used?: ServerStatusValue[];
}

class CPUStatusData {
  @ApiProperty()
  cpu0: ServerStatusDataBase;
}

class MemoryStatusData {
  @ApiProperty()
  real: ServerStatusDataBase;
  @ApiProperty()
  swap: ServerStatusDataBase;
}

export class ServerStatusData {
  @ApiProperty({ type: CPUStatusData, title: 'CPU Status' })
  cpu: CPUStatusData;

  // disk: DiskStatusData;
  @ApiProperty({ type: ServerStatusValue, title: 'Load Status' })
  load: ServerStatusValue[];

  @ApiProperty({ type: MemoryStatusData, title: 'Memory Status' })
  memory: MemoryStatusData;
  // network: NetworkStatusData;

  @ApiProperty({ type: ServerStatusValue, title: 'System Info' })
  sys: SysStatusData;

  @ApiProperty()
  uptime: number;
}

export class ServerStatusResponseDto {
  @ApiProperty()
  version: number;

  @ApiProperty({ type: ServerStatusData })
  data: ServerStatusData;
}
