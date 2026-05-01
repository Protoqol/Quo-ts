export type QuoContext = {
    line: number,
    file: string,
    is_mutable: boolean,
    is_expression: boolean,
    package_name: string,
    shared_grouping_hash?: string | null,
}

export type QuoPayload = {
    meta: QuoPayloadMeta,
    language: QuoPayloadLanguage,
}

export type QuoPayloadVariable = {
    var_type: string,
    name: string | null,
    value: string,
    is_mutable: boolean,
    is_constant: boolean,
    is_expression: boolean,

    memory_address?: string | null,
    grouping_hash?: string | null,
}

export type QuoPayloadMeta = {
    id: number,
    uid: string,
    origin: string,
    sender_origin: string,
    time_epoch_ms: number,
    variable: QuoPayloadVariable,

    stack_trace?: Array<string> | null,
    thread_info?: string | null,
    runtime?: string | null,
    cpu_usage?: number | null,
    memory_usage?: number | null,
    caller_function?: string | null,
}

export enum QuoPayloadLanguage {
    Rust       = "rust",
    Php        = "php",
    Javascript = "javascript",
    Typescript = "typescript",
    Python     = "python",
    Ruby       = "ruby",
    Go         = "go",
    Unknown    = "unknown",
}
