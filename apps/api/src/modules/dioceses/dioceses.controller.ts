import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@companion/common';
import { CursorPageQueryDto, DiocesePageDto } from '@companion/dto';

import { DiocesesService } from './dioceses.service';

@ApiTags('dioceses')
@Public()
@Controller('dioceses')
export class DiocesesController {
  constructor(private readonly dioceses: DiocesesService) {}

  @Get()
  @ApiOperation({ operationId: 'listDioceses', summary: 'List published dioceses, by name' })
  @ApiOkResponse({ type: DiocesePageDto })
  @ApiBadRequestResponse({ description: 'Invalid cursor or limit' })
  list(@Query() query: CursorPageQueryDto): Promise<DiocesePageDto> {
    return this.dioceses.listPublished(query);
  }
}
