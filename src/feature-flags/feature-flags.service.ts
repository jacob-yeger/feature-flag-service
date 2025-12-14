import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FeatureFlag } from './entities/feature-flag.entity';
import { Model } from 'mongoose';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectModel(FeatureFlag.name) private featureFlagModel: Model<FeatureFlag>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private eventEmitter: EventEmitter2,
  ) { }

  async create(createFeatureFlagDto: CreateFeatureFlagDto) {
    const createdFeatureFlag = new this.featureFlagModel(createFeatureFlagDto);
    await this.redis.del('feature_flags:all');
    const result = await createdFeatureFlag.save();
    this.eventEmitter.emit('feature-flags.updated', { type: 'create', data: result });
    return result;
  }

  async findAll(prefix?: string) {
    const cacheKey = 'feature_flags:all';
    let flags: FeatureFlag[];
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      flags = JSON.parse(cached);
    } else {
      flags = await this.featureFlagModel.find().exec();
      await this.redis.set(cacheKey, JSON.stringify(flags), 'EX', 60);
    }

    if (prefix) {
      return flags.filter(flag => flag.key.startsWith(prefix));
    }
    return flags;
  }

  async findOne(key: string) {
    const featureFlag = await this.featureFlagModel.findOne({ key }).exec();
    if (!featureFlag) {
      throw new NotFoundException(`Feature flag with key "${key}" not found`);
    }
    return featureFlag;
  }

  async update(key: string, updateFeatureFlagDto: UpdateFeatureFlagDto) {
    const updatedFeatureFlag = await this.featureFlagModel
      .findOneAndUpdate({ key }, updateFeatureFlagDto, { new: true })
      .exec();
    await this.redis.del('feature_flags:all');
    this.eventEmitter.emit('feature-flags.updated', { type: 'update', data: updatedFeatureFlag });
    if (!updatedFeatureFlag) {
      throw new NotFoundException(`Feature flag with key "${key}" not found`);
    }
    return updatedFeatureFlag;
  }

  async remove(key: string) {
    const deletedFeatureFlag = await this.featureFlagModel
      .findOneAndDelete({ key })
      .exec();
    await this.redis.del('feature_flags:all');
    this.eventEmitter.emit('feature-flags.updated', { type: 'delete', key });
    if (!deletedFeatureFlag) {
      throw new NotFoundException(`Feature flag with key "${key}" not found`);
    }
    return deletedFeatureFlag;
  }
}
