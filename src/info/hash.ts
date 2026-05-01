import XXH from "xxhashjs";

export const get_hash = (var_type: string, name: string, origin: string): string => {
    let seed = 123456789;
    let to_hash = `${var_type}:${name}:${origin}`;

    return XXH.h64(to_hash, seed).toString(16);
};
