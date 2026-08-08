import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classifyProbeStatus, parsePort } from "./dev-warmup-state.mjs";

describe("dev warmup state", () => {
  it("accepts only an exact HTTP 200 response as ready", () => {
    assert.equal(classifyProbeStatus(200), "ready");
    assert.equal(classifyProbeStatus(204), "unexpected-response");
    assert.equal(classifyProbeStatus(302), "unexpected-response");
    assert.equal(classifyProbeStatus(404), "unexpected-response");
    assert.equal(classifyProbeStatus(500), "server-error");
    assert.equal(classifyProbeStatus(0), "starting");
  });

  it("parses valid separated and assigned ports", () => {
    assert.equal(parsePort(["--port", "3137"]), 3137);
    assert.equal(parsePort(["--port=4173"]), 4173);
  });

  it("rejects invalid ports", () => {
    assert.equal(parsePort(["--port", "0"]), null);
    assert.equal(parsePort(["--port=70000"]), null);
    assert.equal(parsePort(["--port", "not-a-port"]), null);
  });
});
