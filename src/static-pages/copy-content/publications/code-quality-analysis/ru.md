Project Graph MCP открывает quality analysis через один MCP tool с отдельными actions. Реализованы проверки dead code, cyclomatic complexity, similar functions, large files, outdated patterns, отсутствующей документации, JSDoc consistency и сводного full analysis.

Часть checks использует AST из Acorn. Другие намеренно остаются heuristic. Проверка использования variables и imports опирается в том числе на regex evidence, а similarity сравнивает нормализованную структуру control flow. Full analysis объединяет per-file результаты и cross-file checks, сохраняя contributing findings видимыми рядом со сводной оценкой.

Feature использует структурные и syntax-aware эвристики на основе входящих рёбер графа для более гибкой оценки. Эти tools дают evidence для агента или reviewer, а compiler checks, tests и project linters остаются отдельными слоями верификации. Модуль не заявляет, что заменяет их.
