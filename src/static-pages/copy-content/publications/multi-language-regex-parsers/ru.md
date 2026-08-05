Project Graph MCP содержит отдельные структурные parsers для TypeScript, Python и Go, когда JavaScript-путь на Acorn неприменим. Они извлекают declarations и dependency signals, необходимые общей модели графа.

Общая language utility маскирует комментарии и содержимое строк, сохраняя позиции символов и переводы строк. Поэтому regex matches могут указывать координаты относительно исходного файла. Python parser учитывает hash comments, triple-quoted strings, indentation, imports, classes и functions. Go parser отображает structs и interfaces в общие class-like records графа.

Это структурный анализ с документированными heuristic limits, без претензии на полную compiler semantics. Публичный language set включает JavaScript, TypeScript, Python и Go. Пакет не заявляет поддержку Rust и не предоставляет отдельный parser config object.
