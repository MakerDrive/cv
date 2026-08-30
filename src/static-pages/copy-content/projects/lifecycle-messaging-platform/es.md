Plataforma de producto confidencial desarrollada como un proyecto comercial grande de I+D. La descripción pública se mantiene en nivel de función, perfil de stack, límites arquitectónicos y alcance de entrega.

:::article-block product-scope
El trabajo pertenece a comunicaciones con consentimiento del cliente: lifecycle messaging, escenarios opt-in SMS, orquestación de campañas, segmentación de audiencias, dashboards analíticos, roles internos, control de contenido/flujo y operaciones de servidor/entrega alrededor de infraestructura con módems.

Perfil tecnológico:

:::article-block product-surfaces
- Superficies de producto: interfaces Web/PWA, paneles de administración, workflows por roles, vistas analíticas y automatización de campañas operativas.

:::article-block backend-runtime
- Backend/runtime: JavaScript/Node.js, servicios API, PostgreSQL, sincronización runtime por WebSocket, intake compatible con RabbitMQ y documentación Swagger/API.

:::article-block delivery-ops
Las instancias distribuidas gestionan pools de módems GSM mediante conexiones serialport/COM y comandos AT.

:::article-block tunnels
Los túneles SSH/WebSocket conectan el runtime del servidor con las instancias remotas de entrega.

:::article-block modem-pools
El runtime de módems gestiona operaciones de SMS inbox y USSD en los pools físicos.

:::article-block delivery-flow
Como los enlaces y los dispositivos pueden cambiar de estado, una cola, la ejecución repetible y la monitorización mantienen controlable el proceso de entrega. El despliegue PM2/nginx, las herramientas de data-flow y segmentación, las integraciones API y los workflows operativos repetibles respaldan esa ruta.

:::article-block digital-twin
Para realizar pruebas reproducibles sin acceso continuo a dispositivos físicos, creé un Digital Twin local con módems virtuales y escenarios de tráfico repetibles. Reflejaba el pool de módems GSM en ambas direcciones: el comportamiento de los dispositivos podía reproducirse localmente manteniendo el mismo flujo operativo para el runtime físico.

Los detalles de implementación quedan en categorías porque el proyecto es confidencial.

Mi contribución de I+D fue la forma de la plataforma: convertir requisitos de comunicación, audiencias, hardware-runtime y operaciones en arquitectura de producto, flujos de datos, ejecución del lado de módems, infraestructura de servidor, superficies de automatización, interfaces de administración y herramientas prácticas para procesos de negocio repetibles.
