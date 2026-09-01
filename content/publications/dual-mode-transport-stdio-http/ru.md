Agent Portal открывает один и тот же реестр инструментов (tool registry) через разные транспортные границы. IDE запускает точку входа MCP через stdio. Локальный прокси соединяет клиента с изолированным бэкендом (detached singleton backend) по WebSocket; там управляются дочерние серверы и общее состояние портала.

Субагенты могут подключаться к `/mcp` по Streamable HTTP. Handler поддерживает MCP initialization, session identifiers, `tools/list` и проверенные tool calls. Он использует динамический источник инструментов gateway, поэтому discovery и execution не поддерживают отдельные копии публичного registry.

Продукт реализован на Node.js, где публичный HTTP-путь вынесен в отдельный MCP handler. Переиспользуемый контракт находится на уровне сообщений и tool surface: transport adapters передают те же MCP-запросы во внутренний routing портала. Session lifecycle и доставка ответа остаются специфичными для каждого транспорта.
