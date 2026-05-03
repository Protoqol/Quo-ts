![Quo Preview](https://cms.protoqol.nl/assets/2ecc5f44-5fe5-4f15-95d6-ba365f4fcd5c)

![Build](https://img.shields.io/github/actions/workflow/status/Protoqol/Quo-ts/build.yml?style=flat-square&color=%23ec135b&logo=typescript)
![npm version](https://img.shields.io/npm/v/@protoqol/quo-ts?style=flat-square&color=%23ec135b&logo=npm)
![Node Version](https://img.shields.io/node/v/@protoqol/quo-ts?style=flat-square&color=%23ec135b&logo=nodedotjs)
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

### Requirements

- **Node.js**: >= 20.0.0

### Installation

#### Node.js

Install via npm:

```bash
npm install -D @protoqol/quo-ts
```

Or yarn:

```bash
yarn add @protoqol/quo-ts -D
```

#### Browser / CDN

You can use `quo-ts` directly in the browser like so:

```html
<!-- Load the bundled version from CDN -->
<script type="module" src="https://unpkg.com/@protoqol/quo-ts@latest/target/quo.bundle.js"></script>

<script type="module">
    import {quo} from 'https://unpkg.com/@protoqol/quo-ts@latest/target/quo.bundle.js';

    // Also automatically attached to window.quo
    quo("Hello from the browser!");
</script>
```

In browser environments, you can configure the target host and port by setting them on the `window` object before
calling `quo`:

```javascript
window.QUO_HOST = 'http://127.0.0.1';
window.QUO_PORT = '7312';
```

> The correct port can be found in the bottom left in the Quo client. Do note that it is not recommended to change host.

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

## Dependency justification

| Package    | Used for                                                                                                                     |
|------------|------------------------------------------------------------------------------------------------------------------------------|
| `uuid`     | Generates unique UUIDv4 identifiers for each individual dump event, enabling the client to uniquely identify and track them. |
| `xxhashjs` | Creates non-cryptographic hashes for variable identification and comparison within the Quo client.                           |

---

## License

Quo is open-source software licensed under the [GPL-3 licence](LICENSE).
