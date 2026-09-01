Project Graph MCP uses a vendored Acorn parser for JavaScript structure and quality checks. AST traversal identifies declarations, imports, exports, calls, and signatures that feed the project skeleton and focused analysis tools.

The parser is one stage in a larger pipeline. File walking selects the source set, language-specific parsers produce structural records, and the graph builder creates nodes plus dependency relationships. Separating these responsibilities lets the MCP layer query one graph for skeletons, focus zones, usages, and call paths.

Acorn also supports checks that need JavaScript syntax rather than text matching, including cyclomatic complexity, JSDoc consistency, similar-function structure, and parts of dead-code analysis. TypeScript uses its own structural parser in this package. The repository records no speed benchmark for this path; the defensible evidence is the parser dependency and the implemented analysis operations.
