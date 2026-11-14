Agent Pool conserva para cada tarea delegada una cola acotada de stderr y la combina con eventos en vivo, tiempo transcurrido, identidad del proceso y resultado final. Así se puede inspeccionar una tarea activa sin introducir un log de proceso ilimitado en el contexto del agente.

El formateador cuenta señales de rate limit como `429` y `RESOURCE_EXHAUSTED`. Si el proveedor imprime `retryDelay` o `retryDelayMs`, el valor aparece junto al estado de la tarea. El resto de stderr se reduce a un fragmento breve y accionable. El parser informa únicamente de lo emitido por el proveedor; no deduce un estado de cuota que no esté presente en la salida.

La liveness se comprueba con el PID del proceso hijo y la señal `0`, que verifica su existencia sin terminarlo. Las tareas finalizadas conservan salida estructurada y errores para consultas posteriores.
