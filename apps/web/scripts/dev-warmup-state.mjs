export function parsePort(argv) {
  const index = argv.indexOf("--port");
  if (index !== -1 && argv[index + 1]) {
    return parsePortValue(argv[index + 1]);
  }

  const assignment = argv.find((argument) => argument.startsWith("--port="));
  return assignment ? parsePortValue(assignment.split("=")[1]) : null;
}

export function classifyProbeStatus(status) {
  if (status === 0) return "starting";
  if (status === 200) return "ready";
  if (status >= 500) return "server-error";
  return "unexpected-response";
}

function parsePortValue(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : null;
}
