import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

let root = process.cwd();
let run = (command, args, cwd = root) => execFileSync(command, args, {
  cwd,
  stdio: 'inherit',
});
let remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
  cwd: root,
  encoding: 'utf8',
}).trim();
let revision = execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
  cwd: root,
  encoding: 'utf8',
}).trim();
process.env.CV_ASSET_VERSION = `${revision}-${Date.now()}`;
run('npm', ['run', 'build']);
let checkout = await fs.mkdtemp(path.join(os.tmpdir(), 'cv-pages-'));
try {
  run('git', ['init', '--initial-branch=gh-pages', checkout]);
  run('git', ['remote', 'add', 'origin', remote], checkout);
  let refs = execFileSync('git', ['ls-remote', '--heads', remote, 'gh-pages'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
  if (refs) {
    run('git', ['fetch', '--depth=1', 'origin', 'gh-pages'], checkout);
    run('git', ['checkout', '-B', 'gh-pages', 'FETCH_HEAD'], checkout);
    run('git', ['rm', '-r', '--ignore-unmatch', '.'], checkout);
  }
  await fs.cp(path.join(root, 'dist'), checkout, { recursive: true });
  await fs.writeFile(path.join(checkout, '.nojekyll'), '');
  run('git', ['add', '--all'], checkout);
  run('git', ['commit', '-m', `Publish local build ${process.env.CV_ASSET_VERSION}`], checkout);
  run('git', ['push', 'origin', 'HEAD:refs/heads/gh-pages'], checkout);
} finally {
  await fs.rm(checkout, { recursive: true, force: true });
}
