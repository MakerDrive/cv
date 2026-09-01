La beta de Browser X mantiene el browser de Playwright y la página en estado local del proceso. Antes de reutilizar una instancia, `start_browser` evalúa una expresión trivial en la página. Si esa prueba falla, elimina la referencia guardada y permite iniciar un browser nuevo.

Las acciones requieren una página activa. Navegación, extracción, entrada de texto, clicks y evaluación devuelven un error explícito que indica iniciar el navegador cuando la página no existe. Ese es el límite de recuperación implementado: detectar una instancia muerta, descartarla y exigir al caller que establezca de nuevo el estado del navegador.

El repositorio no define una respuesta exacta `Context Lost`, manejo automático de señales de muerte, evidencia específica de OOM ni un sistema para restaurar cookies y local storage. El estado de la página no se reconstruye tras perder el proceso. El agente debe abrir otra vez el destino y adquirir el DOM actual antes de continuar.
