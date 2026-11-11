## What holds the layers together

Full-stack work starts by treating the interface, server logic, API, storage, and operations as one product. A delivery failure is not closed by an interface fix, and a slow request is not cured by a larger browser timeout: a failure in one layer is visible in the others. JavaScript and Node.js carry most of my work, and the remaining components follow the requirements of the system.

## The request path

A request travels through a chain: web interface → HTTP/API → application services → database and queues → execution nodes. Monitoring and recovery sit as separate contours above that chain: a queue holds the work, repeatable execution keeps delivery manageable, and observability shows which step the process stopped at.

## How the toolset is chosen

The toolset is not fixed in advance — it follows the requirements of the system. Clear contracts and manageable process state let me swap components without rewriting the product.

## Example: lifecycle messaging platform

A confidential platform developed as a commercial R&D project. The product level carries API services on JavaScript and Node.js, PostgreSQL, runtime synchronization over WebSocket, a RabbitMQ-compatible intake, Swagger documentation, and admin interfaces. Campaigns, audiences, consents, and analytics stay at that level.

The product does not talk to the physical devices directly. The boundary runs through the delivery instances: they are managed over serialport/COM connections with AT commands, and the modem runtime performs SMS inbox and USSD operations. The server runtime reaches the remote instances through SSH/WebSocket tunnels, so device commands stay inside the delivery subsystem.

For reproducible testing without continuous access to physical devices, I built a local Digital Twin with virtual modems and repeatable traffic scenarios. The twin mirrored the GSM modem pool in both directions: device behavior could be replayed locally, while the same operational flow — queue, repeatable execution, monitoring — stayed applicable to the physical runtime. The twin exercised delivery logic on virtual devices.

The client and the details of the specific deployment stay out of the public description: categories of functions, the stack profile, and subsystem boundaries remain. Tests run on the local twin, production delivery stays on the physical pools, and the product level does not change when the hardware contour is replaced.
