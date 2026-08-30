:::article-block intro
Capa de ejecución para I+D en multi-agent orchestration.

:::article-block execution-flow
Delega trabajo entre agentes CLI y mantiene visible la responsabilidad sobre las tareas.

:::article-block execution-runtime
La capa rastrea el estado de los procesos, gestiona handoffs y enruta sesiones de agente mediante una interfaz MCP compartida.

:::article-block work-branch
Desde el lado de la ejecución, el mismo patrón cubre workers en segundo plano, pipelines, transferencia de sesiones, políticas y grupos. Los workers más baratos/rápidos pueden hacer investigación, extracción de estructura e implementación rutinaria.

:::article-block review-branch
El consenso entre modelos, el feedback bounce-back, la validación y los checks tipo eval forman la vía de revisión.

:::article-block result
El objetivo práctico es invertir la atención de los modelos más fuertes en decisiones, mientras los workers más baratos/rápidos hacen investigación, extracción de estructura, implementación rutinaria, validación y checks tipo eval.
