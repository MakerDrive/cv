---
title: Agent Portal
order: 1
period: 2025-2026
kicker: Selected project
summary: R&D workspace for AI-assisted engineering and loop engineering: project memory, context engineering, RAG-style context retrieval, graph-based context, model/resource routing, task orchestration, evals/guardrails, and controlled delivery.
image: https://rnd-pro.com/svg/logo/index.svg
alt: Agent Portal AI engineering workspace
href: https://rnd-pro.com/projects/agent-portal/
linkLabel: Read article
links: GitHub|https://github.com/rnd-pro/mcp-agent-portal; npm|https://www.npmjs.com/package/mcp-agent-portal; Demo|https://rnd-pro.github.io/mcp-agent-portal/
---

# Agent Portal

:::article-block workspace
Built around a practical R&D question: how can teams use several AI agents without losing context, ownership, verification, and control?

:::article-block workspace-gallery
The product combines durable project memory, context engineering, RAG-style context retrieval, model routing, tool use, task orchestration, and browser-facing operations into one engineering environment that keeps AI-assisted work auditable.

:::article-block kanban-board
At the center is an executable kanban board.

:::article-block column-settings
Each column starts part of the process and can receive its own actions, roles, and pool of specialized agents.

:::article-block open-source
Agent Portal is built on a suite of MCP servers I authored, coordinated by an open-source control plane (`mcp-agent-portal`). This control plane orchestrates agent execution (Agent Pool), graph-based code intelligence (Project Graph), and browser/terminal automation, providing a clean tool-use/function-calling contract between agents and the product environment.

:::article-block process-path
Together, the configured columns make the board an executable process.

:::article-block human-decision
A conflict returns the card to a human decision. The process includes evals, guardrails, observability, and human-in-the-loop control when the loop cannot safely continue.

:::article-block process-diagram
For code tasks, the system creates an isolated working copy and branch. One agent performs the work and another independently reviews the result. The current R&D line guides coding agents through the full development cycle: picking up a task, proving the work is done, then reviewing and merging.

:::article-block resource-groups
Models and subscriptions are combined into resource groups, so each stage receives an executor with suitable capabilities and an available limit. Routine or exploratory tasks can run on cheaper/faster models while stronger models operate on the distilled project context and make higher-impact decisions.

:::article-block configuration-label
The development vector shifts the project from a monolithic application toward portable configurations (Workspace-as-Config). In the target architecture, Agent Portal acts as a thin host (providing chat, auth, and model routing), while the interface and workflows are dynamically assembled by agents via Symbiote Workspace.
