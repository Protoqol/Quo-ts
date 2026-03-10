import {describe, test} from "node:test";
import assert from "node:assert";
import {http, HttpResponse} from "msw";
import {setupServer} from "msw/node";
import {quo} from "./main.js";
import {type QuoPayload, QuoPayloadLanguage} from "./types/quo.js";

const server = setupServer();

describe("quo() function tests", () => {
    let capturedPayloads: QuoPayload[] = [];

    server.use(
        http.post("http://127.0.0.1:7312/payload", async ({request}) => {
            const body = await request.clone().text();
            const payload = JSON.parse(body);
            capturedPayloads.push(payload);
            return new HttpResponse(JSON.stringify({success: true}), {
                status : 200,
                headers: {"Content-Type": "application/json"},
            });
        }),
    );

    test.before(() => server.listen());

    test.afterEach(() => {
        capturedPayloads = [];
    });

    test.after(() => server.close());

    test("should send a single variable correctly", async () => {
        const x = 42;
        await quo(x);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 1);
        const p = capturedPayloads[0]!;
        assert.strictEqual(p.meta.variable.value, "42");
        assert.strictEqual(p.meta.variable.var_type, "number");
        assert.strictEqual(p.language, QuoPayloadLanguage.Typescript);
    });

    test("should send multiple variables correctly", async () => {
        const a = "hello";
        const b = true;
        await quo(a, b);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 2);
        assert.strictEqual(capturedPayloads[0]!.meta.variable.value, "hello");
        assert.strictEqual(capturedPayloads[1]!.meta.variable.value, "true");
    });

    test("should send expressions correctly", async () => {
        await quo(1 + 1);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 1);
        assert.strictEqual(capturedPayloads[0]!.meta.variable.value, "2");
    });

    test("should handle nested functions and commas correctly", async () => {
        const x = 10;
        await quo(Math.max(1, 2), x);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 2);
        assert.strictEqual(capturedPayloads[0]!.meta.variable.value, "2");
        assert.strictEqual(capturedPayloads[1]!.meta.variable.value, "10");
    });

    test("should identify constants (UPPER_SNAKE_CASE)", async () => {
        const MY_CONSTANT = "val";
        await quo(MY_CONSTANT);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 1);
        assert.strictEqual(capturedPayloads[0]!.meta.variable.value, "val");
        const p = capturedPayloads[0]!;
        assert.ok(p.meta.uid);
        assert.ok(p.meta.time_epoch_ms);
        assert.strictEqual(p.meta.origin, "@protoqol/quo-ts");
        assert.ok(p.meta.runtime);
    });

    test("should have correct package name in meta", async () => {
        let capturedPayload: any = null;

        const server = setupServer(
            http.post("http://127.0.0.1:7312/payload", async ({request}) => {
                capturedPayload = await request.json();
                return HttpResponse.json({success: true});
            }),
        );

        server.listen();

        const x = 10;
        await quo(x);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayload.meta.origin, "@protoqol/quo-ts");

        server.close();
    });
});
