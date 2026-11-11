# Third-party notices

## Beautiful UI / Notchset

The CV theme adapts the free Notchset theme palette, foundation, and control styles
from Beautiful UI by Chimpy. The original colours, Archivo/Martian Mono font choices and catalog Inter text,
button plate, focus corners, link rules, and motion timing are adapted to the
Symbiote Cascade theme API and the CV's existing controls.
The content-heading scramble adapts the free `lib/instrument.tsx` implementation
included in the Text Reveal registry, retaining accessible original text and
adding native lifecycle and reduced-motion handling.

Sources retrieved 2026-11-02:

- https://beautiful-ui.dev/r/notchset.json
- https://beautiful-ui.dev/r/notchset-foundation.json
- https://beautiful-ui.dev/r/button.json
- https://beautiful-ui.dev/r/input.json
- https://beautiful-ui.dev/r/segmented-control.json
- https://beautiful-ui.dev/r/text-reveal.json
- https://beautiful-ui.dev/components
- https://beautiful-ui.dev/license

Free Items are distributed under the MIT License.

Copyright (c) 2026 Chimpy / Beautiful UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Fonts

Social cards use build-time Archivo and Martian Mono variable TTF assets from
the Google Fonts repository, stored in `scripts/fonts/`. These are the same
font families under SIL OFL 1.1; source links and original licence references
are in `scripts/fonts/README.md`. Fontkit converts their glyphs into SVG paths
before PNG rendering, without substituting system fonts.

Archivo Variable and Martian Mono Variable are self-hosted from the Fontsource
5.3.0 packages. Both use the SIL Open Font License 1.1. Their original copyright
and license texts are preserved beside the font assets:

- `src/static-pages/copy-fonts/notchset/archivo-LICENSE.txt`
- `src/static-pages/copy-fonts/notchset/martian-mono-LICENSE.txt`

Inter Variable is self-hosted from `@fontsource-variable/inter` 5.2.8 under
the SIL Open Font License 1.1. Its original notice is preserved in
`src/static-pages/copy-fonts/notchset/inter-LICENSE.txt`.

Noto Sans is self-hosted from the Google Fonts repository as a Cyrillic-only
display subset (variable weight 100–900, width 62.5–100%), so Russian headings
keep the condensed Archivo proportions; Latin display text stays in Archivo. It
uses the SIL Open Font License 1.1, with its original notice preserved in
`src/static-pages/copy-fonts/notchset/noto-sans-LICENSE.txt`.
