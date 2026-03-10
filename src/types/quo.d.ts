export type QuoPayload = {
    meta: QuoPayloadMeta,
    language: QuoPayloadLanguage,
}

export type QuoPayloadVariable = {
    var_type: String,
    name: String,
    value: String,
    is_mutable: boolean,
    is_constant: boolean,
    is_expression: boolean,

    memory_address: String | null,
    grouping_hash: String | null,
}

export type QuoPayloadMeta = {
    id: String,
    uid: String,
    origin: String,
    sender_origin: String,
    time_epoch_ms: number,
    variable: QuoPayloadVariable,

    stack_trace: Array<String> | null,
    thread_info: String | null,
    runtime: String | null,
    cpu_usage: number | null,
    memory_usage: number | null,
    caller_function: String | null,
}

export enum QuoPayloadLanguage {
    Rust       = "Rust",
    Php        = "Php",
    Javascript = "Javascript",
    Typescript = "Typescript",
    Python     = "Python",
    Ruby       = "Ruby",
    Go         = "Go",
    Unknown    = "",
}
