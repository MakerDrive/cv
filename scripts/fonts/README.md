# Social card fonts

Build-time variable TTF assets from the Google Fonts repository:

- [Archivo](https://github.com/google/fonts/blob/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf)
- [Martian Mono](https://github.com/google/fonts/blob/main/ofl/martianmono/MartianMono%5Bwdth%2Cwght%5D.ttf)

The renderer converts glyphs to SVG paths through fontkit, so PNG typography
does not depend on system fonts. Weight and display width come from the site's
Notchset tokens. Browser typography continues using the WOFF2 assets.

Both fonts use SIL OFL 1.1. Copyright and licence notices are preserved in
[Archivo's notice](../../src/static-pages/copy-fonts/notchset/archivo-LICENSE.txt)
and [Martian Mono's notice](../../src/static-pages/copy-fonts/notchset/martian-mono-LICENSE.txt).
