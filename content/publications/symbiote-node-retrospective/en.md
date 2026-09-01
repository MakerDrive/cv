Symbiote Node records the package transition that separated my RND-PRO Symbiote work into dedicated projects. Symbiote UI took ownership of Web Components, themes, provider metadata, schemas, and WebMCP contracts. Symbiote Engine took graph execution, handlers, persistence helpers, and CLI runtime commands.

The remaining `symbiote-node` package is a terminal migration facade. Its public entry points delegate to the split packages so existing consumers can move their imports in stages. New UI and runtime features belong directly in Symbiote UI or Symbiote Engine.

Symbiote.js is an external framework dependency and reference for this project line. The work described here covers the RND-PRO package workspace, the split, and the migration surface.
