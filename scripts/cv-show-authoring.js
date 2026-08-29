import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { startCvShowAuthoringHost } from './cv-show-authoring-host.js';
import { materializeCvShowAuthoringDraft } from './cv-show-authoring-materializer.js';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), '..');

function fail(message) {
  throw Object.assign(new Error(message), { code: 'CV_SHOW_AUTHORING_CLI_INVALID' });
}

function parseOptions(args, allowed) {
  let options = {};
  for (let index = 0; index < args.length; index += 2) {
    let name = args[index];
    let value = args[index + 1];
    if (!allowed.has(name) || value === undefined || Object.hasOwn(options, name)) {
      fail('CV Show authoring command options are invalid');
    }
    options[name] = value;
  }
  return options;
}

async function serve(args, reporter) {
  let options = parseOptions(args, new Set(['--port']));
  let port = options['--port'] === undefined ? 4173 : Number(options['--port']);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    fail('CV Show authoring --port must be an integer from 0 to 65535');
  }
  let host = await startCvShowAuthoringHost({ repoRoot: REPO_ROOT, port });
  reporter(JSON.stringify({
    schemaVersion: 'cv-show-authoring-host-started-v1',
    status: 'listening',
    origin: host.origin,
    sessionId: host.sessionId,
  }));
  await new Promise((resolve) => {
    let close = async () => {
      process.off('SIGINT', close);
      process.off('SIGTERM', close);
      await host.close();
      resolve();
    };
    process.once('SIGINT', close);
    process.once('SIGTERM', close);
  });
}

async function materialize(args, reporter) {
  let options = parseOptions(args, new Set([
    '--session-id',
    '--draft-hash',
    '--expected-source-revision',
    '--expected-source-hash',
    '--expected-source-sha256',
  ]));
  let required = [
    '--session-id',
    '--draft-hash',
    '--expected-source-revision',
    '--expected-source-hash',
    '--expected-source-sha256',
  ];
  if (required.some((name) => !Object.hasOwn(options, name))) {
    fail('CV Show materialization requires the exact session, draft, and source base options');
  }
  let expectedSourceRevision = Number(options['--expected-source-revision']);
  let receipt = await materializeCvShowAuthoringDraft({
    repoRoot: REPO_ROOT,
    sessionId: options['--session-id'],
    draftHash: options['--draft-hash'],
    expectedSourceRevision,
    expectedSourceHash: options['--expected-source-hash'],
    expectedSourceSha256: options['--expected-source-sha256'],
  });
  reporter(JSON.stringify(receipt));
}

export async function runCvShowAuthoringCli(
  args = process.argv.slice(2),
  { reporter = (message) => process.stdout.write(`${message}\n`) } = {},
) {
  let [command, ...rest] = args;
  if (command === 'serve') return serve(rest, reporter);
  if (command === 'materialize') return materialize(rest, reporter);
  fail('CV Show authoring command must be serve or materialize');
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  runCvShowAuthoringCli().catch((error) => {
    let code = typeof error?.code === 'string'
      ? error.code
      : 'CV_SHOW_AUTHORING_CLI_FAILED';
    process.stderr.write(`${JSON.stringify({ status: 'error', code })}\n`);
    process.exitCode = 1;
  });
}
