Agent Portal открывает один и тот же owned tool registry через разные transport boundaries. IDE запускает MCP entry point по stdio. Локальный proxy соединяет клиента с detached singleton backend через WebSocket; там управляются дочерние серверы и общее состояние портала.

Субагенты могут подключаться к `/mcp` по Streamable HTTP. Handler поддерживает MCP initialization, session identifiers, `tools/list` и проверенные tool calls. Он использует динамический источник инструментов gateway, поэтому discovery и execution не поддерживают отдельные копии публичного registry.

Продукт реализован на Node.js, а публичный HTTP-путь - отдельный MCP handler, а не Rust transport enum. Переиспользуемый контракт находится на уровне сообщений и tool surface: transport adapters передают те же MCP-запросы во внутренний routing портала. Session lifecycle и доставка ответа остаются специфичными для каждого транспорта.
