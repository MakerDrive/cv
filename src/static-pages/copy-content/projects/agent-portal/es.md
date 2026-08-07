:::article-block workspace
El producto responde a una pregunta práctica de I+D: cómo usar varios agentes de IA sin perder contexto, responsabilidad, verificación y control.

Combina memoria durable de proyecto, context engineering, RAG-style context retrieval, enrutamiento de modelos, tool use, orquestación de tareas y operaciones de navegador en un entorno de ingeniería auditable.

Un foco es la optimización de recursos para desarrollo con agentes: el tablero y los resource groups distribuyen trabajo entre agentes con distintos niveles de modelo. Las tareas simples o exploratorias pueden ir a modelos más baratos/rápidos, mientras los modelos más fuertes trabajan con contexto de proyecto ya destilado y toman decisiones donde importan más la calidad y el contexto amplio.

La línea actual de I+D es loop engineering para trabajo autónomo de software: guiar agentes de código a lo largo de todo el ciclo — tomar una tarea, trabajar en una rama aislada, demostrar que el trabajo está hecho, luego revisar y fusionar — con evals, guardrails, observability y control human-in-the-loop cuando el loop no puede continuar con seguridad.

Agent Portal se construye sobre un conjunto de servidores MCP de mi autoría, cada uno usable por sí solo y compuesto en el producto: ejecución de agentes (Agent Pool), inteligencia de código basada en grafos y retrieval (Project Graph), y automatización de navegador, contexto y terminal.

El vector de desarrollo orienta el proyecto de una aplicación monolítica hacia configuraciones portátiles (Workspace-as-Config). En la arquitectura objetivo, Agent Portal actúa como un host ligero (proporcionando chat, autenticación y enrutamiento de modelos), mientras que la interfaz y los flujos de trabajo son ensamblados dinámicamente por agentes mediante Symbiote Workspace.
