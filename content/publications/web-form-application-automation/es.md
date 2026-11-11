## La ruta de la solicitud

El esquema del proceso: aparece una opción adecuada → se comprueban las condiciones → arranca la solicitud → las etapas de relleno se ejecutan en orden → verificación → resultado confirmado. Cada etapa tiene condiciones de entrada y un criterio de finalización.

## El punto de partida

El primer paso es que aparezca una opción adecuada o un evento. El sistema lo compara con las reglas configuradas y solo entonces empieza a trabajar. La velocidad de reacción importa, y no cancela la comprobación de admisibilidad.

## Verificación en cada paso

Cada etapa se valida: la opción elegida, los campos rellenados, los documentos, las respuestas del servidor y el estado real de la solicitud. Una comprobación fallida detiene la ejecución hasta que se conozca la causa.

## Una ruta de solicitud anonimizada

Un ejemplo de un contorno verificado: un formulario de varias etapas sobre un banco de pruebas.

1. Un evento llega al feed, las reglas seleccionan una opción adecuada y antes de arrancar se verifican el servicio elegido, el conjunto de datos y los documentos requeridos.
2. El escenario recorre las pantallas en orden: elección de opción, datos, documentos.
3. Cada transición queda en el registro: la opción elegida, los campos rellenados, los documentos adjuntos, las respuestas del servidor.
4. El envío se confirma con el estado real de la solicitud que devuelve el servicio. Un clic en el botón de envío no cuenta como confirmación: mientras el servidor no devuelva un estado, la operación sigue sin confirmar.
5. Un paso repetido se ejecuta solo después de comprobar que no producirá un duplicado. Los límites y la deduplicación duradera restringen las operaciones salientes, de modo que una ejecución repetida no se convierte en una serie de envíos idénticos.

En el contorno de navegador esto parece un servidor MCP construido sobre Playwright: navegación, extracción estructurada de la página, introducción en formularios, acciones atómicas y por lotes, capturas como fuente de evidencia aparte. La beta de Browser X MCP vive en un proceso local y sus acciones requieren una página activa; el Agent Portal actual trata el acceso al navegador como un límite de herramienta configurable.

En el contorno aplicado con dispositivos Android las mismas reglas están implementadas en un escenario JSON verificado: una ruta estable sobre un dispositivo de prueba conectado con el resultado registrado, una parada en un punto seguro cuando cambia la estructura de la pantalla, y registros de aprobación y de ejecución que unen una decisión aceptada con la confirmación local del resultado. La demo pública termina con un borrador local, un objetivo de prueba y una confirmación de aprobación o dry-run. No se realiza ningún envío externo, y las credenciales de dispositivo y los datos de cuentas de producción quedan fuera del caso público.

## Recuperación

Una interfaz cambiada, una conexión cortada, una sesión perdida y un rechazo del servidor son casos normales para los que se prepara el proceso: se conserva el estado, y la decisión de repetir se toma tras contrastar con el registro.

## Aprobación humana

Las decisiones indeterminadas, las acciones con consecuencias legales y las confirmaciones solicitadas por el servicio pasan a una persona. El agente no imita el consentimiento de otro.

## El registro

El registro anota transiciones, comprobaciones, eventos y motivos de parada. El modo seguro no intenta sortear captchas, prohibiciones del servicio o restricciones de acceso.
