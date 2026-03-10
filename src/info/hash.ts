import XXH from "xxhashjs";
import type {QuoPayload} from "../types/quo.js";

export const get_hash = (dump: QuoPayload): string => {
    let seed = 123456789;
    let to_hash = `${dump.meta.variable.var_type}, ${dump.meta.variable.name}, ${dump.meta.origin}`;
    const HASHED = XXH.h64(to_hash, seed).toString(16).toUpperCase();

    return `0x${HASHED}`;
};
