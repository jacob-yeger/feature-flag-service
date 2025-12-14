import { FeatureFlagClient } from 'feature-flag-client';

async function bootstrap() {
    console.log('🚀 Starting Feature Flag Service Demo\n');

    // 1. Optimized Polling Client (ETags)
    const pollingClient = new FeatureFlagClient({
        serviceUrl: 'http://localhost:3000',
        refreshInterval: 5000,
    });
    console.log('1️⃣  Starting Polling Client (with ETags)...');
    await pollingClient.start();

    // 2. Real-time Client (SSE)
    const sseClient = new FeatureFlagClient({
        serviceUrl: 'http://localhost:3000',
        useSSE: true,
    });
    console.log('2️⃣  Starting Real-time Client (SSE)...');
    await sseClient.start();

    // 3. Filtered Client (Prefix: 'beta')
    const filteredClient = new FeatureFlagClient({
        serviceUrl: 'http://localhost:3000',
        refreshInterval: 5000,
        prefix: 'beta',
    });
    console.log('3️⃣  Starting Filtered Client (Prefix: "beta")...');
    await filteredClient.start();

    console.log('\n✅ All clients started. Listening for changes...\n');

    // Display loop
    setInterval(() => {
        console.clear();
        console.log('--- 📊 Feature Flag Status 📊 ---\n');

        console.log('1️⃣  Polling Client (Full List):');
        console.log(`   new-feature: ${pollingClient.get('new-feature') ? '✅ ON' : '❌ OFF'}`);
        console.log(`   beta-feature: ${pollingClient.get('beta-feature') ? '✅ ON' : '❌ OFF'}`);

        console.log('\n2️⃣  SSE Client (Real-time):');
        console.log(`   new-feature: ${sseClient.get('new-feature') ? '✅ ON' : '❌ OFF'}`);
        console.log(`   beta-feature: ${sseClient.get('beta-feature') ? '✅ ON' : '❌ OFF'}`);

        console.log('\n3️⃣  Filtered Client (Prefix "beta"):');
        // "new-feature" should verify as false since it's filtered out/not fetched? 
        // Actually client.get returns default false if missing.
        console.log(`   new-feature: ${filteredClient.get('new-feature') ? '✅ ON' : '❌ OFF'} (Should be OFF if filtered)`);
        console.log(`   beta-feature: ${filteredClient.get('beta-feature') ? '✅ ON' : '❌ OFF'}`);

        console.log('\n-------------------------------');
        console.log(`Last update: ${new Date().toLocaleTimeString()}`);
    }, 2000);
}

bootstrap();
