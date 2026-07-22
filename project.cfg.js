import { getDataFn, getRouteFn } from './src/dynamic-pages/node/handlers.js';

/** @type { JSDA_CFG } */
export default {
  dynamic: {
    port: 3000,
    routes: './src/dynamic-pages/routes/routes.js',
    cache: {
      inMemory: true,
      exclude: [
        '/dashboard/',
      ],
    },
    baseDir: './src/dynamic-pages/',
    getRouteFn,
    getDataFn,
  },
  static: {
    outputDir: './dist',
    sourceDir: './src/static-pages',
  },
  ssr: {
    enabled: true,
    imports: [
      './src/ui-components/universal/login-widget/logic.js',
      './src/ui-components/universal/side-panel/logic.js',
    ],
  },
  minify: {
    js: true,
    css: true,
    html: true,
    svg: true,
    exclude: [],
  },
  bundle: {
    js: true,
    css: true,
    exclude: [],
  },
  log: true,
  importmap: {
    packageList: [],
    polyfills: false,
    preload: false,
  },
  sitemap: {
    enabled: true,
    baseUrl: 'https://MakerDrive.github.io/cv/',
    exclude: [
      '/dashboard/',
      '/404/',
      '/login/',
    ],
  },
}
