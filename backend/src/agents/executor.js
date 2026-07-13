import { NodeVM } from "vm2";

/**
 * Executes JavaScript extracted from the Coder agent's draft inside a
 * restricted VM (no filesystem, no network, no require, 2s timeout).
 * This is a demo-grade sandbox — for production, run untrusted code in an
 * isolated container/microVM instead of in-process.
 */
export function executeStep(code) {
  if (!code) {
    return { ran: false, output: null, error: null };
  }

  const logs = [];
  const vm = new NodeVM({
    console: "redirect",
    sandbox: {},
    require: false,
    timeout: 2000,
    eval: false,
    wasm: false,
  });

  vm.on("console.log", (...args) => logs.push(args.join(" ")));

  try {
    const result = vm.run(code, "executor-sandbox.js");
    return {
      ran: true,
      output: logs.join("\n") || (result !== undefined ? String(result) : "(no output)"),
      error: null,
    };
  } catch (err) {
    return { ran: true, output: logs.join("\n"), error: err.message };
  }
}
