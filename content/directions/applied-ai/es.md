## Qué problemas resuelve esta dirección

El trabajo aplicado de IA aquí no es un envoltorio de un modelo: es un contorno que decide dónde se ejecuta el cómputo, qué ejecutor recibe una tarea, qué datos pueden salir de la frontera y cómo se verifica el resultado. El mismo contorno decide cómo se delega el trabajo: a un agente en un servidor, a una sesión de navegador o a un teléfono conectado como herramienta.

Tareas típicas: una función de IA debe funcionar sin enviar documentos confidenciales fuera de una frontera controlada; varios ejecutores deben compartir una cola sin perder la propiedad; un navegador o dispositivo debe ser conducido por un agente sin inventar confirmaciones; un resultado se acepta solo cuando el entorno informa realmente de éxito.

## De dónde viene la experiencia

| Proyecto | Período | Qué demostró el proyecto |
| --- | --- | --- |
| [Agent Portal](../../projects/agent-portal/) | 2025–2026 | Grupos de recursos, enrutamiento de modelos y suscripciones, tablero kanban ejecutable y decisión humana en conflicto. |
| [Agent Pool MCP](../../projects/agent-pool-mcp/) | 2026 | Delegación entre agentes CLI con propiedad visible, traspasos y estado de ejecución estructurado. |
| [Project Graph MCP](../../projects/project-graph-mcp/) | 2026 | Inteligencia de código basada en grafos como herramienta para agentes. |
| [Symbiote Workspace](../../projects/symbiote-workspace/) | 2026 | Espacios de trabajo adaptables a la tarea, ensamblados desde configuraciones portátiles. |
| [Browser X MCP](../../projects/browser-x-mcp/) | 2025 | Evidencia de navegador y operaciones de UI controladas como herramienta de agente. |

Tengo más de 15 años de experiencia en desarrollo de software e I+D de ingeniería. Los proyectos que documentan mi trabajo con herramientas de IA y sistemas de agentes comienzan en 2025.

## Qué hago personalmente

Diseñé la regla de ubicación en Agent Portal: los modelos y las suscripciones se agrupan en grupos de recursos, de modo que cada etapa recibe un ejecutor con capacidades adecuadas y un límite disponible, y la elección entre ejecución local, capacidad de nube y contorno híbrido sigue a la tarea y no a un valor por defecto fijo.

También diseñé la ruta de delegación: una delegación inicia un worker CLI y devuelve de inmediato un identificador de tarea, mientras que la decisión de aceptación queda en el orquestador. La restricción es medible —el límite del grupo de recursos y el presupuesto de contexto comprimido—, así que «ejecutor más barato» no se convierte en silencio en «resultado sin verificar».

En el lado de los dispositivos construí el contorno que conecta ejecutores con recursos de ejecución: un escenario JSON verificado en un dispositivo Android conectado, una herramienta de navegador con evidencia estructurada y una aplicación nativa que maneja una mesa giratoria por la red local. Cada una registra el estado y se detiene en un punto seguro en lugar de adivinar.

## Cómo trabajo

- **Tres modos de despliegue, un solo proceso.** Un contorno se ejecuta en una máquina local, en infraestructura de nube o en una combinación híbrida; el paso de uno a otro es gradual y no cambia el modelo de tarea.
- **La ubicación es una decisión, no un valor por defecto.** Los modelos rápidos toman trabajo simple y exploratorio; los modelos fuertes toman decisiones complejas sobre contexto comprimido; deciden las reglas de la tarea, los requisitos de datos, el coste y la capacidad disponible.
- **Una frontera de datos implementada.** Para documentos confidenciales, el sistema define qué se queda dentro y qué puede enviarse a una API externa; la frontera exige implementación técnica y verificación, porque el esquema por sí solo no garantiza privacidad.
- **Delegación con propiedad visible.** Una asignación pasa por registro, recogida de contexto, selección de ejecutor, acción, verificación del resultado y reporte; el estado se conserva en cada etapa para que un fallo se pueda investigar y el trabajo pueda continuar tras una parada.
- **Roles, no cuentas compartidas.** Cada empleado digital puede tener sus propias cuentas, chats y operaciones permitidas; los roles deciden con qué datos y aplicaciones trabaja y qué decisiones pasa a una persona.
- **El motivo de parada es parte del contrato.** Cuando la interfaz cambió, la conexión se perdió o el resultado no se pudo verificar, el sistema registra el estado y el motivo de la parada.

## Resultados confirmados

- **Chat del portal:** creación y reanudación de chat mediante la pasarela MCP, enrutamiento de modelos y acceso a herramientas: implementado y verificado.
- **Tablero kanban ejecutable:** una columna ejecuta parte del proceso con sus propias acciones, roles y pool de agentes especializados; un conflicto devuelve la tarjeta a una decisión humana: implementado y verificado.
- **Escenario en Android:** un escenario JSON verificado ejecuta una ruta estable en un dispositivo de prueba conectado y registra el resultado; cuando cambia la estructura de la pantalla, la ejecución se detiene en un punto seguro y la revisión de escenario propuesta pasa a una persona: implementado y verificado.
- **PhotoPizza Remote:** una aplicación Android nativa maneja una mesa giratoria por la red Wi-Fi local y WebSocket —dirección, número de fotogramas, velocidad, pausa, retardo, inicio y parada del movimiento—: implementado y verificado.
- **Browser X MCP 1.0.0-beta.1:** un servidor MCP sobre Playwright con transporte stdio —arranque del navegador, navegación, extracción estructurada de página, entrada en formularios, scroll, inspección de elementos, acciones atómicas y por lotes, capturas y ejecución de código en el contexto de la página—: prototipo verificado.

## Implementado, prototipo y trabajo abierto

- **Implementado y verificado:** los cuatro contornos anteriores.
- **Prototipo verificado:** Browser X MCP 1.0.0-beta.1. Su versión beta declara los límites: el navegador vive en un proceso local, las acciones requieren una página activa y el repositorio no garantiza conformidad estricta con W3C, aislamiento de procesos entre instancias separadas del navegador ni una política de desactivación de CDP.
- **Dirección de desarrollo, sin implementación confirmada en el portafolio público:** un canal telefónico para llamar a un empleado digital y asignar trabajo por voz; ejecutar el agente en el propio smartphone (hoy el dispositivo es una herramienta conectada de un ejecutor de servidor); un pool de dispositivos compartido entre varios ejecutores; una voz personal por empleado. A nivel de persona, las voces están implementadas en los tours narrados de Symbiote UI: cada persona obtiene su propio canal `speechSynthesis` en un iframe oculto y el perfil guarda locale, voice, rate, pitch y volume; un timbre para un empleado digital concreto sigue siendo una tarea abierta y depende de los servicios en uso y de los derechos sobre las grabaciones originales.

## Conversar sobre una tarea

En el primer mensaje es más útil nombrar el proceso que hay que automatizar, los datos que no deben salir de la frontera, los ejecutores y dispositivos implicados y las reglas de confirmación que deben cumplirse. Respondo con el contorno de despliegue, el reparto de ejecutores y los puntos de verificación.

Contacto: [Telegram](https://t.me/text2code) · [LinkedIn](https://www.linkedin.com/in/v-matiasevich/) · [GitHub](https://github.com/MakerDrive).
