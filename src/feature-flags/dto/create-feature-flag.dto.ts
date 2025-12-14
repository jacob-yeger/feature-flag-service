export class CreateFeatureFlagDto {
    key: string;
    name: string;
    description?: string;
    isEnabled?: boolean;
}
