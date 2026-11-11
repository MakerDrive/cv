# CV theme adaptation

The CV owns the Notchset skin. Symbiote UI and Workspace continue to own the
components, layout, canvas renderer, chat lifecycle, and presentation transport.
The adapter uses the public Cascade override API. Each build has a shared UUID
in its HTML metadata and asset URLs. Before theme controls load, a changed UUID
clears only the active saved Cascade parameters and geometry register. Named
presets, locale and layout state remain intact. Subsequent edits persist across
reloads and navigation within that build. Reset to defaults also restores the
source-derived appearance manually.

## Control state

The header Appearance action shows an icon with an accessible name. The quick
widget and full editor share the same target and storage scope; changes propagate
between them without reapplying stale values. Mode changes preserve other edited
parameters. Reset loads the CV preset without resetting panel sizes or media.

The editor exposes 21 numeric controls: brightness, contrast, hue, chroma, accent
chroma, accent lightness, background lightness, surface lightness, pattern,
motion, density, radius, frame radius, frame gap, type, heading, outline,
cell radius, tab radius, composer radius, and scroll shadow. Explicit lightness uses the absolute
0–100 range; Auto retains the source palette. Global chroma also affects the
accent when accent chroma is Auto. Primary ink remains neutral.

Heading-to-body balance multiplies the global type scale. Frame radius is
independent of the general radius. Geometry registers survive
unrelated theme edits; directly editing Density or Radius returns the register
to Default so the explicit value takes effect. Mode, variant, tab shape and
register controls use the provider state contract. Edits persist across route
navigation and reloads within the current build.

## Component mapping

| CV surface | Reference and adaptation |
| --- | --- |
| Layout, tabs, panel menus and navigation | Notchset foundation: flat ink frames, neutral hover surfaces, inverse active controls, corner marks, and tracked metadata. |
| Canvas nodes, ports and connections | Shared ink frames and orange selection/connection accents; existing SVG shapes, circular directory nodes and port hit areas retain their meaning. |
| Canvas toolbar and context menus | Common framed surfaces, square controls, restrained arrival transitions and semantic Cascade colours. |
| Chat messages, action/tool/status cards and composer | Chat App, Assistant Panel and Agent Run: reading text in Inter, metadata in Martian Mono, framed neutral cards, ink primary actions and short row arrival. Error/success semantics remain intact. |
| Show player | Agent Run, Audio Player, Stepper and Progress: ruled current row, flat transport controls, mono timing metadata, readable captions and a moving current-state marker only during playback. A dedicated header action moves the player between chat and panel layout through the public `requestLayoutPlacement()` API. |
| Theme controls and dialogs | Shared field, button and segmented-control styles, including focus, selected and disabled states; native share/import behavior remains authoritative. |
| Markdown, media and Pulse cards | Archivo display headings, Inter reading text, mono labels, ruled tables and flat framed media/card surfaces. |

These references supply visual and motion conventions. Existing application
controls retain their behavior and composition rather than importing React
components or introducing a second theme system.
The CV uses `panels=false` for the structured canvas, so native search,
breadcrumb, minimap and inspector remain disabled. Shared styling also covers
their surfaces if a consumer later enables them; this theme does not expose
additional graph editing controls.

## Motion and accessibility

Message arrival uses a 260ms fade with a small vertical displacement; popovers
use 180ms with the source settling curve. Cascade's Motion control scales these
durations. Content headings use the free instrument scramble from Text Reveal
once when mounted, while preserving their original accessible text. It finishes
immediately when hidden, disconnected, reduced motion is requested, or Motion
is zero; cleanup removes observers, listeners and animation frames.

The existing cellular chat background uses ink-coloured dots and Pattern-scaled
alpha so it remains visible on the light surface. Motion=0 stops its native
renderer; re-enabling motion restores the current chat phase through the public
workspace API. The renderer retains ownership of OS reduced-motion behavior.

The import dialog keeps the provider's protected preview and rollback contract.
Its consumer skin uses source palette tokens below that protected boundary,
including the flat frame, readable text, neutral actions and Archivo title.
The native preview still demonstrates the imported Cascade parameters; cancelling
restores the previous theme. Embedded third-party media retains its own controls.
On narrow screens the 56px header and workspace height use the same geometry,
so the Show transport and composer remain within the viewport.

## Ownership

- `src/static-pages/css/notchset*.css.js`: source palette, self-hosted fonts,
  component styles and CSS motion.
- `src/static-pages/js/notchset-theme/`: Cascade aliases, portal propagation,
  chat motion bridge and heading animation lifecycle.
- `src/static-pages/data/portfolioThemeDefaults.js`: consumer presets.
- `scripts/social-card-template.js`, `social-card-theme.js` and
  `social-card-typography.js`: shared 1200×630 social cards, source-derived
  palette and type axes, and local glyph-path rendering. Generated image URLs
  include a content hash so cached metadata follows newly rendered cards.

See [third-party notices](third-party-notices.md) for source attribution and
font licences. All builds and verification run locally.
