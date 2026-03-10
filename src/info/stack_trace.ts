export type StackFrame = {
    name: string | null;
    file: string | null;
    line: number | null;
    column: number | null;
    raw: string;
};

export const get_stack_trace = (): [string[] | null, string | null, StackFrame | null] => {
    const STACK = new Error().stack;

    if (!STACK) {
        return [null, null, null];
    }

    const LINES = STACK.split("\n");
    const FRAMES: string[] = [];
    let caller: string | null = null;
    let callerFrame: StackFrame | null = null;

    for (let i = 1; i < LINES.length; i++) {
        const LINE = LINES[i]?.trim();
        if (!LINE) {
            continue;
        }

        // Skip internal frames
        if (LINE.includes("get_stack_trace") || LINE.includes("quo-ts") || LINE.includes("node:internal")) {
            continue;
        }

        let frameName = LINE;
        // Match "at functionName (file:line:col)" or "at file:line:col"
        const MATCH = LINE.match(/at (.*) \((.*):(\d+):(\d+)\)/) || LINE.match(/at (.*):(\d+):(\d+)/);

        let file: string | null = null;
        let line: number | null = null;
        let column: number | null = null;
        let name: string | null = null;

        if (MATCH) {
            if (MATCH.length === 5) {
                // at functionName (file:line:col)
                name = MATCH[1]?.trim() ?? null;
                file = MATCH[2] ?? null;
                line = parseInt(MATCH[3] ?? "0", 10);
                column = parseInt(MATCH[4] ?? "0", 10);
                frameName = name ?? LINE;
            } else if (MATCH.length === 4) {
                // at file:line:col
                file = MATCH[1] ?? null;
                line = parseInt(MATCH[2] ?? "0", 10);
                column = parseInt(MATCH[3] ?? "0", 10);
                frameName = file ?? LINE;
            }
        }

        if (!caller) {
            caller = frameName;
            callerFrame = {
                name,
                file,
                line,
                column,
                raw: LINE,
            };
        }

        FRAMES.push(frameName);
    }

    return [FRAMES.length > 0 ? FRAMES : null, caller, callerFrame];
};
