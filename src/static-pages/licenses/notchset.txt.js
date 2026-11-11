import fs from 'node:fs';

export default fs.readFileSync('docs/third-party-notices.md', 'utf8');
