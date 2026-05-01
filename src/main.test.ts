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

    test("should format objects as JSON", async () => {
        const obj = {a: 1, b: "test"};
        await quo(obj);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 1);
        const p = capturedPayloads[0]!;
        // Expected: {"a":1,"b":"test"}
        assert.strictEqual(p.meta.variable.value, "{\"a\":1,\"b\":\"test\"}");
    });

    test("should use argument index as id", async () => {
        await quo(1, 2, 3);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 3);
        assert.strictEqual(capturedPayloads[0]!.meta.id, 0);
        assert.strictEqual(capturedPayloads[1]!.meta.id, 1);
        assert.strictEqual(capturedPayloads[2]!.meta.id, 2);
    });

    test("should format array types with element types", async () => {
        await quo([1, "two", true]);

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 1);
        assert.strictEqual(capturedPayloads[0]!.meta.variable.var_type, "Array<number | string | boolean>");
    });

    test("should use TypeScript types for null and classes", async () => {
        class MyClass {
        }

        await quo(null, new MyClass(), new Date());

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 3);
        assert.strictEqual(capturedPayloads[0]!.meta.variable.var_type, "null");
        assert.strictEqual(capturedPayloads[1]!.meta.variable.var_type, "MyClass");
        assert.strictEqual(capturedPayloads[2]!.meta.variable.var_type, "Date");
    });

    test("should handle multi-line calls and complex expressions", async () => {
        await quo(
            1 + 1,
            {
                a: 1,
            },
        );

        await new Promise(resolve => setTimeout(resolve, 100));

        assert.strictEqual(capturedPayloads.length, 2);
        assert.strictEqual(capturedPayloads[0]!.meta.variable.name, "1 + 1");
        assert.strictEqual(capturedPayloads[1]!.meta.variable.name, "JSON");
    });
});
