export type QuoPayload = {
    meta: QuoPayloadMeta,
    language: QuoPayloadLanguage,
}

export type QuoPayloadVariable = {
    var_type: string,
    name: string,
    value: string,
    is_mutable: boolean,
    is_constant: boolean,
    is_expression: boolean,

    memory_address: string | null,
    grouping_hash: string | null,
}

export type QuoPayloadMeta = {
    id: string,
    uid: string,
    origin: string,
    sender_origin: string,
    time_epoch_ms: number,
    variable: QuoPayloadVariable,

    stack_trace: Array<string> | null,
    thread_info: string | null,
    runtime: string | null,
    cpu_usage: number | null,
    memory_usage: number | null,
    caller_function: string | null,
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
