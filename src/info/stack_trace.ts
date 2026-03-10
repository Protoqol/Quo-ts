export const get_stack_trace = (): [string[] | null, string | null] => {
    const STACK = new Error().stack;

    if (!STACK) {
        return [null, null];
    }

    const LINES = STACK.split("\n");
    const FRAMES: string[] = [];
    let caller: string | null = null;

    for (let i = 1; i < LINES.length; i++) {
        const LINE = LINES[i]?.trim();
        if (!LINE) {
            continue;
        }

        if (LINE.includes("get_stack_trace") || LINE.includes("quo-ts") || LINE.includes("node:internal")) {
            continue;
        }

        let frameName = LINE;
        const MATCH = LINE.match(/at (.*) \(.*\)/) || LINE.match(/at (.*)/);

        if (MATCH?.[1]) {
            frameName = MATCH[1].trim();
        }

        if (!caller) {
            caller = frameName;
        }

        FRAMES.push(frameName);
    }

    return [FRAMES.length > 0 ? FRAMES : null, caller];
};
