## The request route

The process scheme: a matching option appears → conditions are checked → the request starts → the filling stages run in order → verification → confirmed result. Every stage has entry conditions and a completion criterion.

## The starting point

The first step is a matching option or event appearing. The system compares it with the configured rules and only then starts working. Reaction speed matters, and it does not cancel the admissibility check.

## Verification at every step

Each stage is validated: the selected option, the filled fields, the documents, the server responses, and the actual request status. A failed check stops the run until the cause is known.

## An anonymized request route

An example from a verified contour: a multi-stage form on a test stand.

1. An event arrives in the feed, the rules select a matching option, and the chosen service, the data set, and the required documents are verified before the start.
2. The scenario walks the screens in order: option selection, data, documents.
3. Every transition lands in the log: the selected option, the filled fields, the attached documents, the server responses.
4. Submission is confirmed by the actual request status returned by the service. A click on the submit button is not a confirmation — until the server returns a status, the operation stays unconfirmed.
5. A repeated step runs only after a check that it will not produce a duplicate. Limits and durable deduplication constrain outgoing operations, so a repeated run does not turn into a series of identical submissions.

In the browser contour this looks like an MCP server built on Playwright: navigation, structured page extraction, form input, atomic and batched actions, screenshots as a separate evidence source. The Browser X MCP beta runs in a local process and its actions require an active page; current Agent Portal treats browser access as a configurable tool boundary.

In the applied contour with Android devices the same rules are implemented in a verified JSON scenario: a stable path on a connected test device with the result recorded, a stop at a safe point when the screen structure changes, and approval and log records that tie an accepted decision to a local result confirmation. The public demo ends with a local draft, a test target, and an approval or dry-run confirmation. No external submission is performed, and device credentials and production account data stay out of the public case.

## Recovery

A changed interface, a dropped connection, a lost session, and a server refusal are normal cases the process prepares for: state is preserved, and the decision to repeat is taken after comparing with the log.

## Human approval

Undecided questions, actions with legal consequences, and confirmations requested by the service go to a person. The agent does not imitate someone else's consent.

## The log

The log records transitions, checks, events, and reasons for stopping. The safe mode does not try to bypass captchas, service prohibitions, or access restrictions.
