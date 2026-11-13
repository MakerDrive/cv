## What this direction covers

Applied AI work here brings together execution placement, task routing between executors, data-transfer rules, and result verification. Work can be delegated to a server-side agent, a browser session, or a phone connected as a tool.

Typical tasks: an AI feature has to run without sending confidential documents outside a controlled boundary; several executors have to share one queue without losing ownership; a browser or device has to be driven by an agent without inventing confirmations; a result has to be accepted only when the environment actually reports success.

## Where the experience comes from

| Project | Period | What the project proved |
| --- | --- | --- |
| [Agent Portal](projects/agent-portal/) | 2025–2026 | Resource groups, model and subscription routing, executable kanban process, and human decision on conflict. |
| [Agent Pool MCP](projects/agent-pool-mcp/) | 2026 | Delegation across CLI agents with visible ownership, handoffs, and structured execution state. |
| [Project Graph MCP](projects/project-graph-mcp/) | 2026 | Graph-based code intelligence as a tool for agents. |
| [Symbiote Workspace](projects/symbiote-workspace/) | 2026 | Task-adaptive workspaces assembled from portable configurations. |
| [Browser X MCP](projects/browser-x-mcp/) | 2025 | Browser evidence and controlled UI operations as an agent tool. |

I have over 15 years of experience in software development and engineering R&D. My work with AI tooling and agent systems is evidenced by projects dating from 2025.

## What I do personally

I designed the placement rule in Agent Portal: models and subscriptions are combined into resource groups, so a stage receives an executor with suitable capabilities and an available limit, and the choice between a local run, cloud capacity, and a hybrid contour follows the task rather than a fixed default.

I also designed the delegation path: a delegation starts a CLI worker and returns a task identifier immediately, while the acceptance decision stays with the orchestrator. The constraint is measurable — the resource-group limit and the compressed context budget — so "cheaper executor" does not silently become "unverified result".

For device work I prepared a JSON scenario with checks and a browser tool that captures structured evidence. PhotoPizza is a separate equipment-control project; running an agent directly on a smartphone remains open work.

## How I work

- **The task determines deployment.** A contour runs on a local machine, in cloud infrastructure, or in a hybrid combination. Fast models take simple and exploratory work; strong models take complex decisions on compressed context. The choice accounts for task rules, data requirements, cost, and available capacity.
- **Data-transfer boundary.** For confidential documents, the rules specify what stays inside and what may be sent to an external API. Technical enforcement and verification make the documented boundary effective.
- **Delegation with visible ownership.** An assignment passes through registration, context collection, executor selection, action, result verification, and reporting; state is preserved at every stage so a failure can be investigated and work can continue after a stop.
- **Role-scoped access.** Each digital employee can have its own accounts, chats, and permitted operations; roles decide which data and applications it works with and which decisions it passes to a person.
- **Stop reasons are part of the contract.** When an interface changed, a connection dropped, or a result could not be verified, the system records the state and the reason for stopping.

## Confirmed results

- **Portal chat:** chat creation and resumption through the MCP gateway, model routing, and tool access — implemented and verified.
- **Executable kanban board:** a column runs part of the process with its own actions, roles, and pool of specialised agents; a conflict returns the card to a human decision — implemented and verified.
- **Android scenario:** a JSON scenario defines a checked route and a safe stop when the screen structure changes. The available public demo covers a local draft, test target, and approval or dry-run evidence; it does not establish a completed external submission.
- **Browser X MCP 1.0.0-beta.1:** an MCP server on Playwright with stdio transport — browser start, navigation, structured page extraction, form input, scroll, element inspection, atomic and batched actions, screenshots, and code execution in the page context — a verified prototype.

## Implemented, prototype, and open work

- **Implemented and verified:** the portal chat and kanban board. The Android scenario is described separately from the public demo evidence above.
- **Verified prototype:** Browser X MCP 1.0.0-beta.1. Its beta release states its limits: the browser lives in a local process, actions require an active page, and the repository does not guarantee strict W3C conformance, process isolation between separate browser instances, or a CDP disable policy.
- **Development direction, with no confirmed implementation in the public portfolio:** a phone channel for calling a digital employee and assigning work by voice; running the agent on the smartphone itself (today the device is a connected tool of a server-side executor); a shared device pool across several executors; a personal voice per employee. At the persona level, voices are implemented in the narrated tours of Symbiote UI, where each persona gets its own `speechSynthesis` channel in a hidden iframe and the profile stores locale, voice, rate, pitch, and volume; a timbre for a specific digital employee remains an open task and depends on the services in use and the rights to the source recordings.

## Discuss a task

The most useful first message names the process to be automated, the data that may not leave the boundary, the executors and devices involved, and the confirmation rules that must hold. I answer with the deployment contour, the executor split, and the verification points.

Contact: [Telegram](https://t.me/text2code) · [LinkedIn](https://www.linkedin.com/in/v-matiasevich/) · [GitHub](https://github.com/MakerDrive).
