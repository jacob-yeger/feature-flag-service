import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FeatureFlagClient } from 'feature-flag-client';

@Injectable()
export class MonitorService implements OnModuleInit, OnModuleDestroy {
    private pollingClient: FeatureFlagClient;
    private sseClient: FeatureFlagClient;
    private filteredClient: FeatureFlagClient;

    constructor(private eventEmitter: EventEmitter2) { }

    async onModuleInit() {
        // 1. Polling Client
        this.pollingClient = new FeatureFlagClient({
            serviceUrl: 'http://localhost:3000',
            refreshInterval: 5000,
            onLog: (msg) => this.emitLog('PollingClient', msg),
        });

        // 2. SSE Client
        this.sseClient = new FeatureFlagClient({
            serviceUrl: 'http://localhost:3000',
            useSSE: true,
            onLog: (msg) => this.emitLog('SSEClient', msg),
        });

        // 3. Filtered Client
        this.filteredClient = new FeatureFlagClient({
            serviceUrl: 'http://localhost:3000',
            refreshInterval: 5000,
            prefix: 'beta',
            onLog: (msg) => this.emitLog('FilteredClient', msg),
        });

        // Start all
        await this.pollingClient.start();
        await this.sseClient.start();
        await this.filteredClient.start();
    }

    onModuleDestroy() {
        this.pollingClient.stop();
        this.sseClient.stop();
        this.filteredClient.stop();
    }

    private emitLog(source: string, message: string) {
        this.eventEmitter.emit('log.entry', {
            source,
            message,
            timestamp: new Date().toISOString(),
        });
    }
}
