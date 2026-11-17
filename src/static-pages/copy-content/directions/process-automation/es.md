## Procesos que automatizo

Automatizo operaciones repetibles en navegadores, aplicaciones móviles y sistemas de servicios. Un proceso define cuándo empezar, qué hacer en cada etapa, cómo comprobar la respuesta del servicio y cómo recuperarse de fallos o reintentos.

## Ejemplos de proyectos

| Proyecto | Ejemplo |
![Lifecycle Messaging Platform](illustrations/lifecycle-messaging-platform.webp)

**[Lifecycle Messaging Platform](../../projects/lifecycle-messaging-platform/)** — Colas y ejecución de campañas mediante un runtime distribuido y módems GSM.

**[Browser X MCP](../../projects/browser-x-mcp/)** — Herramienta con Playwright para navegar, inspeccionar páginas y realizar acciones controladas.

![Mobile SMM Operations Platform](illustrations/mobile-smm-platform.webp)

**[Mobile SMM Operations Platform](../../projects/mobile-smm-platform/)** — Escenarios Android, colas, límites, deduplicación y registros de operaciones.

![Adaptive Maximo Workbench](illustrations/adaptive-maximo-workbench.webp)

**[Adaptive Maximo Workbench](../../projects/adaptive-maximo-workbench/)** — Demo de mantenimiento en modo de solo lectura, con las acciones disponibles según el estado actual.


## Mi contribución

Para Browser X MCP desarrollé un servidor MCP con Playwright que inicia el navegador, extrae la estructura de la página, ejecuta acciones individuales o por lotes y devuelve detalles de la operación. Es un prototipo inicial: funciona en un proceso local y requiere una página activa.

Para Android preparé escenarios JSON que comprueban una interfaz de prueba y se detienen cuando cambia su estructura. En el caso Mobile SMM, la plataforma gestiona perfiles, calendarios, colas y límites. La demo pública termina con un borrador local y un destino de prueba, sin enviar contenido al exterior.

En Lifecycle Messaging Platform diseñé colas y ejecución repetible alrededor del runtime de módems. El estado de las operaciones y la deduplicación ayudan a controlar las acciones repetidas.

## Cómo se verifica

Antes de empezar, el proceso comprueba las condiciones y si la operación está permitida. En cada etapa registra el estado y comprueba la respuesta del servicio. Si se pierde la conexión o cambia la interfaz, la ejecución se detiene; un reintento tiene en cuenta el resultado registrado. Un clic del agente no sustituye una confirmación que requiera el servicio o una persona.

La demo pública de Adaptive Maximo Workbench es de solo lectura. La integración de producción con Maximo corresponde a la aplicación host.

## Conversar sobre una tarea

Describe los pasos del proceso, los servicios que utiliza y qué debe considerarse un resultado completo. Puedo ayudar a definir las comprobaciones y las reglas de recuperación.

Contacto: [Telegram](https://t.me/text2code) · [LinkedIn](https://www.linkedin.com/in/v-matiasevich/) · [GitHub](https://github.com/MakerDrive).
