import type {QuoPayload} from "./types/quo.js";

/**
 * Make a request to Quo.
 *
 * Should not be used directly.
 */
export const make_request = async (target: string, payload: QuoPayload): Promise<void> => {
    try {
        const response = await fetch(target, {
            method : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body   : JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`[QUO] HTTP ${response.status} - is Quo running?`);
        }
    } catch (err) {
        console.error(`[QUO] error "${err}" - is Quo running?`);
    }
};
