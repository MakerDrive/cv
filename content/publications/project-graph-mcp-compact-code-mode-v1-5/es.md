Compact Code Mode separa el código ejecutable de la documentación necesaria para reconstruirlo y revisarlo. Project Graph MCP puede compactar JavaScript conservando los identificadores y guardar los contratos estructurales y explicativos en archivos `.ctx` y `.ctx.md`.

El paquete expone operaciones para compactar o embellecer archivos, generar documentos de contexto, inyectar o retirar JSDoc, consultar el modo activo y validar el pipeline. La validación compara funciones exportadas y firmas con el contrato de contexto, e informa de entradas ausentes u obsoletas. La migración también revisa el estado del repositorio antes de reescribir un proyecto.

El modelo implementado combina código compacto, documentos externos, herramientas JSDoc bidireccionales y validación contra el AST. El type checking sigue como operación separada. El repositorio no registra un benchmark reproducible de tokens, CPU o runtime para este modo.
