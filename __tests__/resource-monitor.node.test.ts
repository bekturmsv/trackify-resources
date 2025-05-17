import { createResourceMonitor } from '../src/index';

describe('ResourceMonitor (Node.js)', () => {
    it('trackFunction синхронной функции возвращает результат и stats', async () => {
        const monitor = createResourceMonitor('syncTest');
        const { result, stats } = await monitor.trackFunction(() => 123, 'syncTest');
        expect(result).toBe(123);
        expect(typeof stats.duration).toBe('number');
        expect(stats.label).toBe('syncTest');
        expect(stats.timestamp).toBeDefined();
    });

    it('trackFunction async-функции учитывает задержку', async () => {
        const monitor = createResourceMonitor('asyncTest');
        const start = Date.now();
        const { result, stats } = await monitor.trackFunction(
            () => new Promise<string>(r => setTimeout(() => r('ok'), 100)),
            'delay100'
        );
        const took = Date.now() - start;
        expect(result).toBe('ok');
        // duration in stats should not be less than emulation
        expect(stats.duration!).toBeGreaterThanOrEqual(90);
        expect(stats.label).toBe('delay100');
    });

    it('monitor() сразу после создания тоже отрабатывает без ошибок', async () => {
        const monitor = createResourceMonitor('simple');
        const stats = await monitor.monitor();
        expect(typeof stats.duration).toBe('number');
        expect(stats.label).toBe('simple');
    });
});
