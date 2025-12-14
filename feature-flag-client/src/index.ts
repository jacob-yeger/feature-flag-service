import axios from 'axios';
const EventSource = require('eventsource');

interface FeatureFlag {
    key: string;
    isEnabled: boolean;
    description?: string;
}

export class FeatureFlagClient {
    private flags: Map<string, boolean> = new Map();
    private etag: string | null = null;
    private intervalId: NodeJS.Timeout | null = null;
    private eventSource: EventSource | null = null;
    private readonly serviceUrl: string;
    private readonly refreshInterval: number;
    private readonly prefix?: string;
    private readonly useSSE: boolean;

    constructor(config: {
        serviceUrl: string;
        refreshInterval?: number;
        prefix?: string;
        useSSE?: boolean;
    }) {
        this.serviceUrl = config.serviceUrl;
        this.refreshInterval = config.refreshInterval || 10000;
        this.prefix = config.prefix;
        this.useSSE = config.useSSE || false;
    }

    async start() {
        if (this.useSSE) {
            await this.startSSE();
        } else {
            await this.fetchFlags();
            this.intervalId = setInterval(() => this.fetchFlags(), this.refreshInterval);
        }
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    get(key: string, defaultValue: boolean = false): boolean {
        return this.flags.get(key) ?? defaultValue;
    }

    private async fetchFlags() {
        try {
            const headers: Record<string, string> = {};
            if (this.etag) {
                headers['If-None-Match'] = this.etag;
            }

            const url = this.prefix
                ? `${this.serviceUrl}/feature-flags?prefix=${this.prefix}`
                : `${this.serviceUrl}/feature-flags`;

            const response = await axios.get<FeatureFlag[]>(url, {
                headers,
                validateStatus: (status) => status === 200 || status === 304,
            });

            if (response.status === 304) {
                // Data not modified
                return;
            }

            const newFlags = new Map<string, boolean>();
            response.data.forEach((flag) => {
                newFlags.set(flag.key, flag.isEnabled);
            });
            this.flags = newFlags;

            if (response.headers['etag']) {
                this.etag = response.headers['etag'];
            }
        } catch (error) {
            console.error('Failed to fetch feature flags:', error);
        }
    }

    private async startSSE() {
        // Initial fetch to populate cache
        await this.fetchFlags();

        const url = `${this.serviceUrl}/feature-flags/stream`;
        this.eventSource = new EventSource(url);

        if (!this.eventSource) return;

        this.eventSource.onmessage = (event: any) => {
            try {
                const data = JSON.parse(event.data);
                // In a real app we might patch the map, but for simplicity we refetch or process the delta
                // The current event structure is { type: 'create'|'update'|'delete', data: FeatureFlag|key }
                // Let's just refetch all for simplicity to keep consistentstate or handle delta
                const { type, data: flagOrKey } = data;

                if (type === 'delete') {
                    this.flags.delete(flagOrKey);
                } else if (type === 'create' || type === 'update') {
                    // Check if filter applies
                    if (this.prefix && !flagOrKey.key.startsWith(this.prefix)) {
                        return;
                    }
                    this.flags.set(flagOrKey.key, flagOrKey.isEnabled);
                }
            } catch (err) {
                console.error('Error parsing SSE event:', err);
            }
        };

        this.eventSource.onerror = (err: any) => {
            console.error('SSE Error:', err);
        };
    }
}
