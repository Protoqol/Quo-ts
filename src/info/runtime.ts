export const get_runtime = (): [string, string] => {
    if (typeof window === "undefined" && typeof process === "object") {
        return ["node", process.version];
    }

    let platform = window.navigator.userAgent ?? "";

    return ["browser", platform];
};
