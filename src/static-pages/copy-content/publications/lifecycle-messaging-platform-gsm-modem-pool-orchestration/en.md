The platform's delivery layer connected Node.js API services to physical GSM modem pools through serial/COM ports and AT commands. WebSocket runtime synchronization exposed current operational state to administration surfaces, while RabbitMQ-compatible intake connected message work to the delivery subsystem.

The surrounding platform used PostgreSQL for data, Swagger for API documentation, and PM2/nginx for server operations. SSH and WebSocket tunnels were part of the operating profile, together with SMS inbox and USSD workflows.

The project's confidentiality boundary keeps this public description at subsystem level.
