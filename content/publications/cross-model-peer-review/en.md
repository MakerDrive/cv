Agent Pool MCP routes a bounded review task through the configured `review` resource group. The orchestrator calls `delegate_task_readonly`, receives a task identifier, and retrieves the completed report with `get_task_result`.

The review worker returns findings, risks, and suggested changes. The orchestrator checks them against the current files and verification results, then decides which changes to make and whether the work meets its acceptance criteria. Review assignments can use any provider and model configured for the resource group.
