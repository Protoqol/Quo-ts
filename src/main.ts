import {type QuoPayload, QuoPayloadLanguage} from "./types/quo.js";
import {get_stack_trace} from "./info/stack_trace.js";
import {get_time} from "./info/time.js";
import {get_thread_info} from "./info/thread.js";
import {get_system_usage} from "./info/system_usage.js";
import {get_runtime} from "./info/runtime.js";
import {get_hash} from "./info/hash.js";
import {make_request} from "./request.js";

/**
 * Sends data to Quo.
 *
 * @param args The values to send.
 */
export const quo = async (
    ...args: any[]
): Promise<void> => {
    const [STACK, CALLER, CALLER_FRAME] = get_stack_trace();
    const [MS, UID] = get_time();
    const THREAD = get_thread_info();
    const [CPU, MEM] = get_system_usage();
    const [RT, VERSION] = get_runtime();

    let package_name = "quo-browser";

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
        } catch (e) {
            package_name = "quo-node";
        }
    }

    args.forEach((value, index) => {
        let final_name = "unknown";
        let final_line = CALLER_FRAME?.line ?? null;
        let final_file = CALLER_FRAME?.file ?? null;

        if (CALLER_FRAME?.raw) {
            const RAW = CALLER_FRAME.raw;
            const QUO_START = RAW.indexOf("quo(");

            if (QUO_START !== -1) {
                let depth = 0;
                let current_arg = "";
                const args_found: string[] = [];
                const content = RAW.slice(QUO_START + 4);

                for (let i = 0; i < content.length; i++) {
                    const char = content[i];

                    if (char === "(") {
                        depth++;
                    }

                    if (char === ")") {
                        if (depth === 0) {
                            args_found.push(current_arg.trim());
                            break;
                        }
                        depth--;
                    }

                    if (char === "," && depth === 0) {
                        args_found.push(current_arg.trim());
                        current_arg = "";
                        continue;
                    }

                    current_arg += char;
                }

                if (args_found[index]) {
                    final_name = args_found[index] || "unknown";
                }
            }
        }

        const VAR_TYPE = typeof value;
        const VALUE_STR = String(value);

        const IS_IDENTIFIER = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(final_name);
        const IS_CONSTANT = IS_IDENTIFIER && final_name === final_name.toUpperCase() && final_name !== final_name.toLowerCase();
        const IS_EXPRESSION = !IS_IDENTIFIER && final_name !== "unknown";

        const payload: QuoPayload = {
            meta    : {
                id             : get_hash(VAR_TYPE, final_name, package_name),
                uid            : UID,
                origin         : package_name,
                sender_origin  : final_file && final_line ? `${final_file}:${final_line}` : package_name,
                time_epoch_ms  : MS,
                variable       : {
                    var_type      : VAR_TYPE,
                    name          : final_name,
                    value         : VALUE_STR,
                    is_mutable    : !IS_CONSTANT,
                    is_constant   : IS_CONSTANT,
                    is_expression : IS_EXPRESSION,
                    memory_address: null,
                    grouping_hash : get_hash(VAR_TYPE, final_name, package_name),
                },
                stack_trace    : STACK,
                thread_info    : THREAD,
                runtime        : `${RT} ${VERSION}`,
                cpu_usage      : CPU,
                memory_usage   : MEM,
                caller_function: CALLER,
            },
            language: QuoPayloadLanguage.Typescript,
        };

        const host = (typeof process !== "undefined" ? process.env["QUO_HOST"] : null) ?? "http://127.0.0.1";
        const port = (typeof process !== "undefined" ? process.env["QUO_PORT"] : null) ?? "7312";
        const target = `${host}:${port}/payload`;

        make_request(target, payload)
            .then(() => {
                // Assume request was successful.
            })
            .catch(e => {
                console.error(`[QUO] error "${e}" - is Quo running?`);
            });
    });
};

if (typeof window !== "undefined") {
    (window as any).quo = quo;
}
