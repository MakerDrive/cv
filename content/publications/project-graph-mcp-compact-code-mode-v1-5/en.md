Compact Code Mode separates executable source from the documentation needed to reconstruct and review it. Project Graph MCP can compact JavaScript while preserving identifiers, then keep structural and explanatory contracts in `.ctx` and `.ctx.md` files.

The package exposes operations to compact or beautify files, generate context documents, inject or strip JSDoc, inspect the active mode, and validate the pipeline. Validation compares exported functions and signatures with the context contract and reports missing or stale entries. Migration also checks the repository state before rewriting a project.

The implemented model combines compact source, external context documents, bidirectional JSDoc tooling, and contract checks against the AST. Static type checking remains a separate operation. The repository does not record a reproducible token, processor, or runtime benchmark for this mode.
