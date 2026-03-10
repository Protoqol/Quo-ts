![Quo Preview](https://cms.protoqol.nl/assets/2ecc5f44-5fe5-4f15-95d6-ba365f4fcd5c)

![Build status](https://img.shields.io/github/actions/workflow/status/Protoqol/Quo-ts/test.yml?style=flat-square&color=%23ec135b&logo=typescript)
![npm version](https://img.shields.io/npm/v/@protoqol/quo-ts?style=flat-square&color=%23ec135b&logo=npm)
![GPL-3.0 license](https://img.shields.io/github/license/Protoqol/Quo-ts?style=flat-square&color=%23ea135a)

Quo is a cross-platform variable dumper designed to make debugging easier. It receives data from your application and
displays it in a clean desktop interface, allowing you to inspect complex values in real-time without cluttering your
terminal or browser console.

> **Note**: This package requires the [Quo desktop client](https://github.com/Protoqol/Quo) to be running to display the
> debug data.

### Noteworthy features

- **Environment-Aware**: Node and browser environments supported.
- **Multiple arguments**: Inspect multiple variables or expressions in a single call.
- **Expression Parsing**: Easy expression debugging e.g. `quo(1 + 1)` or `quo(Math.max(x, y))`.

### Installation

#### Node.js

Install via npm:

```bash
npm install @protoqol/quo-ts
```

Or yarn:

```bash
yarn add @protoqol/quo-ts
```

#### Browser / CDN

You can use `quo-ts` directly in the browser like so:

```html

<script type="text/javascript" src="https://unpkg.com/@protoqol/quo-ts@latest/target/main.js"></script>

<script type="module">
    import {quo} from 'https://esm.sh/@protoqol/quo-ts';

    // Also automatically attached to window.quo
    window.quo("Hello from the browser!");
</script>
```

### Usage

#### TypeScript / ESM (Node.js)

Import the `quo` function and pass variables to inspect. Note that `quo` is asynchronous.

```typescript
import {quo} from "@protoqol/quo-ts";

const user = {
    id      : 1,
    username: "jdoe",
};

async function main() {
    const userId = 42;

    // Dump a single variable
    await quo(userId);

    // Dump multiple variables at once
    await quo(userId, user);

    // Some quick maths
    await quo(42 * 42, Math.random());
}

main();
```

### Configuration

You can customise the Quo server address using environment variables in Node.js:

- `QUO_HOST`: The host where Quo is running (default: `http://127.0.0.1`).
- `QUO_PORT`: The port Quo is listening on (default: `7312`).

> The correct port can be found in the bottom left in the Quo client.

In browser environments, `quo-ts` defaults to `http://127.0.0.1:7312`.

---

## License

Quo is open-source software licensed under the [GPL-3 licence](.github/LICENSE).

