# ai-contract-observer

A lightweight observability layer for AI systems.

This project solves a common problem in AI applications: even when requests and responses are structured, teams still struggle to understand what actually happened during a model interaction. Inputs are hard to trace, failures are difficult to diagnose, and system behavior becomes harder to improve over time.

`ai-contract-observer` provides a small, practical logging and summary layer for AI interactions. It is designed to work especially well with `ai-contract-kit` but it can also be used with any structured request and response objects.

It can be used as both a reference implementation and a lightweight standard for observing AI interactions.

## Why this project exists

Most AI systems are still hard to inspect.

- One request succeeds but no one knows why.
- Another fails and the error is only visible in application logs.
- A third returns an uncertain output, but the system records it as a generic success.
- A fourth performs poorly over time, but there is no consistent way to measure behavior across runs.

The result is weak traceability, poor debugging, and limited operational visibility.

This package defines a simple observation layer that sits around the model interaction boundary.

## Mental model

Think of the package as a small observability boundary:

`App -> Request Contract -> Model -> Response Contract -> Observation Layer`

The observer sits beside the application flow and records what happened in a consistent format.

This does not replace model SDKs, tracing platforms, or application logging.

It standardizes how AI interactions are logged, summarized, and inspected.

## What is included

- Observer instance for recording AI interactions.
- Normalized event entries with IDs, timestamps, and durations.
- Console logger for development visibility.
- JSON logger for machine-readable output.
- Summary helpers for status counts and success rates.
- Example usage demonstrating real-world integration.
- Test coverage for core observer behavior.

## Install

```bash
npm install ai-contract-observer
```

## Example

```js
import { createObserver } from "ai-contract-observer";

const observer = createObserver();

const request = {
  version: "1.0",
  task: "summarization",
  prompt: "Summarize this text in 3 sentences."
};

const response = {
  version: "1.0",
  status: "success",
  output: {
    text: "This is the summary."
  },
  meta: {
    model: "example-model-v1"
  }
};

observer.observe({
  request,
  response,
  durationMs: 842
});

console.log(observer.getSummary());
```

## Event structure

An observation entry looks like this:

```json
{
  "id": "obs_000001",
  "timestamp": "2026-03-22T00:00:00.000Z",
  "durationMs": 842,
  "request": {
    "version": "1.0",
    "task": "summarization",
    "prompt": "Summarize this text in 3 sentences."
  },
  "response": {
    "version": "1.0",
    "status": "success",
    "output": {
      "text": "This is the summary."
    },
    "meta": {
      "model": "example-model-v1"
    }
  }
}
```

## Status summary

The observer tracks the following response statuses:

- `success`
- `uncertain`
- `refusal`
- `error`
- `unknown`

This makes it easier to distinguish between valid results, low-confidence outputs, refusals, system errors, and malformed responses.

## Quick wrapper example

```js
import { createObserver } from "ai-contract-observer";

async function runModel(modelClient, request) {
  const observer = createObserver();

  const start = Date.now();

  try {
    const raw = await modelClient.generate(request);

    const response = {
      version: "1.0",
      status: raw?.status ?? "unknown",
      output: {
        text: raw?.text ?? null,
        structured: raw?.structured ?? null
      },
      meta: {
        model: raw?.model ?? "unknown"
      }
    };

    const entry = observer.observe({
      request,
      response,
      durationMs: Date.now() - start
    });

    return { response, entry };
  } catch (error) {
    const response = {
      version: "1.0",
      status: "error",
      output: {
        text: null,
        structured: null
      },
      issues: [
        {
          type: "exception",
          message: error instanceof Error ? error.message : "Unknown error"
        }
      ],
      meta: {
        model: "unknown"
      }
    };

    const entry = observer.observe({
      request,
      response,
      durationMs: Date.now() - start
    });

    return { response, entry };
  }
}
```

## API

### `createObserver(options?)`

Creates a new observer instance.

Supported options:

- `logger`: an object with a `log(entry)` function.
- `idPrefix`: string prefix for generated observation IDs.
- `startSequence`: starting integer for generated IDs.

### `observer.observe({ request, response, durationMs, timestamp? })`

Records a single AI interaction and returns the normalized observation entry.

### `observer.getEntries()`

Returns a copy of all recorded entries.

### `observer.getSummary()`

Returns aggregate counts and derived metrics across recorded entries.

### `observer.clear()`

Removes all stored entries from the current observer instance.

## Design Principles

This project is intentionally minimal.

It defines a small, explicit observability layer rather than a full telemetry platform. The goal is to provide a stable and understandable boundary for recording AI interactions without introducing unnecessary complexity.

The design emphasizes:

- Simplicity over abstraction
- Explicit event structure over implicit logging
- Reliability over feature sprawl
- Composability over completeness

This allows the observer to work across different models, tools, and systems while remaining easy to adopt.

## Non-Goals

This project does not attempt to:

- Replace model SDKs or providers.
- Replace full observability platforms.
- Provide dashboards or hosted telemetry infrastructure.
- Enforce a specific prompt strategy or orchestration framework.

It focuses only on defining a consistent observation layer for AI interactions.

## Roadmap

This project is designed as a foundation for more observable AI systems. Future extensions may include:

- File persistence adapters.
- Streaming event hooks.
- OpenTelemetry-compatible emitters.
- Dashboard and reporting utilities.
- Evaluation pipeline integration.
- Trace correlation across multi-step AI workflows.

## License

MIT
