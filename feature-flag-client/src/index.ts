import axios from 'axios';

interface FeatureFlag {
    key: string;
    isEnabled: boolean;
    description?: string;
}

export class FeatureFlagClient {
    private flags: Map<string, boolean> = new Map();
    private etag: string | null = null;
    private intervalId: NodeJS.Timeout | null = null;
    private readonly serviceUrl: string;
    private readonly refreshInterval: number;

    constructor(config: { serviceUrl: string; refreshInterval?: number }) {
        this.serviceUrl = config.serviceUrl;
        this.refreshInterval = config.refreshInterval || 10000;
    }

    async start() {
        await this.fetchFlags();
        this.intervalId = setInterval(() => this.fetchFlags(), this.refreshInterval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
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

            const response = await axios.get<FeatureFlag[]>(`${this.serviceUrl}/feature-flags`, {
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
}
