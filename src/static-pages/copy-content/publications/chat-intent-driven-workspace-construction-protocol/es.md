Implementé la construcción de espacios de trabajo desde el chat como una secuencia explícita de planificación y validación. El constructor clasifica la petición, conserva el estado del cuestionario, selecciona módulos de proveedores, resuelve la disposición y los requisitos de ejecución, y produce una configuración portátil.

El artefacto describe vistas, paneles, acciones, conexiones, estado del tema, ranuras de ejecución y servicios requeridos del host. Symbiote UI aporta componentes detectables y contratos de disposición; Symbiote Engine aporta primitivas ejecutables de grafo. La autenticación, el enrutamiento de modelos, el almacenamiento y los permisos permanecen en el host.

Las herramientas de construcción pasan por el mismo registro de despacho para CLI y MCP. La configuración se valida antes del montaje y las mutaciones exigen la revisión base actual. La configuración aceptada es el artefacto intermedio que recibe el ensamblado del navegador.
