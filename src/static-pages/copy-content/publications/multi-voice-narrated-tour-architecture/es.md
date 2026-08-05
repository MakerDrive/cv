Implementé los recorridos narrados en Symbiote UI como una línea de tiempo de diálogo con canales de voz independientes. Cada personaje recibe un canal `speechSynthesis` dentro de un iframe oculto, por lo que dos voces pueden solaparse. El perfil conserva el idioma, la voz, la velocidad, el tono y el volumen.

La línea de tiempo guarda intervenciones ordenadas con personaje, texto, señal, pausa y solapamiento opcional. La señal se activa al comenzar la voz y puede dirigir resaltados o acciones del presentador en la interfaz del host. Un mecanismo de desbloqueo activa la síntesis en navegadores que exigen interacción del usuario.

El reproductor controla la misma línea de tiempo: reproducción, pausa, reanudación, saltos entre intervenciones, búsqueda, vista previa y detención. Mantiene el índice del turno, impide que una devolución de llamada de voz cancelada avance el recorrido y expone una promesa de finalización. La síntesis de voz del navegador proporciona la ejecución de audio.
