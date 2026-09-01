Symbiote Node registra la transición con la que separé mi línea Symbiote de RND-PRO en proyectos dedicados. Symbiote UI asumió Web Components, temas, metadatos de proveedores, esquemas y contratos WebMCP. Symbiote Engine asumió la ejecución de grafos, los controladores, las utilidades de persistencia y los comandos de ejecución por CLI.

El paquete `symbiote-node` restante es una fachada final de migración. Sus puntos de entrada públicos delegan en los paquetes separados para que los consumidores existentes puedan trasladar sus importaciones por etapas. Las nuevas funciones de interfaz y ejecución se implementan directamente en Symbiote UI o Symbiote Engine.

Symbiote.js sigue siendo una dependencia externa y una referencia para esta línea de proyectos. Esta retrospectiva cubre el workspace de paquetes de RND-PRO, la división de responsabilidades y la superficie de migración.
