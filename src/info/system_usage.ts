export const get_system_usage = (): [number | null, number | null] => {
    let cpu: number | null = null;
    let mem: number | null = null;

    if (typeof process !== "undefined" && typeof process.cpuUsage === "function" && typeof process.memoryUsage === "function") {
        const cpuUsage = process.cpuUsage();
        cpu = (cpuUsage.user + cpuUsage.system) / 1000;
        mem = process.memoryUsage().rss;
    } else if (typeof performance !== "undefined" && (performance as any).memory) {
        mem = (performance as any).memory.usedJSHeapSize;
    }

    return [cpu, mem];
};
