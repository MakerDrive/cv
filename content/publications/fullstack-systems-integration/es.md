## Qué une las capas

El trabajo full-stack empieza tratando la interfaz, la lógica de servidor, la API, el almacenamiento y la operación como un solo producto. Una avería de entrega no se cierra con un ajuste de interfaz, y una petición lenta no se cura con un timeout mayor en el navegador: el fallo de una capa se ve en las demás. JavaScript y Node.js sostienen la mayor parte de mi trabajo, y el resto de componentes se elige según los requisitos del sistema.

## El camino de la petición

Una petición recorre una cadena: interfaz web → HTTP/API → servicios de aplicación → base de datos y colas → nodos de ejecución. El monitoreo y la recuperación viven como contornos aparte sobre esa cadena: una cola retiene el trabajo, la ejecución repetible mantiene manejable la entrega, y la observabilidad muestra en qué paso se detuvo el proceso.

## Cómo se elige el conjunto de herramientas

El conjunto de herramientas no se fija de antemano: sigue los requisitos del sistema. Los contratos claros y un estado de proceso manejable permiten cambiar componentes sin reescribir el producto.

## Ejemplo: lifecycle messaging platform

Una plataforma confidencial desarrollador como proyecto comercial de I+D. El nivel de producto reúne servicios API sobre JavaScript y Node.js, PostgreSQL, sincronización de runtime por WebSocket, intake compatible con RabbitMQ, documentación Swagger e interfaces administrativas. Las campañas, las audiencias, los consentimientos y la analítica permanecen en ese nivel.

El producto no habla directamente con los dispositivos físicos. El límite pasa por las instancias de entrega: se gestionan mediante conexiones serialport/COM con comandos AT, y el runtime de módems ejecuta el inbox de SMS y las operaciones USSD. El runtime de servidor llega a las instancias remotas por túneles SSH/WebSocket, de modo que los comandos de dispositivo quedan dentro del subsistema de entrega.

Para pruebas reproducibles sin acceso continuo a los dispositivos físicos, construí un Digital Twin local con módems virtuales y escenarios de tráfico repetibles. El twin reflejaba el pool de módems GSM en ambos sentidos: el comportamiento de los dispositivos se reproducía localmente, mientras el mismo flujo operativo —cola, ejecución repetible, monitoreo— seguía siendo aplicable al runtime físico. El twin ejercitaba la lógica de entrega sobre dispositivos virtuales.

El cliente y los detalles del despliegue concreto quedan fuera de la descripción pública: permanecen las categorías de funciones, el perfil del stack y los límites de los subsistemas. Las pruebas se ejecutan sobre el twin local, la entrega de producción sigue en los pools físicos, y el nivel de producto no cambia al sustituir el contorno de hardware.
