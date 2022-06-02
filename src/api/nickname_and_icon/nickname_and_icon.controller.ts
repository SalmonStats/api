import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NicknameAndIconRequestDto } from './nickname_and_icon.request';
import { NicknameAndIconResponseDto } from './nickname_and_icon.response';
import { NicknameAndIconService } from './nickname_and_icon.service';

@ApiTags('ユーザー')
@Controller('nickname_and_icon')
export class NicknameAndIconController {
  constructor(private readonly service: NicknameAndIconService) {}

  @Get()
  @ApiOperation({ operationId: 'アイコン取得' })
  @ApiOkResponse({ type: NicknameAndIconResponseDto })
  @ApiForbiddenResponse()
  findMany(
    @Query(new ValidationPipe({ transform: true }))
    request: NicknameAndIconRequestDto
  ): Promise<NicknameAndIconResponseDto> {
    return this.service.findMany(request);
  }
}
