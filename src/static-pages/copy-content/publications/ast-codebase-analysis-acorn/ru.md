Project Graph MCP использует vendored-парсер Acorn для структурного анализа JavaScript и проверок качества. Обход AST извлекает declarations, imports, exports, calls и signatures, которые затем входят в project skeleton и сфокусированные analysis tools.

Parser - один этап общего pipeline. File walker определяет набор исходников, language-specific parsers формируют структурные записи, а graph builder создаёт nodes и dependency relationships. Разделение ответственностей даёт MCP-слою один граф для skeleton, focus zones, usages и call paths.

Acorn также используется в проверках, основанных на структурном разборе JavaScript (JavaScript syntax): cyclomatic complexity, JSDoc consistency, structural comparison похожих функций и часть dead-code analysis. TypeScript в этом пакете обрабатывается отдельным структурным parser. В репозитории нет speed benchmark для этого пути; проверяемое evidence находится в parser dependency и реализованных analysis operations.
