import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { NicknameAndIconRequestDto } from './nickname_and_icon.request';
import { NicknameAndIconResponseDto } from './nickname_and_icon.response';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NicknameAndIconService {
  constructor(private readonly axios: HttpService) { }

  async findMany(
    request: NicknameAndIconRequestDto
  ): Promise<NicknameAndIconResponseDto> {
    const query = request.id.join('&id=');
    const url = `https://app.splatoon2.nintendo.net/api/nickname_and_icon?id=${query}`;
    const options = {
      headers: {
        cookie: `iksm_session=${process.env.TOKEN}`,
      },
    };
    const response = await lastValueFrom(this.axios.get(url, options))

    switch (response.status) {
      case 400:
        throw new BadRequestException();
      case 404:
        throw new NotFoundException();
      case 403:
        throw new ForbiddenException();
      default:
        return plainToClass(NicknameAndIconResponseDto, await response.data);
    }
  }
}
