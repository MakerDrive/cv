Project Graph MCP использует две границы cache. Project graph cache хранит время изменения исходников и может быть явно invalidated через MCP tool surface. При изменении релевантного файла текущий graph path перестраивает граф целиком, не применяя точечный patch ребра одного файла.

У full quality analysis есть более узкий incremental cache. Для каждого файла вычисляется content hash; при совпадении hash и analysis signature повторно используются сохранённые результаты complexity, undocumented symbols и JSDoc checks. Изменённые файлы парсятся заново. Cross-file checks, включая dead code и similar functions, пересчитываются, поскольку зависят от отношений за пределами одного файла.

Реализованный content hash принадлежит записям quality analysis, а graph cache остаётся полным snapshot. Graph nodes не используют SHA-256 identity, а обновления графа не являются incremental на cross-file уровне. Явное разделение не даёт принимать устаревшие cross-file выводы за свежий evidence.
