---
title: Project Graph MCP
order: 9
period: 2026
kicker: Author project
summary: Code-intelligence MCP server for RAG-style project retrieval: turning repositories into compact graphs, compressed project skeletons, structured context, and evidence agents can reason over.
image: https://rnd-pro.com/svg/logo/index.svg
alt: Project Graph MCP code-intelligence server
href: https://github.com/rnd-pro/project-graph-mcp
linkLabel: View repository
links: npm|https://www.npmjs.com/package/project-graph-mcp; Demo|https://rnd-pro.github.io/project-graph-mcp/
---

# Project Graph MCP

:::article-block repository-root
Research project around a recurring agent problem: how to give an AI enough retrievable structure about a codebase without flooding it with raw files.

:::article-block graph-example
It exposes dependency views and graph summaries.

:::article-block compact-skeleton
It also exposes code skeletons.

:::article-block compact-context
These representations form compact structured context for engineering agents.

:::article-block browser-fact
This is compact structured engineering context: the R&D focus is context engineering, GraphRAG-style retrieval, context compression, and project understanding. A faster/cheaper model can analyze structure, produce a graph representation, and give an agent the relevant part of the project for the current step. Verifiable browser-test facts form a separate layer inside that focused map.

:::article-block readonly-node
Browser-test evidence adds verifiable facts to that context.

:::article-block focus-zone
A stronger model works from that distilled data instead of re-reading the whole repository. In practice this comes down to compact skeletons and 10-50x context reduction for structural project data.
