Project Graph MCP is the code-intelligence layer I separated into a standalone stdio MCP server and npm package. It builds a project skeleton from source structure and exposes focused operations for dependencies, usages, documentation, compact code, and quality analysis.

JavaScript analysis uses a vendored Acorn parser. TypeScript, Python, and Go have dedicated structural parsers, with regex-based paths where a complete AST is unavailable. The graph model separates parsing from graph construction, which lets the same structural data support MCP tools and the Agent Portal explorer.

Compact mode preserves identifiers while reducing formatting, and `.ctx` files hold documentation contracts that can be validated against source signatures or injected as JSDoc. The package also provides code skeletons and focus-zone loading. These paths are implemented in JavaScript; the repository contains no equivalent Python or SWC pipeline and records no benchmark for a compression outcome.
