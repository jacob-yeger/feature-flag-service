import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { EtagInterceptor } from '../common/interceptors/etag.interceptor';

@Controller('feature-flags')
@UseInterceptors(EtagInterceptor)
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) { }

  @Post()
  create(@Body() createFeatureFlagDto: CreateFeatureFlagDto) {
    return this.featureFlagsService.create(createFeatureFlagDto);
  }

  @Get()
  findAll() {
    return this.featureFlagsService.findAll();
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
