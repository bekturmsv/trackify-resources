import pidusage from 'pidusage';

export async function getPidUsage(pid: number) {
    try {
        const stats = await pidusage(pid);
        return {
            cpu: stats.cpu,
            memory: stats.memory / 1024 / 1024,
        };
    } catch (e) {
        console.warn('pidusage not available, skipping CPU/memory monitoring:', e);
        return null;
    }
}