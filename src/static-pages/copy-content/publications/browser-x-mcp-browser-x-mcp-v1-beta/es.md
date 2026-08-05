Browser X MCP `1.0.0-beta.1` empaquetó el primer servidor público de navegador de esta línea. Usa Playwright para mantener una página Chromium y expone sus operaciones mediante un servidor MCP sobre stdio.

La superficie beta incluye inicio del navegador, navegación, extracción de virtual canvas estructurado, entrada de texto, scroll, listado de elementos, detalle de un objetivo, acciones atómicas y por lotes, capturas y evaluación en el contexto de la página. El virtual canvas deriva los elementos interactivos del DOM activo y asigna identificadores con coordenadas que consumen las acciones posteriores.

La versión del paquete, la dependencia de Playwright, las herramientas MCP registradas y sus handlers definen esta beta experimental. El repositorio no demuestra conformidad estricta con W3C, aislamiento de proceso respecto de una instancia separada ni una política de desactivar CDP. Esas propiedades no deben inferirse de la etiqueta de la versión.
