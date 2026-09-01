Symbiote Workspace exporta JSON portátil y vuelve a validarlo al importar. La exportación estricta rechaza objetos de permisos y campos de origen no portátiles. El saneamiento excluye autenticación, identidad del usuario, direcciones del servidor, datos de sesión, rutas locales y referencias absolutas a archivos.

El contrato de integración exportado enumera las importaciones, los componentes, los servicios, las ranuras de ejecución y las herramientas de persistencia requeridos. Los identificadores deben seguir las reglas de nombres portátiles. Un host compatible puede revisar estos requisitos antes de montar el espacio de trabajo.

Los paquetes de espacios de trabajo añaden un manifiesto de dependencias y recursos relativos, y aplican la misma validación de importación durante la inspección. Se rechazan URL, estado del host, estado del catálogo, credenciales y referencias al sistema de archivos local. Las comprobaciones de portabilidad y el artefacto compartido operan sobre JSON.
