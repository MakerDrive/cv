El runtime de entrega incluía pools físicos de módems GSM controlados mediante puertos serial/COM y comandos AT. La ejecución del lado de los módems quedaba detrás de servicios API en JavaScript y Node.js, con sincronización runtime por WebSocket y operación PM2/nginx alrededor de la capa de servidor.

Este límite mantenía el control de hardware dentro del subsistema de entrega, mientras campañas, audiencias, consentimientos y analítica seguían como funciones de producto. El intake compatible con RabbitMQ y las interfaces operativas conectaban ambas capas. Los comandos de los dispositivos permanecían dentro del runtime de entrega.

El alcance público se limita a estos límites de subsistemas y al perfil tecnológico verificado.
