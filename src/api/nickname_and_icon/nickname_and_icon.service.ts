import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { NicknameAndIconRequestDto } from './nickname_and_icon.request';
import { NicknameAndIconResponseDto } from './nickname_and_icon.response';
import fetch from 'node-fetch';

@Injectable()
export class NicknameAndIconService {
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
    const response = await fetch(url, options);

    switch (response.status) {
      case 400:
        throw new BadRequestException();
      case 404:
        throw new NotFoundException();
      case 403:
        throw new ForbiddenException();
      default:
        return plainToClass(NicknameAndIconResponseDto, await response.json());
    }
  }
}
