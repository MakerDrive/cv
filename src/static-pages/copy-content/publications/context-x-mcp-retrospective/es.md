Context X MCP documenta un experimento temprano para preparar el contexto antes de ejecutar una tarea con agentes. El repositorio registró herramientas MCP sobre stdio para enriquecimiento de contexto, búsqueda de historial y evaluación de calidad. También definió un límite de coordinación para seleccionar el tema y orquestar herramientas.

Context X quedó como prototipo: el coordinator devolvía respuestas placeholder para el enriquecimiento y la búsqueda del historial, y la memoria vectorial no llegó a implementarse.

La misma pregunta continúa en el stack de Agent Portal. Team memory aporta una raíz de contenido configurada, skills globales y skills específicas de cada proyecto dentro de workspace. El resolver selecciona el contexto pertinente para la tarea y construye un paquete acotado antes de delegar.
