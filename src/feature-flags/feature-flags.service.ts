import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FeatureFlag } from './entities/feature-flag.entity';
import { Model } from 'mongoose';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectModel(FeatureFlag.name) private featureFlagModel: Model<FeatureFlag>,
  ) { }

  async create(createFeatureFlagDto: CreateFeatureFlagDto) {
    const createdFeatureFlag = new this.featureFlagModel(createFeatureFlagDto);
    return createdFeatureFlag.save();
  }

  async findAll() {
    return this.featureFlagModel.find().exec();
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
    if (!updatedFeatureFlag) {
      throw new NotFoundException(`Feature flag with key "${key}" not found`);
    }
    return updatedFeatureFlag;
  }

  async remove(key: string) {
    const deletedFeatureFlag = await this.featureFlagModel
      .findOneAndDelete({ key })
      .exec();
    if (!deletedFeatureFlag) {
      throw new NotFoundException(`Feature flag with key "${key}" not found`);
    }
    return deletedFeatureFlag;
  }
}
