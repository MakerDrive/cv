Project Graph MCP usa una copia vendorizada de Acorn para analizar la estructura de JavaScript y ejecutar controles de calidad. El recorrido del AST extrae declaraciones, imports, exports, llamadas y firmas que alimentan el skeleton del proyecto y las herramientas focalizadas.

El parser es una etapa de un pipeline mayor. El file walker selecciona los fuentes, los parsers de cada lenguaje producen registros estructurales y el graph builder crea nodos con relaciones de dependencia. Esta separación permite que la capa MCP consulte un solo grafo para skeletons, focus zones, usos y rutas de llamadas.

Acorn también permite controles que necesitan analizar la sintaxis de JavaScript en lugar de buscar coincidencias de texto: complejidad ciclomática, consistencia de JSDoc, estructura de funciones similares y partes del análisis de código sin uso. TypeScript usa un parser estructural propio.
