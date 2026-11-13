## What this direction covers

Applied AI work here is not a model wrapper: it is a contour that decides where execution happens, which executor receives a task, what data may leave the boundary, and how a result is verified. The same contour also decides how work is delegated — to an agent on a server, to a browser session, or to a phone connected as a tool.

Typical tasks: an AI feature has to run without sending confidential documents outside a controlled boundary; several executors have to share one queue without losing ownership; a browser or device has to be driven by an agent without inventing confirmations; a result has to be accepted only when the environment actually reports success.

## Where the experience comes from

| Project | Period | What the project proved |
| --- | --- | --- |
| [Agent Portal](../../projects/agent-portal/) | 2025–2026 | Resource groups, model and subscription routing, executable kanban process, and human decision on conflict. |
| [Agent Pool MCP](../../projects/agent-pool-mcp/) | 2026 | Delegation across CLI agents with visible ownership, handoffs, and structured execution state. |
| [Project Graph MCP](../../projects/project-graph-mcp/) | 2026 | Graph-based code intelligence as a tool for agents. |
| [Symbiote Workspace](../../projects/symbiote-workspace/) | 2026 | Task-adaptive workspaces assembled from portable configurations. |
| [Browser X MCP](../../projects/browser-x-mcp/) | 2025 | Browser evidence and controlled UI operations as an agent tool. |

I have over 15 years of experience in software development and engineering R&D. My work with AI tooling and agent systems is evidenced by projects dating from 2025.

## What I do personally

I designed the placement rule in Agent Portal: models and subscriptions are combined into resource groups, so a stage receives an executor with suitable capabilities and an available limit, and the choice between a local run, cloud capacity, and a hybrid contour follows the task rather than a fixed default.

I also designed the delegation path: a delegation starts a CLI worker and returns a task identifier immediately, while the acceptance decision stays with the orchestrator. The constraint is measurable — the resource-group limit and the compressed context budget — so "cheaper executor" does not silently become "unverified result".

On the device side I built the contour that connects executors to execution resources: a verified JSON scenario on a connected Android device, a browser tool with structured evidence, and a native application that drives a turntable over the local network. Each of them records state and stops at a safe point instead of guessing.

## How I work

- **Three deployment modes, one process.** A contour runs on a local machine, in cloud infrastructure, or in a hybrid combination; moving between them is gradual and does not change the task model.
- **Placement is a decision, not a default.** Fast models take simple and exploratory work; strong models take complex decisions on compressed context; the deciding factors are task rules, data requirements, cost, and available capacity.
- **A data boundary that is implemented.** For confidential documents, the system defines what stays inside and what may be sent to an external API; the boundary needs technical implementation and verification, because the scheme alone guarantees no privacy.
- **Delegation with visible ownership.** An assignment passes through registration, context collection, executor selection, action, result verification, and reporting; state is preserved at every stage so a failure can be investigated and work can continue after a stop.
- **Roles, not shared accounts.** Each digital employee can have its own accounts, chats, and permitted operations; roles decide which data and applications it works with and which decisions it passes to a person.
- **Stop reasons are part of the contract.** When an interface changed, a connection dropped, or a result could not be verified, the system records the state and the reason for stopping.

## Confirmed results

- **Portal chat:** chat creation and resumption through the MCP gateway, model routing, and tool access — implemented and verified.
- **Executable kanban board:** a column runs part of the process with its own actions, roles, and pool of specialised agents; a conflict returns the card to a human decision — implemented and verified.
- **Android scenario:** a verified JSON scenario executes a stable path on a connected test device and records the result; when the screen structure changes, execution stops at a safe point and the proposed scenario revision goes to a person — implemented and verified.
- **PhotoPizza Remote:** a native Android application drives a turntable over the local Wi-Fi network and WebSocket — direction, frame count, speed, pause, delay, motion start, and motion stop — implemented and verified.
- **Browser X MCP 1.0.0-beta.1:** an MCP server on Playwright with stdio transport — browser start, navigation, structured page extraction, form input, scroll, element inspection, atomic and batched actions, screenshots, and code execution in the page context — a verified prototype.

## Implemented, prototype, and open work

- **Implemented and verified:** the four contours listed above.
- **Verified prototype:** Browser X MCP 1.0.0-beta.1. Its beta release states its limits: the browser lives in a local process, actions require an active page, and the repository does not guarantee strict W3C conformance, process isolation between separate browser instances, or a CDP disable policy.
- **Development direction, with no confirmed implementation in the public portfolio:** a phone channel for calling a digital employee and assigning work by voice; running the agent on the smartphone itself (today the device is a connected tool of a server-side executor); a shared device pool across several executors; a personal voice per employee. At the persona level, voices are implemented in the narrated tours of Symbiote UI, where each persona gets its own `speechSynthesis` channel in a hidden iframe and the profile stores locale, voice, rate, pitch, and volume; a timbre for a specific digital employee remains an open task and depends on the services in use and the rights to the source recordings.

## Discuss a task

The most useful first message names the process to be automated, the data that may not leave the boundary, the executors and devices involved, and the confirmation rules that must hold. I answer with the deployment contour, the executor split, and the verification points.

Contact: [Telegram](https://t.me/text2code) · [LinkedIn](https://www.linkedin.com/in/v-matiasevich/) · [GitHub](https://github.com/MakerDrive).
