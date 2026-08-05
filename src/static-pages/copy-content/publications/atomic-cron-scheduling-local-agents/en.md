Agent Pool schedules local agent tasks with a five-field cron parser and a detached daemon. Schedule definitions and results are persisted as files, so the daemon can continue after the IDE or MCP client disconnects. Delayed one-shot tasks use the same execution boundary.

The daemon owns a PID lock file. Lock acquisition checks whether the recorded process is alive before replacing stale ownership. During each minute, the scheduler also records which schedule already ran and suppresses a duplicate launch for the same slot. Pipeline run signals use atomic file operations for communication between the MCP server and the daemon.

The design uses a minimal cron parser, persisted JSON state, a detached Node.js process, and file-based ownership. It does not depend on SQLite rows, `ON CONFLICT` locking, or a separate Python scheduler. Its guarantees should be evaluated at the filesystem boundary it actually implements.
