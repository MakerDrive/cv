## Problems I work on

I design software products in which the interface, APIs, data stores, queues, and hardware have to work as one system. This includes component boundaries, state management, and recovery from failures.

## Projects

| Project | Example |
| --- | --- |
| [Lifecycle Messaging Platform](/cv/projects/lifecycle-messaging-platform/) | A messaging platform with APIs, PostgreSQL, queues, and a separate GSM modem runtime. |
| [PhotoPizza Remote](/cv/projects/photopizza-remote/) | Browser control of a turntable over a local network. |
| [PhotoSnail Public](/cv/projects/photosnail-public/) | Early experiments in camera motion control and presenting captured media. |
| [Adaptive Maximo Workbench](/cv/projects/adaptive-maximo-workbench/) | A maintenance demo interface whose available path is read-only. |
| [Symbiote Node](/cv/projects/symbiote-node/) | A package and migration layer for UI components and an execution engine. |

## My contribution

At Lifecycle Messaging Platform, I designed the product architecture, data flows, modem-side execution, and server infrastructure. I built a Digital Twin with virtual modems and repeatable traffic scenarios to exercise delivery logic; actual sending remained on physical modem pools.

For PhotoPizza Remote, I developed browser control for the turntable and later equipment-control software in JavaScript/Espruino. At Symbiote Node, I worked on the package and migration layer between UI primitives and the execution engine.

## How I work

I trace a request from the interface through services, storage, and queues to the executor. I define a contract and owner for each boundary. Queues preserve operation state, while a local Digital Twin lets me exercise behavior when physical devices are unavailable.

Adaptive Maximo Workbench is a Demo / Alpha project. Its public path lets a visitor open a work order, inspect its linked asset, and view the available actions. Connecting a production Maximo system is separate work.

## Discuss a task

Describe the system, its constraints, and where failures occur today. I can help define component boundaries and checks that make its behavior clear.

Contact: [Telegram](https://t.me/text2code) · [LinkedIn](https://www.linkedin.com/in/v-matiasevich/) · [GitHub](https://github.com/MakerDrive).
