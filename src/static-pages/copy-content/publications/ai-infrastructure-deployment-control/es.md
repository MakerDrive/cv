## Tres modos de despliegue

Un contorno de IA se despliega de una de tres formas: una máquina local, infraestructura en la nube o un contorno híbrido. El paso entre ellos es gradual: un contorno local incorpora recursos externos a medida que crece la carga.

**Máquina local.** El modelo y los datos que necesita trabajan dentro de un entorno gestionado. Sale menos información del perímetro, y esa misma decisión trae operación propia, actualizaciones y control del rendimiento.

**Nube.** Encaja con cargas variables, modelos listos y servicios externos. El coste y la disponibilidad dependen del proveedor, de las cuotas y de la conexión de red, mientras la transferencia de datos se describe en una política aparte.

**Contorno híbrido.** La ejecución local se combina con recursos externos, y el ejecutor se elige por las reglas de la tarea, los requisitos de datos, el coste y la capacidad disponible.

## Una decisión de despliegue confirmada

En Agent Portal, los modelos y las suscripciones se agrupan en grupos de recursos, de modo que una etapa recibe un ejecutor con capacidades Adequadas y una cuota disponible. Los modelos rápidos se ocupan del trabajo simple y exploratorio; los modelos fuertes toman las decisiones complejas sobre contexto de proyecto comprimido.

La ejecución sigue siendo local: una delegación arranca un worker CLI y devuelve de inmediato un identificador de tarea, mientras la decisión de aceptación pertenece al orquestador. La restricción es medible: la cuota del grupo de recursos y el presupuesto de contexto comprimido. La API externa forma parte del contorno: el runtime local sigue en marcha, y el orquestador acepta el resultado.

## El límite de los datos

Para documentos confidenciales se define un límite de transferencia permitida. El sistema decide qué queda dentro y qué información puede dirigirse a una API externa. Ese límite exige implementación técnica y verificación; el esquema por sí solo no garantiza privacidad.

## Operación

La operación cubre roles y acceso, almacenamiento de secretos, observabilidad, colas, redundancia, registro y control de costes. Las configuraciones crecen con la carga: la máquina local, la nube y el contorno híbrido siguen siendo opciones disponibles de un mismo proceso.
