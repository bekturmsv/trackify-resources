const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isNode = !isBrowser && typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

/**
 * Describes the result of a single resource measurement.
 */
export interface MonitorResult {
    /** ISO timestamp when the measurement was taken */
    timestamp: string;
    /** Duration in milliseconds */
    duration?: number;
    /** CPU usage percentage (Node only) */
    cpu?: number;
    /** Memory usage in megabytes */
    memory?: number;
    /** Optional label to identify the measurement */
    label?: string;
}

/**
 * Configuration options for ResourceMonitor.
 */
export interface MonitorOptions {
    /** Suppress console output when true */
    silent?: boolean;
}

/**
 * Tracks resource usage over time in both browser and Node.js environments.
 */
export class ResourceMonitor {
    private startTime: number;
    private results: MonitorResult[] = [];
    private label?: string;
    private envName: string;
    private silent: boolean;

    /**
     * Initializes a new ResourceMonitor.
     * @param label Optional identifier for grouping measurements.
     * @param options Optional settings to control behavior.
     */
    constructor(label?: string, options?: MonitorOptions) {
        this.label = label;
        this.startTime = this.now();
        this.envName = isBrowser ? 'Browser' : isNode ? 'Node.js' : 'Unknown';
        this.silent = options?.silent ?? false;
        this.log(`Initialized${label ? ` (${label})` : ''} in ${this.envName}`);
    }

    /**
     * Returns the current high-resolution timestamp in milliseconds.
     */
    private now(): number {
        if (isBrowser) {
            return performance.now();
        }
        return Number(process.hrtime.bigint()) / 1e6;
    }

    /**
     * Measures resources since the creation of this monitor.
     * @returns A MonitorResult containing the measurement data.
     */
    async monitor(): Promise<MonitorResult> {
        return this.monitorWithStart(this.startTime, this.label);
    }

    /**
     * Executes a function and measures its resource usage.
     * @param fn The function or async operation to track.
     * @param label Optional label for this measurement.
     * @returns The function's return value and the corresponding MonitorResult.
     */
    async trackFunction<T>(
        fn: () => T | Promise<T>,
        label?: string
    ): Promise<{ result: T; stats: MonitorResult }> {
        const start = this.now();
        const result = await fn();
        const stats = await this.monitorWithStart(start, label);
        return { result, stats };
    }

    /**
     * In a browser environment, waits for the page load event and measures load time and memory.
     * @returns A MonitorResult containing page load metrics.
     */
    async monitorPageLoad(): Promise<MonitorResult> {
        if (!isBrowser) {
            throw new Error('monitorPageLoad is only supported in a browser environment');
        }
        return new Promise(resolve => {
            const onLoad = async () => {
                const duration = performance.now();
                const mem = (performance as any).memory;
                const result: MonitorResult = {
                    timestamp: new Date().toISOString(),
                    duration,
                    memory: mem ? mem.usedJSHeapSize / 1024 / 1024 : undefined,
                    label: this.label ?? 'pageLoad'
                };
                this.results.push(result);
                this.printResult(result);
                resolve(result);
            };
            if (document.readyState === 'complete') {
                onLoad();
            } else {
                window.addEventListener('load', onLoad);
            }
        });
    }

    /**
     * Internal helper to measure resources from a given start time.
     * @param startTime The start timestamp in milliseconds.
     * @param label Optional label to associate with this measurement.
     * @returns A MonitorResult with the measurement data.
     */
    private async monitorWithStart(
        startTime: number,
        label?: string
    ): Promise<MonitorResult> {
        const result: MonitorResult = { timestamp: new Date().toISOString(), label };

        if (isBrowser) {
            result.duration = this.now() - startTime;
            const mem = (performance as any).memory;
            if (mem) {
                result.memory = mem.usedJSHeapSize / 1024 / 1024;
            }
        } else if (isNode) {
            try {
                const { getPidUsage } = await import('./pidusage');
                const stats = await getPidUsage(process.pid);
                if (stats) {
                    result.cpu = stats.cpu;
                    result.memory = stats.memory;
                }
            } catch {
                this.log('Warning: pidusage failed — skipping CPU/memory');
            }
            const end = Number(process.hrtime.bigint()) / 1e6;
            result.duration = end - startTime;
        } else {
            result.duration = Date.now() - startTime;
        }

        this.results.push(result);
        this.printResult(result);
        return result;
    }

    /**
     * Outputs a formatted measurement to the console unless silent is enabled.
     * @param data The MonitorResult to print.
     */
    private printResult(data: MonitorResult): void {
        if (this.silent) return;
        this.log('--- ResourceTracker ---');
        this.log(
            `Time: ${data.timestamp}${data.label ? ` [${data.label}]` : ''}` +
            ` (in ${this.envName})`
        );
        if (data.duration != null) this.log(`Duration: ${data.duration.toFixed(2)} ms`);
        if (data.cpu      != null) this.log(`CPU:      ${data.cpu.toFixed(2)}%`);
        if (data.memory   != null) this.log(`Memory:   ${data.memory.toFixed(2)} MB`);
        this.log('-----------------------');
    }

    /**
     * Wrapper for console.log to centralize output logic.
     */
    private log(...args: any[]): void {
        console.log(...args);
    }

    /**
     * Returns a copy of all recorded measurements.
     * @returns Array of MonitorResult entries.
     */
    getHistory(): MonitorResult[] {
        return [...this.results];
    }
}

/**
 * Factory function to create a ResourceMonitor instance.
 * @param label Optional label for the monitor instance.
 * @param options Optional settings (e.g., silent mode).
 * @returns A new ResourceMonitor.
 */
export function createResourceMonitor(
    label?: string,
    options?: MonitorOptions
): ResourceMonitor {
    return new ResourceMonitor(label, options);
}
