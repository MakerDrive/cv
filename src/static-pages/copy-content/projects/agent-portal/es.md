:::article-block workspace
:::article-block open-source
:::article-block process-diagram
:::article-block process-path
El producto responde a una pregunta práctica de I+D: cómo usar varios agentes de IA sin perder contexto, responsabilidad, verificación y control.

Combina memoria durable de proyecto, context engineering, RAG-style context retrieval, enrutamiento de modelos, tool use, orquestación de tareas y operaciones de navegador en un entorno de ingeniería auditable.

:::article-block configuration-label
:::article-block workspace-gallery
:::article-block kanban-board
:::article-block column-settings
:::article-block resource-groups
Un foco es la optimización de recursos para desarrollo con agentes: el tablero y los resource groups distribuyen trabajo entre agentes con distintos niveles de modelo. Las tareas simples o exploratorias pueden ir a modelos más baratos/rápidos, mientras los modelos más fuertes trabajan con contexto de proyecto ya destilado y toman decisiones donde importan más la calidad y el contexto amplio.

:::article-block human-decision
La línea actual de I+D es loop engineering para trabajo autónomo de software: guiar agentes de código a lo largo de todo el ciclo — tomar una tarea, trabajar en una rama aislada, demostrar que el trabajo está hecho, luego revisar y fusionar — con evals, guardrails, observability y control human-in-the-loop cuando el loop no puede continuar con seguridad.

Agent Portal se construye sobre un conjunto de servidores MCP de mi autoría, coordinados por un plano de control open-source (`mcp-agent-portal`). Este plano orquesta la ejecución de agentes (Agent Pool), inteligencia de código basada en grafos (Project Graph), y automatización de navegador y terminal, proporcionando un contrato limpio de tool-use/function-calling entre los agentes y el entorno del producto.

El vector de desarrollo orienta el proyecto de una aplicación monolítica hacia configuraciones portátiles (Workspace-as-Config). En la arquitectura objetivo, Agent Portal actúa como un host ligero (proporcionando chat, autenticación y enrutamiento de modelos), mientras que la interfaz y los flujos de trabajo son ensamblados dinámicamente por agentes mediante Symbiote Workspace.
