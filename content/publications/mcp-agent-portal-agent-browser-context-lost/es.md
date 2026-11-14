La beta de Browser X mantiene el browser de Playwright y la página en estado local del proceso. Antes de reutilizar una instancia, `start_browser` evalúa una expresión trivial en la página. Si esa prueba falla, elimina la referencia guardada y permite iniciar un browser nuevo.

Las acciones requieren una página activa. Navegación, extracción, entrada de texto, clicks y evaluación devuelven un error explícito que indica iniciar el navegador cuando la página no existe. Ese es el límite de recuperación implementado: detectar una instancia muerta, descartarla y exigir al caller que establezca de nuevo el estado del navegador.

Si se pierde el proceso del navegador, no se reconstruye el estado de la página. El caller debe volver a abrir el destino y leer el DOM actual antes de continuar; este mecanismo no restaura cookies ni local storage.
