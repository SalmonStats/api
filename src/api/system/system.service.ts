import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import FormData from 'form-data';
import { plainToClass } from 'class-transformer';
import snakecaseKeys from 'snakecase-keys';

export class SystemResponseDto {
  ACTION: string;
  DATA: SystemResponseDataDto;
  LONGVIEW: SystemResponseViewDto;
  NOTIFICATIONS: string[];
  VERSION: string;
}

class SystemResponseViewDto {
  STEP: number;
  UPDATEDELAY: number;
}

class SystemResponseValueDto {
  x: number;
  y: number;
}

class SystemResponseCPUDto {
  system: SystemResponseValueDto[];
  user: SystemResponseValueDto[];
  wait: SystemResponseValueDto[];
}

class SystemResponseMemoryDto {
  buffers?: SystemResponseValueDto[];
  cache?: SystemResponseValueDto[];
  free: SystemResponseValueDto[];
  used: SystemResponseValueDto[];
}

class SystemResponseDataDto {
  CPU: {
    cpu0: SystemResponseCPUDto;
  };
  Load: SystemResponseValueDto;
  Memory: {
    real: SystemResponseMemoryDto;
    swap: SystemResponseMemoryDto;
  };
  SysInfo: {
    arch: string;
    client: string;
    cpu: {
      cores: number;
      type: string;
    };
    hostname: string;
    kernel: string;
    os: {
      distversion: string;
      dist: string;
    };
    type: string;
  };
  Uptime;
  number;
}

@Injectable()
export class SystemService {
  constructor(private readonly axios: HttpService) {}

  async getSystemInfo() {
    const url = 'https://longview.linode.com/fetch';
    const body = new FormData();
    body.append('api_key', process.env.API_KEY);
    body.append('api_action', 'getLatestValue');
    body.append(
      'keys',
      '["CPU.*","Disk.*","Load.*","Memory.*","Network.*","SysInfo.*","Uptime"]'
    );
    const response = await lastValueFrom(this.axios.post(url, body));

    switch (response.status) {
      case 400:
        throw new BadRequestException();
      case 404:
        throw new NotFoundException();
      case 403:
        throw new ForbiddenException();
      default:
        return snakecaseKeys(response.data[0])
        return response.data.map((value) =>
          plainToClass(SystemResponseDto, value)
        );
    }
  }
}
