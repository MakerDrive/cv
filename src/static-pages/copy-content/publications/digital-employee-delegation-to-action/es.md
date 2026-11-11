## Qué es un empleado digital

Un empleado digital es un ejecutor con su propio contorno de encargos: un rol, una tarea, herramientas, estado del trabajo y verificación del resultado. Los ejecutores viven en servidores y en dispositivos conectados, y el contorno de control los enlaza.

## Tres niveles de madurez

Implementado y verificado:

- Chat del portal: creación y reanudación de chats a través del gateway MCP, enrutamiento de modelos y acceso a herramientas.
- Tablero Kanban: una columna ejecuta una parte del proceso y recibe sus propias acciones, roles y grupo de agentes especializados; un conflicto devuelve la tarjeta a una decisión humana.
- Escenario sobre un dispositivo Android: un escenario JSON verificado ejecuta una ruta estable sobre un dispositivo de prueba conectado y registra el resultado; cuando cambia la estructura de la pantalla, la ejecución se detiene en un punto seguro y la revisión propuesta del escenario pasa a una persona.
- PhotoPizza Remote: una app Android nativa gobierna un plato giratorio por la red Wi-Fi local y WebSocket — dirección, número de fotogramas, velocidad, pausa, retardo, arranque y parada del movimiento.

Prototipo verificado:

- Browser X MCP 1.0.0-beta.1: un servidor MCP sobre Playwright con transporte stdio — arranque del navegador, navegación, extracción estructurada de la página, introducción en formularios, scroll, inspección de elementos, acciones atómicas y por lotes, capturas y ejecución de código en el contexto de la página. La beta declara sus límites: el navegador vive en un proceso local, las acciones requieren una página activa, y el repositorio no garantiza conformidad estricta con W3C, aislamiento de procesos entre instancias de navegador separadas ni una política de desactivación de CDP.

Dirección de desarrollo, sin implementación confirmada en el portafolio público:

- Canal telefónico: llamar a un empleado digital y encargar trabajo por voz — ese canal no existe en el contorno verificado.
- Ejecutar el agente en el propio teléfono: hoy el dispositivo es una herramienta conectada de un ejecutor en servidor; un agente alojado en el teléfono sigue siendo una tarea aparte.
- Pool de dispositivos compartido: varios ejecutores sobre un mismo pool de dispositivos son posibles cuando la coordinación separa sus tareas y sus permisos; ese modo no aparece en el portafolio público.
- Una voz propia por empleado: en el nivel de persona, las voces están implementadas en los Tours narrados de Symbiote UI — cada personaje recibe su propio canal `speechSynthesis` en un iframe oculto, y el perfil guarda idioma, voz, velocidad, tono y volumen. El timbre para un empleado digital concreto es una tarea abierta, y las vías disponibles para crearlo dependen de los servicios usados y de los derechos sobre las grabaciones de origen.

## El camino de un encargo

Un encargo pasa por el registro de la tarea, la recogida de contexto, la selección del ejecutor, la acción, la verificación del resultado y el informe. El estado se conserva en cada etapa, lo que permite investigar los fallos y continuar el trabajo de forma segura tras una parada.

Un ejemplo de reparto del trabajo: un agente reúne material para publicar, otro prepara el texto y la maquetación, y un ejecutor trabaja con la aplicación necesaria. Antes de una acción pública, el resultado puede entregarse a una persona para su aprobación.

## Un equipo de empleados digitales

El contorno de control reparte tareas y transmite contexto entre ejecutores. Los teléfonos, los servidores y las demás herramientas conectadas forman los recursos de ejecución. El grupo de agentes especializados de una columna Kanban permite ampliar el número de ejecutores para una carga dada; el pool de dispositivos compartido entre ejecutores sigue siendo dirección de desarrollo.

## Canales y permisos

Cada empleado digital puede tener sus propias cuentas, chats y operaciones permitidas. Los roles deciden con qué datos y aplicaciones trabaja, qué decisiones toma por su cuenta y cuáles pasa a una persona.

## Control y confirmaciones

Cada herramienta recibe operaciones permitidas, condiciones de confirmación y reglas de finalización. Si la interfaz cambió, se cortó la conexión o no se pudo verificar el resultado, el sistema registra el estado y el motivo de la parada. El usuario ve el avance y decide si continúa.

## Mi foco de ingeniería

En esta dirección combino agentes de IA, automatización de servidor, teléfonos, interfaces y diseño de procesos. La arquitectura conecta herramientas dispersas y ayuda a una persona a gestionar la ejecución y el resultado.
