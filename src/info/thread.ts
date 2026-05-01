export const get_thread_info = (): string | null => {
    if (typeof window === "undefined" && typeof process === "object") {
        return process.pid?.toString() || "main";
    }

    if (typeof window !== "undefined") {
        if (typeof (self as any).WorkerGlobalScope !== "undefined") {
            return (self as any).name || "worker";
        }

        return "main";
    }

    return "main";
};
