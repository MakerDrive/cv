## What a digital employee is

A digital employee is an executor with its own contour of assignments: a role, a task, tools, work state, and result verification. Executors run on servers and on connected devices, and the control contour connects them.

## Three levels of maturity

Implemented and verified:

- Portal chat: chat creation and resumption through the MCP gateway, model routing, and tool access.
- Kanban board: a column runs part of the process and gets its own actions, roles, and pool of specialized agents; a conflict returns the card to a human decision.
- Scenario on an Android device: a verified JSON scenario executes a stable path on a connected test device and records the result; when the screen structure changes, execution stops at a safe point and the proposed scenario revision goes to a person for review.
- PhotoPizza: the ecosystem includes a native Android client for turntable control. The separate PhotoPizza Remote project is a browser interface that controls the device over local Wi-Fi and WebSocket. These clients demonstrate equipment control; hosting a digital employee on a smartphone remains open work.

A verified prototype:

- Browser X MCP 1.0.0-beta.1: an MCP server on Playwright with stdio transport — browser start, navigation, structured page extraction, form input, scroll, element inspection, atomic and batched actions, screenshots, and code execution in the page context. The beta release states its limits: the browser lives in a local process, actions require an active page, and the repository does not guarantee strict W3C conformance, process isolation between separate browser instances, or a CDP disable policy.

Development direction, with no confirmed implementation in the public portfolio:

- Phone channel: calling a digital employee and assigning work by voice — such a channel is absent from the verified contour.
- Running the agent on the smartphone itself: today the device is a connected tool of a server-side executor; an agent hosted on the phone remains a separate task.
- Shared device pool: several executors over one device pool are possible when coordination separates their tasks and access rights; the public portfolio does not show that mode.
- A personal voice per employee: at the persona level, voices are implemented in the narrated tours of Symbiote UI — each persona gets its own `speechSynthesis` channel in a hidden iframe, and the profile stores locale, voice, rate, pitch, and volume. A timbre for a specific digital employee is an open task, and the available ways to create one depend on the services in use and on the rights to the source recordings.

## The path of an assignment

An assignment passes through task registration, context collection, executor selection, action, result verification, and reporting. State is preserved at every stage, which makes failures investigable and lets work continue safely after a stop.

An example of splitting the work: one agent collects material for publication, another prepares the text and the layout, and an executor works with the required app. Before a public action, the result can be handed to a person for approval.

## A team of digital employees

The control contour distributes tasks and passes context between executors. Smartphones, servers, and other connected tools form the execution resources. The pool of specialized agents on a Kanban column lets me extend the executor count for a given load; a shared device pool across executors is still development direction.

## Channels and access rights

Each digital employee can have its own accounts, chats, and permitted operations. Roles decide which data and apps it works with, which decisions it makes itself, and which ones it passes to a person.

## Control and confirmations

Each tool gets permitted operations, confirmation conditions, and completion rules. When the interface changed, the connection dropped, or the result could not be verified, the system records the state and the reason for stopping. The user sees the progress and decides whether to continue.

## My engineering focus

In this direction I combine AI agents, server automation, smartphones, interfaces, and process design. The architecture connects scattered tools and helps a person manage execution and results.
