Agent Portal поддерживает режимы standalone, client и master. Standalone node владеет локальными дочерними MCP-серверами. Client подключается к master по WebSocket и представляет свой локальный tool surface. Master объединяет локальных children и удалённые client nodes за одной границей портала.

На каждом host окна IDE подключаются по stdio proxies к detached singleton backend. Реализация входит в Node.js-репозиторий; отдельного Go gateway и зафиксированных гарантий concurrency в нём нет.

Smart gateway публикует только верхнеуровневые meta-tools. `discover_tools` ищет в индексе публичных tools, `call_tool` проверяет и маршрутизирует выбранный вызов, а `get_portal_status` сообщает состояние публичных серверов и внутреннего runtime. Agent Pool остаётся приватным execution layer чатов портала. В репозитории нет latency benchmark для этого пути маршрутизации. При разрыве WebSocket client сообщает об ошибке и запускает ограниченный reconnect.
