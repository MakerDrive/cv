Agent Pool MCP canaliza una tarea de revisión acotada mediante el resource group `review` configurado. El orquestador llama a `delegate_task_readonly`, recibe un identificador y recupera el informe final con `get_task_result`.

El agente revisor devuelve hallazgos, riesgos y cambios sugeridos. El orquestador los contrasta con los archivos actuales y los resultados de verificación, y después decide qué cambios aplicar y si se cumplen los criterios de aceptación. La revisión puede usar cualquier proveedor y modelo configurado para ese resource group.
