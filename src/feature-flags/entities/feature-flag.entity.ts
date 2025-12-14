import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FeatureFlagDocument = HydratedDocument<FeatureFlag>;

@Schema()
export class FeatureFlag {
    @Prop({ required: true, unique: true })
    key: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ default: false })
    isEnabled: boolean;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);
