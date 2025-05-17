# trackify-resources

[![npm version][npm-badge]][npm-link] [![License: MIT][license-badge]][license-link]

---

## Table of Contents

* [Introduction](#introduction)
* [Features](#features)
* [Installation](#installation)
* [Basic Usage](#basic-usage)
* [API Reference](#api-reference)

    * [`createResourceMonitor(label?, options?)`](#createresourcemonitorglabel-options)
    * [`monitor()`](#monitor)
    * [`trackFunction(fn, label?)`](#trackfunctionfn-label)
    * [`monitorPageLoad()`](#monitorpageload)
    * [`getHistory()`](#gethistory)
* [Browser Usage](#browser-usage)
* [UMD Build](#umd-build)
* [Node.js Usage](#nodejs-usage)
* [React Example](#react-example)
* [Contributing](#contributing)
* [License](#license)

---

## Introduction

`trackify-resources` is a universal JavaScript/TypeScript module for measuring resource usage (CPU, memory, execution time) in both Node.js and browser environments. It provides:

* High-resolution timing using the Performance API or `process.hrtime`.
* CPU and memory snapshots in Node.js via `pidusage` (optional dependency).
* Page-load metrics in browsers.
* Simple wrappers to track arbitrary functions or promises.
* UMD, CommonJS, and ES module builds.

Ideal for profiling, performance monitoring, or building custom dashboards in any JS project.

## Features

* **Cross-platform**: Works in Node.js, modern browsers, and bundlers.
* **Flexible API**: Basic `monitor()` or rich `trackFunction()` wrappers.
* **Silent mode**: Suppress console output when needed.
* **UMD build**: Load via `<script>` tag and access global `ResourceMonitor`.
* **TypeScript support**: Includes `.d.ts` declarations for full type safety.

## Installation

Install from npm:

```bash
npm install trackify-resources
# or
yarn add trackify-resources
```

Optionally install `pidusage` for Node.js CPU/memory tracking:

```bash
npm install pidusage --save-optional
```

## Basic Usage

```ts
import { createResourceMonitor } from 'trackify-resources';

async function example() {
  // Create a monitor (label is optional)
  const monitor = createResourceMonitor('myTask');

  // Simple monitor since instantiation:
  await monitor.monitor();

  // Track an arbitrary async function:
  const { result, stats } = await monitor.trackFunction(
    async () => {
      await new Promise(res => setTimeout(res, 500));
      return 'done';
    },
    'delay500'
  );

  console.log('Function result:', result);
  console.log('Stats:', stats);

  // Retrieve full history:
  console.table(monitor.getHistory());
}

example();
```

## API Reference

### `createResourceMonitor(label?: string, options?: MonitorOptions): ResourceMonitor`

Creates a new `ResourceMonitor` instance.

* **`label`** (optional): Identifier applied to every measurement.
* **`options.silent`** (boolean): If `true`, suppresses console logs.

### `monitor(): Promise<MonitorResult>`

Measures resources (time, CPU, memory) from monitor instantiation to call.

Returns a `MonitorResult`:

```ts
interface MonitorResult {
  timestamp: string;   // ISO timestamp
  duration?: number;   // ms
  cpu?: number;        // % (Node only)
  memory?: number;     // MB
  label?: string;      // provided label
}
```

### `trackFunction<T>(fn: () => T | Promise<T>, label?: string): Promise<{ result: T; stats: MonitorResult }>`

Executes `fn`, waits for completion, then returns its result along with resource stats.

### `monitorPageLoad(): Promise<MonitorResult>`

Browser-only: waits for the `window.load` event and measures load time + heap usage.

### `getHistory(): MonitorResult[]`

Returns an array of all collected measurements.

## Browser Usage

Import the ES module in modern bundlers:

```js
import { createResourceMonitor } from 'trackify-resources';

const monitor = createResourceMonitor('pageLoad');
monitor.monitorPageLoad().then(stats => {
  console.log('Page loaded in', stats.duration, 'ms');
});
```

## UMD Build

Include via `<script>` (served from `dist/index.umd.js`):

```html
<script src="https://unpkg.com/trackify-resources/dist/index.umd.js"></script>
<script>
  const monitor = ResourceMonitor.createResourceMonitor('umdExample');
  monitor.trackFunction(() => {
    // your code
  }, 'myFn').then(({ stats }) => console.log(stats));
</script>
```

## Node.js Usage

```js
const { createResourceMonitor } = require('trackify-resources');

(async () => {
  const monitor = createResourceMonitor('nodeTask');
  await monitor.trackFunction(() => {
    // sync or async code
  }, 'syncTest');
  console.log(monitor.getHistory());
})();
```

## React Example

```tsx
import React, { useEffect } from 'react';
import { createResourceMonitor } from 'trackify-resources';

export function App() {
  useEffect(() => {
    const monitor = createResourceMonitor('AppMount', { silent: true });
    monitor.trackFunction(() => {
      // trigger a re-render or heavy work
    }, 'first-render').then(({ stats }) => {
      console.log('First render took', stats.duration, 'ms');
    });
  }, []);

  return <div>Your React App</div>;
}
```

## Contributing

Contributions, issues and feature requests are welcome! Feel free to:

* Open an issue on [GitHub][github-issues]
* Submit a pull request

[//]: # (Please read [CONTRIBUTING.md]&#40;CONTRIBUTING.md&#41; for details.)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

[npm-badge]: https://img.shields.io/npm/v/trackify-resources.svg

[npm-link]: https://www.npmjs.com/package/trackify-resources
[license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg
[license-link]: LICENSE
[github-issues]: https://github.com/your-username/trackify-resources/issues
