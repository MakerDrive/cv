## The request route

The process scheme: a matching option appears → conditions are checked → the request starts → the filling stages run in order → verification → confirmed result. Every stage has entry conditions and a completion criterion.

## The starting point

The first step is a matching option or event appearing. The system compares it with the configured rules and only then starts working. Reaction speed matters, and it does not cancel the admissibility check.

## Verification at every step

Each stage is validated: the selected option, the filled fields, the documents, the server responses, and the actual request status. A failed check stops the run until the cause is known.

## An example request route

For a multi-stage form, the route can be described this way; the service and data remain anonymized.

1. An event arrives in the feed, the rules select a matching option, and the chosen service, the data set, and the required documents are verified before the start.
2. The scenario walks the screens in order: option selection, data, documents.
3. Every transition lands in the log: the selected option, the filled fields, the attached documents, the server responses.
4. Completion is recorded only after receiving and checking the request status from the service; until then, the log keeps the attempt unfinished.
5. Before a retry, compare the current status with the log. Retry only when the service supports a safe idempotent operation; send an ambiguous outcome for human review.

In the browser contour this looks like an MCP server built on Playwright: navigation, structured page extraction, form input, atomic and batched actions, screenshots as a separate evidence source. The Browser X MCP beta runs in a local process and its actions require an active page; current Agent Portal treats browser access as a configurable tool boundary.

In the Android automation contour, the same rules are expressed in a JSON scenario with checks, approval records, and a safe stop when the screen structure changes. The public demo is limited to a local draft, a test target, and approval or dry-run evidence; it does not demonstrate a completed external submission. Device credentials and production account data stay out of the public case.

## Recovery

A changed interface, a dropped connection, a lost session, and a server refusal are normal cases the process prepares for: state is preserved, and the decision to repeat is taken after comparing with the log.

## Human approval

Undecided questions, actions with legal consequences, and confirmations requested by the service go to the person who must provide consent.

## The log

The log records transitions, checks, events, and reasons for stopping. The safe mode does not try to bypass captchas, service prohibitions, or access restrictions.
