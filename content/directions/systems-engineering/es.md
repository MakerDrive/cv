## Problemas que abordo

Diseño productos de software en los que la interfaz, las API, el almacenamiento, las colas y el hardware deben funcionar como un solo sistema. Esto incluye los límites entre componentes, la conservación del estado y la recuperación ante fallos.

## Proyectos

| Proyecto | Ejemplo |
![Lifecycle Messaging Platform](illustrations/lifecycle-messaging-platform.webp)

**[Lifecycle Messaging Platform](../../projects/lifecycle-messaging-platform/)** — Plataforma de mensajería con API, PostgreSQL, colas y un runtime separado para módems GSM.

**[PhotoPizza Remote](../../projects/photopizza-remote/)** — Control de una mesa giratoria desde el navegador por una red local.

**[PhotoSnail Public](../../projects/photosnail-public/)** — Primeros experimentos con movimiento controlado de cámara y presentación de las capturas.

![Adaptive Maximo Workbench](illustrations/adaptive-maximo-workbench.webp)

**[Adaptive Maximo Workbench](../../projects/adaptive-maximo-workbench/)** — Interfaz demo para mantenimiento cuyo recorrido disponible es de solo lectura.

**[Symbiote Node](../../projects/symbiote-node/)** — Capa de empaquetado y migración para componentes de UI y un motor de ejecución.


## Mi contribución

En Lifecycle Messaging Platform diseñé la arquitectura del producto, los flujos de datos, la ejecución en módems y la infraestructura de servidor. Construí un Digital Twin con módems virtuales y escenarios de tráfico repetibles para probar la lógica de entrega; los envíos reales seguían en pools físicos.

Para PhotoPizza Remote desarrollé el control de la mesa giratoria desde el navegador y, más tarde, software de control de equipos con JavaScript/Espruino. En Symbiote Node trabajé en la capa de empaquetado y migración entre primitivas de UI y el motor de ejecución.

## Cómo trabajo

Sigo la ruta de una solicitud desde la interfaz hasta el ejecutor, pasando por servicios, almacenamiento y colas. Defino un contrato y un responsable para cada límite. Las colas conservan el estado de las operaciones y un Digital Twin local permite probar el comportamiento cuando los dispositivos físicos no están disponibles.

Adaptive Maximo Workbench es un proyecto Demo / Alpha. Su recorrido público permite abrir una orden de trabajo, consultar el activo relacionado y ver las acciones disponibles. La conexión con un sistema Maximo de producción requiere una integración aparte.

## Conversar sobre una tarea

Describe el sistema, sus restricciones y dónde ocurren los fallos actuales. Puedo ayudar a definir límites entre componentes y comprobaciones para entender su funcionamiento.

Contacto: [Telegram](https://t.me/text2code) · [LinkedIn](https://www.linkedin.com/in/v-matiasevich/) · [GitHub](https://github.com/MakerDrive).
