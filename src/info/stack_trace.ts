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

        const LOWER_LINE = LINE.toLowerCase();
        // Skip internal frames
        const isInternal = LOWER_LINE.includes("get_stack_trace") ||
            LOWER_LINE.includes("node:internal") ||
            LOWER_LINE.includes("at quo ") ||
            LOWER_LINE.includes("quo@") ||
            LOWER_LINE.includes("quo.bundle.js") ||
            // Only skip if it's actually the library's main file or this stack trace file
            ((LOWER_LINE.includes("src/main.ts") || LOWER_LINE.includes("src\\main.ts") ||
                    LOWER_LINE.includes("src/info/stack_trace.ts") || LOWER_LINE.includes("src\\info\\stack_trace.ts")) &&
                LOWER_LINE.includes("quo-ts"));

        if (isInternal) {
            continue;
        }

        let frameName = LINE;

        // Match "at functionName (file:line:col)" or "at file:line:col"
        const MATCH = LINE.match(/at (.*) \((.*):(\d+):(\d+)\)/) || // Chrome/Node: at name (file:line:col)
            LINE.match(/at (.*):(\d+):(\d+)/) ||             // Chrome/Node: at file:line:col
            LINE.match(/(.*)@(.*):(\d+):(\d+)/) ||           // Firefox/Safari: name@file:line:col
            LINE.match(/@(.*):(\d+):(\d+)/);                 // Firefox/Safari: @file:line:col

        let file: string | null = null;
        let line: number | null = null;
        let column: number | null = null;
        let name: string | null = null;

        if (MATCH) {
            // Check if it's the 5-group match (with name)
            if (MATCH.length === 5) {
                name = MATCH[1]?.trim() ?? null;
                file = MATCH[2] ?? null;
                line = parseInt(MATCH[3] ?? "0", 10);
                column = parseInt(MATCH[4] ?? "0", 10);
                frameName = name ?? LINE;
            } else if (MATCH.length === 4) {
                // Check if it's the 4-group match (no name)
                file = MATCH[1] ?? null;
                line = parseInt(MATCH[2] ?? "0", 10);
                column = parseInt(MATCH[3] ?? "0", 10);
                frameName = file ?? LINE;
            }
        }

        if (!caller) {
            caller = frameName.replace("file:///", "");
            callerFrame = {
                name,
                file,
                line,
                column,
                raw: LINE,
            };
        }

        FRAMES.push(frameName.replace("file:///", ""));
    }

    return [FRAMES.length > 0 ? FRAMES : null, caller, callerFrame];
};
