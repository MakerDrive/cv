The delivery runtime included physical GSM modem pools controlled through serial/COM ports and AT commands. Modem-side execution sat behind JavaScript and Node.js API services, with WebSocket runtime synchronization and PM2/nginx operations around the server layer.

This boundary kept hardware control within the delivery subsystem while campaign, audience, consent, and analytics functions remained product-level concerns. RabbitMQ-compatible intake and operational interfaces connected those layers. Device commands remained inside the delivery runtime.

The public scope is limited to these subsystem boundaries and the verified stack profile.
