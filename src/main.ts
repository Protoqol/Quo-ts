import {type QuoPayload, QuoPayloadLanguage} from "./types/quo.js";
import {get_stack_trace} from "./info/stack_trace.js";
import {get_time} from "./info/time.js";
import {get_thread_info} from "./info/thread.js";
import {get_system_usage} from "./info/system_usage.js";
import {get_runtime} from "./info/runtime.js";

const [STACK, CALLER] = get_stack_trace();
const [MS, UID] = get_time();
const THREAD = get_thread_info();
const [CPU, MEM] = get_system_usage();
const [RT, VERSION] = get_runtime();

let test: QuoPayload = {
    meta    : {
        id             : "",
        uid            : UID,
        origin         : "quo-ts",
        sender_origin  : "quo-ts",
        time_epoch_ms  : MS,
        variable       : {
            var_type      : "quo-ts",
            name          : "quo-ts",
            value         : "quo-ts",
            is_mutable    : false,
            is_constant   : false,
            is_expression : false,
            memory_address: null,
            grouping_hash : null,
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

fetch("http://localhost:8080/quo", {method: "POST", body: JSON.stringify(test)})
    .then(res => res.json())
    .catch(err => console.error(err));
