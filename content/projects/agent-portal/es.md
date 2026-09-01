:::article-block workspace
El producto responde a una pregunta práctica de I+D: cómo usar varios agentes de IA sin perder contexto, responsabilidad, verificación y control.

:::article-block workspace-gallery
Combina memoria durable de proyecto, context engineering, RAG-style context retrieval, enrutamiento de modelos, tool use, orquestación de tareas y operaciones de navegador en un entorno de ingeniería auditable.

:::article-block kanban-board
En el centro hay un tablero kanban ejecutable.

:::article-block column-settings
Cada columna inicia una parte del proceso y puede tener sus propias acciones, roles y un pool de agentes especializados.

:::article-block open-source
Agent Portal se construye sobre un conjunto de servidores MCP de mi autoría, coordinados por un plano de control open-source (`mcp-agent-portal`). Este plano orquesta la ejecución de agentes (Agent Pool), inteligencia de código basada en grafos (Project Graph), y automatización de navegador y terminal, proporcionando un contrato limpio de tool-use/function-calling entre los agentes y el entorno del producto.

:::article-block process-path
Juntas, las columnas configuradas convierten el tablero en un proceso ejecutable.

:::article-block human-decision
Un conflicto devuelve la tarjeta a una decisión humana. El proceso incluye evals, guardrails, observability y control human-in-the-loop cuando el loop no puede continuar con seguridad.

:::article-block process-diagram
Para las tareas de código, el sistema crea una copia de trabajo y una rama aisladas. Un agente realiza el trabajo y otro revisa el resultado de forma independiente. La línea actual de I+D guía a los agentes por todo el ciclo de desarrollo: tomar una tarea, demostrar que el trabajo está hecho, revisar y fusionar.

:::article-block resource-groups
Los modelos y las suscripciones se combinan en resource groups, por lo que cada etapa recibe un ejecutor con las capacidades adecuadas y un límite disponible. Las tareas simples o exploratorias pueden ir a modelos más baratos/rápidos, mientras los modelos más fuertes trabajan con contexto de proyecto ya destilado y toman decisiones donde importan más la calidad y el contexto amplio.

:::article-block configuration-label
El vector de desarrollo orienta el proyecto de una aplicación monolítica hacia configuraciones portátiles (Workspace-as-Config). En la arquitectura objetivo, Agent Portal actúa como un host ligero (proporcionando chat, autenticación y enrutamiento de modelos), mientras que la interfaz y los flujos de trabajo son ensamblados dinámicamente por agentes mediante Symbiote Workspace.
