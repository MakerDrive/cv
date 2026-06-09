import fs from 'fs';
import { applyData } from 'jsda-kit/iso/applyData.js';
import { md } from 'jsda-kit/node/md.js';
import ICONS_LINK from '../icons/link.html.js';

const template = fs.readFileSync('./src/static-pages/page.tpl.html', 'utf8');
const importmap = getImportMap();

function getPackageVersion(packageName) {
  try {
    let packageJson = JSON.parse(
      fs.readFileSync(`./node_modules/${packageName}/package.json`, 'utf8')
    );
    return packageJson.version;
  } catch {
    return '';
  }
}

function getImportMap() {
  let symbioteVersion = getPackageVersion('@symbiotejs/symbiote');
  let symbioteUiVersion = getPackageVersion('symbiote-ui');
  let symbioteBaseUrl = `https://cdn.jsdelivr.net/npm/@symbiotejs/symbiote${symbioteVersion ? `@${symbioteVersion}` : ''}`;
  let symbioteUiBaseUrl = `https://cdn.jsdelivr.net/npm/symbiote-ui${symbioteUiVersion ? `@${symbioteUiVersion}` : ''}`;
  let imports = {
    '@symbiotejs/symbiote': `${symbioteBaseUrl}/core/index.js`,
    '@symbiotejs/symbiote/core': `${symbioteBaseUrl}/core/index.js`,
    '@symbiotejs/symbiote/': `${symbioteBaseUrl}/`,
    'symbiote-ui': `${symbioteUiBaseUrl}/index.js`,
    'symbiote-ui/core': `${symbioteUiBaseUrl}/core/index.js`,
    'symbiote-ui/layout': `${symbioteUiBaseUrl}/layout/index.js`,
    'symbiote-ui/manifest': `${symbioteUiBaseUrl}/manifest/index.js`,
    'symbiote-ui/ui': `${symbioteUiBaseUrl}/ui/index.js`,
    'symbiote-ui/webmcp': `${symbioteUiBaseUrl}/webmcp.js`,
    'symbiote-ui/': `${symbioteUiBaseUrl}/`,
  };

  return /*html*/ `
    <script type="importmap">${JSON.stringify({ imports }, undefined, 2)}</script>
  `.trim();
}

/**
 * @typedef {Object} PageData
 * @property {String} [IMPORTMAP]
 * @property {String} TITLE
 * @property {String} [BASE_PATH]
 * @property {String} [BODY_ATTRS]
 * @property {String} [CSS_PATH]
 * @property {String} [JS_PATH]
 * @property {String} HEADER_CONTENT
 * @property {String} [MD_URL]
 * @property {String} [CONTENT]
 * @property {String} [FOOTER_CONTENT]
 * @property {String} [SIDE_PANEL_ATTRS]
 * @property {String} [SIDE_PANEL_HTML]
 * @property {Object<string, string>} [SIDE_PANEL_DATA]
 */

/**
 *
 * @param {PageData} pageData
 * @returns
 */
export async function getPage(pageData) {

  return applyData(template, {
    IMPORTMAP: pageData.IMPORTMAP || importmap,
    ICONS_LINK,
    TITLE: pageData.TITLE,
    BODY_ATTRS: pageData.BODY_ATTRS || '',
    BASE_PATH: pageData.BASE_PATH || './',
    CSS_PATH: pageData.CSS_PATH || 'css/index.css',
    JS_PATH: pageData.JS_PATH || 'js/index.js',
    HEADER_CONTENT: pageData.HEADER_CONTENT,
    CONTENT: pageData.CONTENT || await md(pageData.MD_URL),
    FOOTER_CONTENT: pageData.FOOTER_CONTENT || `JSDA Template &copy; ${new Date().getFullYear()}`,
    SIDE_PANEL_ATTRS: pageData.SIDE_PANEL_ATTRS || '',
  });
};
