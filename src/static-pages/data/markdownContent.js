import fs from 'node:fs';
import path from 'node:path';

import { normalizePortfolioMarkdownBody } from '../js/portfolioMarkdownContent.js';

const contentSourceDir = path.resolve('src/static-pages/copy-content');

export function loadPortfolioMarkdownContent(contentPath) {
  const relativePath = String(contentPath || '')
    .replace(/^\/+/, '')
    .replace(/^content\//, '');
  if (!relativePath || relativePath.startsWith('..')) {
    throw new TypeError('A valid portfolio content path is required');
  }
  return normalizePortfolioMarkdownBody(
    fs.readFileSync(path.join(contentSourceDir, relativePath), 'utf8'),
  );
}
