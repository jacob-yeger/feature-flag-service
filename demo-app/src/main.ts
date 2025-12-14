import { FeatureFlagClient } from 'feature-flag-client';

async function bootstrap() {
    const client = new FeatureFlagClient({
        serviceUrl: 'http://localhost:3000',
        refreshInterval: 5000,
    });

    console.log('Starting Feature Flag Client Demo...');
    await client.start();
    console.log('Client started.');

    setInterval(() => {
        const isNewFeatureEnabled = client.get('new-feature', false);
        const isBetaEnabled = client.get('beta-feature', false);

        console.log('--- Flag Status ---');
        console.log(`new-feature: ${isNewFeatureEnabled ? 'ENABLED' : 'DISABLED'}`);
        console.log(`beta-feature: ${isBetaEnabled ? 'ENABLED' : 'DISABLED'}`);
        console.log('-------------------');
    }, 2000);
}

bootstrap();
