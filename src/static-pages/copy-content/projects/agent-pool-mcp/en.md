---
title: Agent Pool MCP
order: 10
period: 2026
kicker: Author project
summary: Multi-agent orchestration runtime for delegating CLI work, assigning model/resource tiers, handling handoffs, tracking ownership, and returning structured execution state.
image: https://rnd-pro.com/svg/logo/index.svg
alt: Agent Pool MCP multi-agent runtime
href: https://github.com/rnd-pro/agent-pool-mcp
linkLabel: View repository
links: npm|https://www.npmjs.com/package/agent-pool-mcp
---

# Agent Pool MCP

:::article-block intro
Runtime layer for R&D on multi-agent orchestration.

:::article-block execution-flow
It delegates work across CLI agents while keeping task ownership visible.

:::article-block execution-runtime
The layer tracks process state, handles handoffs, and routes agent sessions through a shared MCP interface.

:::article-block work-branch
On the execution side, the runtime covers background workers, pipelines, session handoff, policies, and groups. Cheaper/faster workers can handle research, structure extraction, and routine implementation.

:::article-block review-branch
Cross-model consensus, bounce-back feedback, validation, and eval-style checks provide the review path.

:::article-block result
The practical goal is to spend stronger model attention on decisions while cheaper/faster workers handle research, structure extraction, routine implementation, validation, and eval-style checks.
