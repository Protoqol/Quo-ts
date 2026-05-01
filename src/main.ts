import {type QuoPayload, QuoPayloadLanguage} from "./types/quo.js";
import {get_stack_trace} from "./info/stack_trace.js";
import {get_time} from "./info/time.js";
import {get_thread_info} from "./info/thread.js";
import {get_system_usage} from "./info/system_usage.js";
import {get_runtime} from "./info/runtime.js";
import {get_hash} from "./info/hash.js";
import {get_uuid} from "./info/uuid.js";
import {make_request} from "./request.js";

const SOURCE_CACHE: Record<string, string[]> = {};
const FETCHING_CACHE: Record<string, Promise<string[] | null>> = {};

/**
 * Sends data to Quo.
 *
 * @param args The values to send.
 */
export const quo = async (...args: any[]): Promise<void> => {
    const [STACK, CALLER, CALLER_FRAME] = get_stack_trace();
    const [MS] = get_time();
    const THREAD = get_thread_info();
    const [CPU, MEM] = get_system_usage();
    const [RT, VERSION] = get_runtime();

    let package_name = "quo-browser";
    let RAW = CALLER_FRAME?.raw || "";
    let lines: string[] = [];

    if (typeof process !== "undefined") {
        try {
            const fs = await import("fs");
            const path = await import("path");
            const pkgPath = path.join(process.cwd(), "package.json");

            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

                if (pkg.name) {
                    package_name = pkg.name;
                }
            }

            if (CALLER_FRAME?.file && CALLER_FRAME?.line) {
                let file_path = CALLER_FRAME.file;

                if (file_path.startsWith("file://")) {
                    file_path = new URL(file_path).pathname;

                    if (process.platform === "win32" && file_path.startsWith("/")) {
                        file_path = file_path.slice(1);
                    }
                }

                if (fs.existsSync(file_path)) {
                    const content = fs.readFileSync(file_path, "utf8");
                    lines = content.split(/\r?\n/);
                    const startLine = (CALLER_FRAME.line ?? 1) - 1;
                    RAW = lines.slice(startLine, startLine + 100).join("\n");
                }
            }
        } catch (e) {
            if (package_name === "quo-browser") {
                package_name = "quo-node";
            }
        }
    } else if (typeof window !== "undefined" && CALLER_FRAME?.file) {
        const file = CALLER_FRAME.file;
        if (SOURCE_CACHE[file]) {
            lines = SOURCE_CACHE[file]!;
        } else if (file.startsWith("http") || file.startsWith("/") || file.startsWith("file://")) {
            try {
                if (!FETCHING_CACHE[file]) {
                    FETCHING_CACHE[file] = fetch(file)
                        .then(r => r.ok ? r.text() : null)
                        .then(t => t ? t.split(/\r?\n/) : null)
                        .catch(() => null);
                }
                const fetched_lines = await FETCHING_CACHE[file];
                if (fetched_lines) {
                    SOURCE_CACHE[file] = fetched_lines;
                    lines = fetched_lines;
                }
            } catch (e) {
                // Ignore
            }
        }

        if (lines.length > 0 && CALLER_FRAME.line) {
            const startLine = Math.max(0, CALLER_FRAME.line - 1);
            RAW = lines.slice(startLine, startLine + 100).join("\n");
        }
    }

    let names: string[] = args.map(() => "unknown-variable-name");

    if (RAW) {
        let QUO_START = -1;

        if (CALLER_FRAME?.column && CALLER_FRAME.column > 0) {
            const col = CALLER_FRAME.column;
            const sub = RAW.substring(0, col + 4);
            const last = sub.lastIndexOf("quo(");
            const lastWithSpace = sub.lastIndexOf("quo (");

            QUO_START = Math.max(last, lastWithSpace);
        }

        if (QUO_START === -1) {
            QUO_START = RAW.indexOf("quo(");
        }

        if (QUO_START !== -1) {
            let depth = 0;
            let current_arg = "";
            const args_found: string[] = [];
            const open_paren_index = RAW.indexOf("(", QUO_START);

            if (open_paren_index !== -1) {
                const content = RAW.slice(open_paren_index + 1);

                let in_string = false;
                let string_char = "";
                let escaped = false;

                for (let i = 0; i < content.length; i++) {
                    const char = content[i];

                    if (in_string) {
                        if (escaped) {
                            escaped = false;
                        } else if (char === "\\") {
                            escaped = true;
                        } else if (char === string_char) {
                            in_string = false;
                        }
                    } else {
                        if (char === "\"" || char === "'" || char === "`") {
                            in_string = true;
                            string_char = char;
                        } else if (char === "(" || char === "{" || char === "[") {
                            depth++;
                        } else if (char === ")" || char === "}" || char === "]") {
                            if (depth === 0 && char === ")") {
                                args_found.push(current_arg.trim().replace(/\s+/g, " "));
                                break;
                            }
                            depth--;
                        } else if (char === "," && depth === 0) {
                            args_found.push(current_arg.trim().replace(/\s+/g, " "));
                            current_arg = "";
                            continue;
                        }
                    }

                    current_arg += char;
                }

                args_found.forEach((name, index) => {
                    if (index < names.length) {
                        names[index] = name.trim() || "unknown-variable-name";
                    }
                });
            }
        }
    }

    const CALL_UID = get_uuid();
    const SHARED_GROUPING_HASH = get_hash("grouped", `${names.join(",")}:${CALL_UID}`, package_name);

    args.forEach((value, index) => {
        const final_name = (names[index] !== "unknown-variable-name" ? names[index] : null) || null;
        const final_line = CALLER_FRAME?.line ?? null;
        const final_file = CALLER_FRAME?.file ?? null;

        const get_var_type = (val: any): string => {
            if (val === null) {
                return "null";
            }
            if (val === undefined) {
                return "undefined";
            }

            if (Array.isArray(val)) {
                if (val.length === 0) {
                    return "Array<any>";
                }

                const elementTypes = [...new Set(val.map(v => get_var_type(v)))];

                return `Array<${elementTypes.join(" | ")}>`;
            }

            const type = typeof val;

            if (type === "object") {
                const name = val.constructor?.name || "object";
                return name === "Object" ? "object" : name;
            }

            return type;
        };

        const var_type = get_var_type(value);

        let value_str: string;

        if (value === null) {
            value_str = "null";
        } else if (value === undefined) {
            value_str = "undefined";
        } else if (typeof value === "object") {
            try {
                value_str = JSON.stringify(value);
            } catch (e) {
                value_str = String(value);
            }
        } else {
            value_str = String(value);
        }

        const IS_IDENTIFIER = final_name !== null ? /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(final_name) : false;

        let is_const_declared = false;
        let is_mutable_declared = true;

        if (IS_IDENTIFIER && final_name && lines.length > 0 && final_line) {
            for (let i = final_line - 1; i >= 0; i--) {
                const line = lines[i];
                if (!line) {
                    continue;
                }

                const constRegex = new RegExp(`\\bconst\\s+${final_name}\\b`);
                const letRegex = new RegExp(`\\b(let|var)\\s+${final_name}\\b`);
                const funcRegex = new RegExp(`\\bfunction\\s+${final_name}\\b`);
                const classRegex = new RegExp(`\\bclass\\s+${final_name}\\b`);

                if (constRegex.test(line)) {
                    is_const_declared = true;
                    is_mutable_declared = false;
                    break;
                }
                if (letRegex.test(line)) {
                    is_const_declared = false;
                    is_mutable_declared = true;
                    break;
                }
                if (funcRegex.test(line) || classRegex.test(line)) {
                    is_const_declared = true;
                    is_mutable_declared = false;
                    break;
                }
            }
        }

        const IS_CONSTANT = final_name !== null ? (is_const_declared || (IS_IDENTIFIER && final_name === final_name.toUpperCase() && final_name !== final_name.toLowerCase())) : false;
        const IS_EXPRESSION = !IS_IDENTIFIER || final_name === null;

        let name_to_send = final_name ?? "";

        if (IS_EXPRESSION && (var_type === "object" || var_type.startsWith("Array<"))) {
            name_to_send = "JSON";
        }

        const payload: QuoPayload = {
            meta    : {
                id             : index,
                uid            : get_uuid(),
                origin         : package_name,
                sender_origin  : final_file && final_line ? `${final_file.replace("file:///", "")}:${final_line}` : "unknown:0",
                time_epoch_ms  : MS,
                variable       : {
                    var_type      : var_type,
                    name          : name_to_send,
                    value         : value_str,
                    is_mutable    : is_mutable_declared,
                    is_constant   : IS_CONSTANT,
                    is_expression : IS_EXPRESSION,
                    memory_address: null,
                    grouping_hash : SHARED_GROUPING_HASH,
                },
                stack_trace    : STACK,
                thread_info    : THREAD,
                runtime        : `${RT} ${VERSION}`,
                cpu_usage      : CPU,
                memory_usage   : MEM,
                caller_function: CALLER,
            },
            language: final_file?.includes(".js") ? QuoPayloadLanguage.Javascript : QuoPayloadLanguage.Typescript,
        };

        const host = (typeof process !== "undefined" ? process.env?.["QUO_HOST"] : null) ?? (typeof window !== "undefined" ? (window as any).QUO_HOST : null) ?? "http://127.0.0.1";
        const port = (typeof process !== "undefined" ? process.env?.["QUO_PORT"] : null) ?? (typeof window !== "undefined" ? (window as any).QUO_PORT : null) ?? "7312";
        const target = `${host.startsWith("http") ? host : `http://${host}`}:${port}/payload`;

        make_request(target, payload);
    });
};

if (typeof window !== "undefined") {
    (window as any).quo = quo;
}
