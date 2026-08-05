Durante la inicialización de MCP, Agent Portal lee las raíces de workspace del cliente y registra cada una como proyecto en StateGraph. El proyecto se abre como pestaña del dashboard y queda disponible para el backend compartido por las ventanas del IDE conectadas.

StateGraph deduplica proyectos comparando la cadena de ruta almacenada. Registrar de nuevo la misma ruta actualiza el registro existente y la fecha de última apertura. La implementación actual no canonicaliza mediante `realpath`, no calcula un hash y no unifica variantes de mayúsculas. Por ello, un alias simbólico o una escritura distinta de la ruta puede producir otro registro.

El código implementado busca una coincidencia exacta y, si no existe, asigna un project ID aleatorio corto; StateGraph conserva el estado. La identidad del proyecto no se deriva de SHA-256 y el repositorio no registra un benchmark del tiempo de alta. La deduplicación depende de la identidad de ruta entregada por el cliente MCP.
