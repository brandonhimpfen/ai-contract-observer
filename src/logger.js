function writeLine(writer, line) {
  if (typeof writer === "function") {
    writer(line);
  }
}

export function createConsoleLogger(options = {}) {
  const {
    enabled = true,
    writer = console.log
  } = options;

  return {
    log(entry) {
      if (!enabled) {
        return;
      }

      const status = entry?.response?.status ?? "unknown";
      const task = entry?.request?.task ?? "unknown";
      const duration = entry?.durationMs ?? "n/a";

      writeLine(
        writer,
        `[ai-contract-observer] ${entry.id} status=${status} task=${task} durationMs=${duration}`
      );
    }
  };
}

export function createJsonLogger(options = {}) {
  const {
    writer = console.log,
    pretty = false
  } = options;

  return {
    log(entry) {
      const json = pretty
        ? JSON.stringify(entry, null, 2)
        : JSON.stringify(entry);

      writeLine(writer, json);
    }
  };
}
