import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Sse,
  MessageEvent,
  Query,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';
import { FeatureFlagsService } from './feature-flags.service';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { EtagInterceptor } from '../common/interceptors/etag.interceptor';

@Controller('feature-flags')
@UseInterceptors(EtagInterceptor)
export class FeatureFlagsController {
  constructor(
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'feature-flags.updated').pipe(
      map((data) => ({ data } as MessageEvent)),
    );
  }

  @Post()
  create(@Body() createFeatureFlagDto: CreateFeatureFlagDto) {
    return this.featureFlagsService.create(createFeatureFlagDto);
  }

  @Get()
  findAll(@Query('prefix') prefix?: string) {
    return this.featureFlagsService.findAll(prefix);
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.featureFlagsService.findOne(key);
  }

  @Patch(':key')
  update(
    @Param('key') key: string,
    @Body() updateFeatureFlagDto: UpdateFeatureFlagDto,
  ) {
    return this.featureFlagsService.update(key, updateFeatureFlagDto);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.featureFlagsService.remove(key);
  }
}
