export const get_time = (): [number, string] => {
    const NOW_MS = Date.now();
    let highRes: string;

    if (typeof process !== "undefined" && typeof process.hrtime === "function" && typeof BigInt !== "undefined") {
        highRes = process.hrtime.bigint().toString();
    } else if (typeof performance !== "undefined" && typeof performance.now === "function") {
        highRes = (performance.now() * 1000).toFixed(0);
    } else {
        highRes = NOW_MS.toString();
    }

    return [NOW_MS, highRes];
};
