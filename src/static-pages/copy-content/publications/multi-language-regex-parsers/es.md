Project Graph MCP incluye parsers estructurales específicos para TypeScript, Python y Go cuando la ruta JavaScript basada en Acorn no es aplicable. Extraen las declaraciones y señales de dependencia necesarias para el modelo común del grafo.

La utilidad compartida oculta comentarios y contenido de cadenas, conservando las posiciones y los saltos de línea. Así, las coincidencias pueden informar ubicaciones respecto del archivo original. El parser de Python contempla comentarios con almohadilla, cadenas triples, indentación, imports, clases y funciones. El de Go representa structs e interfaces mediante los registros genéricos similares a clases del grafo.

Es un análisis estructural con límites heurísticos documentados, no una reproducción completa de la semántica de un compilador. El conjunto público incluye JavaScript, TypeScript, Python y Go. El paquete no anuncia soporte para Rust ni expone un objeto separado de configuración de parsers.
