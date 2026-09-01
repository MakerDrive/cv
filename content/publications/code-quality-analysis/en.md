Project Graph MCP exposes quality analysis through one MCP tool with focused actions. The implemented checks cover dead code, cyclomatic complexity, similar functions, large files, outdated patterns, missing documentation, JSDoc consistency, and a combined analysis summary.

Several checks use AST data from Acorn. Others are deliberately heuristic. Dead-variable and import usage includes regex-based evidence rather than complete scope tracking, and similarity compares normalized control-flow structure. Full analysis combines per-file results with cross-file checks and reports the contributing findings instead of hiding them behind one score.

The feature combines incoming graph edges with syntax-aware and structural heuristics; it is not a single fixed line threshold. These tools provide codebase evidence for an agent or reviewer, while compiler checks, tests, and project linters remain separate verification layers. The module does not claim to replace them.
