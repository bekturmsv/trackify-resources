/**
 * @jest-environment jest-environment-jsdom
 */
import { createResourceMonitor } from '../src/index';

describe('ResourceMonitor (Browser/jsdom)', () => {
    beforeAll(() => {
        // Add performance.memory (JSDOM doesn't give it by default)
        (global as any).performance = globalThis.performance;
        (performance as any).memory = {
            usedJSHeapSize: 50 * 1024 * 1024  // 50 MB
        };
    });

    it('monitorPageLoad() сразу отрабатывает, если document.readyState === "complete"', async () => {
        const monitor = createResourceMonitor('pageLoadTest');
        // emulate that the page is already loaded
        Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });

        const stats = await monitor.monitorPageLoad();
        expect(typeof stats.duration).toBe('number');
        // memory should be ~50
        expect(stats.memory).toBeCloseTo(50, 0);
        expect(stats.label).toBe('pageLoadTest');
    });
});
