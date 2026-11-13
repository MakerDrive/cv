## La ruta de la solicitud

El esquema del proceso: aparece una opción adecuada → se comprueban las condiciones → arranca la solicitud → las etapas de relleno se ejecutan en orden → verificación → resultado confirmado. Cada etapa tiene condiciones de entrada y un criterio de finalización.

## El punto de partida

El primer paso es que aparezca una opción adecuada o un evento. El sistema lo compara con las reglas configuradas y solo entonces empieza a trabajar. La velocidad de reacción importa, y no cancela la comprobación de admisibilidad.

## Verificación en cada paso

Cada etapa se valida: la opción elegida, los campos rellenados, los documentos, las respuestas del servidor y el estado real de la solicitud. Una comprobación fallida detiene la ejecución hasta que se conozca la causa.

## Ejemplo de ruta de solicitud

Para un formulario de varias etapas, la ruta se puede describir así; el servicio y los datos permanecen anonimizados.

1. Un evento llega al feed, las reglas seleccionan una opción adecuada y antes de arrancar se verifican el servicio elegido, el conjunto de datos y los documentos requeridos.
2. El escenario recorre las pantallas en orden: elección de opción, datos, documentos.
3. Cada transición queda en el registro: la opción elegida, los campos rellenados, los documentos adjuntos, las respuestas del servidor.
4. La finalización se registra solo después de recibir y comprobar el estado de la solicitud enviado por el servicio; hasta entonces, el registro mantiene el intento pendiente.
5. Antes de repetir, se comparan el estado actual y el registro. Solo se repite cuando el servicio admite una operación idempotente segura; un resultado ambiguo se deriva a revisión humana.

En el contorno de navegador esto parece un servidor MCP construido sobre Playwright: navegación, extracción estructurada de la página, introducción en formularios, acciones atómicas y por lotes, capturas como fuente de evidencia aparte. La beta de Browser X MCP vive en un proceso local y sus acciones requieren una página activa; el Agent Portal actual trata el acceso al navegador como un límite de herramienta configurable.

En el contorno de automatización Android, las mismas reglas se expresan en un escenario JSON con comprobaciones, registros de aprobación y una parada segura si cambia la estructura de la pantalla. La demo pública se limita a un borrador local, un objetivo de prueba y evidencia de aprobación o dry-run; no muestra un envío externo completado. Las credenciales del dispositivo y los datos de cuentas de producción quedan fuera del caso público.

## Recuperación

Una interfaz cambiada, una conexión cortada, una sesión perdida y un rechazo del servidor son casos normales para los que se prepara el proceso: se conserva el estado, y la decisión de repetir se toma tras contrastar con el registro.

## Aprobación humana

Las decisiones indeterminadas, las acciones con consecuencias legales y las confirmaciones solicitadas por el servicio pasan a la persona que debe otorgar el consentimiento.

## El registro

El registro anota transiciones, comprobaciones, eventos y motivos de parada. El modo seguro no intenta sortear captchas, prohibiciones del servicio o restricciones de acceso.
