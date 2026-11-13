## Qué problemas resuelve esta dirección

La ingeniería de sistemas es la parte de mi trabajo en la que un producto debe seguir funcionando como un solo sistema: interfaz, API, servicios de aplicación, almacenamiento, colas, un runtime que habla con dispositivos y el contorno de operación por encima de todo eso. Un fallo en una capa se ve en las demás, así que el trabajo empieza por la ruta de la petición y por quién es dueño de cada frontera, no por un framework.

Tareas típicas: llevar un proceso existente a un runtime mantenible; separar la capa de producto de un contorno de hardware; conseguir que un prototipo sobreviva a carga real, reinicios y al reemplazo de un componente; darle a un equipo una forma repetible de probar un sistema cuyos dispositivos reales no siempre están disponibles.

## De dónde viene la experiencia

| Proyecto | Período | Qué demostró el proyecto |
| --- | --- | --- |
| [Lifecycle Messaging Platform](../../projects/lifecycle-messaging-platform/) | 2022–2026 | Una plataforma de producto confidencial: servicios API, PostgreSQL, sincronización de runtime por WebSocket, una cola y un contorno de dispositivos tras una frontera explícita. |
| [PhotoPizza Remote](../../projects/photopizza-remote/) | 2018–2019 | Control de un dispositivo físico desde el navegador por red local, usado en campo y no en laboratorio. |
| [PhotoSnail Public](../../projects/photosnail-public/) | 2016 | Experimentos de movimiento controlado de cámara y el primer contorno de presentación de medios alrededor de la toma automatizada. |
| [Adaptive Maximo Workbench](../../projects/adaptive-maximo-workbench/) | Fecha pendiente | Un contorno de demostración para operaciones de mantenimiento que declara qué acciones existen y qué capas de integración pertenecen al host. |
| [Symbiote Node](../../projects/symbiote-node/) | 2026 | Capa de empaquetado y migración entre primitivas de UI y prototipos del motor de ejecución. |

Las fechas describen cuándo se ejecutaron los proyectos. No son la fecha en que se escribió esta página ni la fecha en que empezó la competencia.

## Qué hago personalmente

En la plataforma de mensajería mi aporte fue la forma del propio sistema: convertir requisitos de comunicación, audiencia, runtime de hardware y operación en arquitectura de producto, flujos de datos, ejecución del lado del módem, infraestructura de servidor y superficies administrativas.

También construí el Digital Twin local: módems virtuales y escenarios de tráfico repetibles que reflejan el pool físico de módems en ambas direcciones, de modo que el comportamiento de los dispositivos se puede reproducir localmente mientras el mismo flujo operativo —cola, ejecución repetible, monitorización— sigue siendo aplicable a producción.

En la línea de captura escribí la interfaz de control remoto que hizo práctico operar la mesa giratoria fuera del estudio y, más tarde, la línea de software de control de equipos en JavaScript/Espruino. En el workbench definí la frontera de la demo: qué declara disponible la interfaz y qué problemas de producción quedan en una capa de integración propiedad del host.

## Cómo trabajo

- **Contratos antes que componentes.** Interfaces, transiciones de estado y criterios de finalización se escriben antes de elegir una implementación, para poder reemplazar un componente sin reescribir el producto.
- **Una ruta de petición, dibujada de extremo a extremo.** Interfaz, HTTP/API, servicios, almacenamiento, colas y nodos de ejecución se tratan como un único camino; la monitorización y la recuperación son contornos separados por encima, no un añadido posterior.
- **Estado que sobrevive al fallo.** Colas y ejecución repetible mantienen manejable la entrega cuando enlaces y dispositivos cambian de estado; el proceso se diseña reanudable e investigable.
- **Fronteras con dueño.** El nivel de producto no habla directamente con los dispositivos físicos: las instancias de entrega poseen el protocolo del dispositivo y el runtime de servidor llega a ellos por túneles.
- **Dobles para realidades caras.** Cuando un contorno físico no está disponible de forma continua, un doble local ejerce el mismo flujo operativo en lugar de debilitar la prueba.
- **El conjunto de herramientas sigue al sistema.** JavaScript y Node.js llevan la mayor parte del trabajo; el almacenamiento, las colas y los componentes de runtime responden al requisito, no a un stack preferido.

## Resultados confirmados

- La plataforma funcionó a nivel de producto sobre servicios JavaScript/Node.js, PostgreSQL, sincronización de runtime por WebSocket, una entrada compatible con RabbitMQ y API documentadas, con campañas, audiencias, consentimientos y analítica en ese nivel.
- La entrega permaneció dentro de su subsistema: las instancias gestionaban pools de módems GSM por conexiones serialport/COM y comandos AT, el runtime de módem realizaba operaciones de SMS inbox y USSD, y el runtime de servidor llegaba a las instancias remotas por túneles SSH/WebSocket.
- El Digital Twin ejerció la lógica de entrega sobre dispositivos virtuales en ambas direcciones, así que las pruebas se ejecutaban localmente mientras la entrega de producción seguía en los pools físicos.
- PhotoPizza Remote controló una mesa giratoria por la red Wi-Fi local mediante WebSocket: dirección, número de fotogramas, velocidad, pausa, retardo, inicio y parada del movimiento.

## Implementado, prototipo y trabajo abierto

- **Implementado y en uso:** la capa de producto de la plataforma, la frontera de instancias de entrega, el Digital Twin, la interfaz de control de captura y la línea de software de control de equipos.
- **Demo / prototipo:** Adaptive Maximo Workbench es una configuración de espacio de trabajo Demo / Alpha. La ruta aceptada de la demo es de solo lectura: abrir una orden de trabajo, inspeccionar su activo vinculado y revisar la lista de acciones declaradas. Conectar un sistema Maximo de producción es trabajo de integración aparte.
- **Abierto:** la integración con EAM/ERP de producción detrás de la demo del workbench y un contorno de hardware más amplio para la plataforma de mensajería no forman parte del alcance entregado.

## Conversar sobre una tarea

En el primer mensaje es más útil indicar el proceso o sistema que hay que ordenar, las restricciones que no se pueden mover, el modo de fallo actual y el plazo. Respondo con la forma del sistema, las fronteras que mantendría y lo que verificaría primero.

Contacto: [Telegram](https://t.me/text2code) · [LinkedIn](https://www.linkedin.com/in/v-matiasevich/) · [GitHub](https://github.com/MakerDrive).