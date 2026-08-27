---
title: Symbiote Workspace
order: 14
period: 2026
kicker: Author project
summary: Agent-driven workspace R&D for turning intent into plans, graph state, builds, and shareable artifacts in the Symbiote Workspace / UI / Engine line.
image: https://rnd-pro.com/svg/logo/index.svg
alt: Symbiote Workspace constructor
href: https://github.com/rnd-pro/symbiote-workspace
linkLabel: View repository
links: npm|https://www.npmjs.com/package/symbiote-workspace; Demo|https://rnd-pro.github.io/symbiote-workspace/
---

# Symbiote Workspace

:::article-block intro
Symbiote Workspace is a universal environment for task-specific work. An agent turns a user's intent into an interface assembled from declared layouts, panels, modules, actions, and connections.

:::article-block portable-config
The result is a portable executable configuration. It can be validated, saved, updated while the workspace is running, and reopened by a compatible host application.

:::article-block config-artifact
The portable artifact records the layout, modules, actions, connections, theme state, runtime slots, and host requirements without embedding credentials or user identity.

:::article-block config-flow
The construction path is explicit: intent becomes a configuration, the configuration is validated, and the host mounts the resulting workspace. Symbiote UI supplies reusable visual blocks; Symbiote Engine supplies reusable execution blocks.

:::article-block agent-portal
Agent Portal is being shaped as a Workspace configuration for agent-assisted engineering. Its current status remains active development.

:::article-block video-studio
Symbiote Video Studio is also moving toward the same configuration model while its video core and its alpha workspace retain separate maturity labels.

:::article-block host-examples
Agent Portal and Symbiote Video Studio are two host-compatible examples with distinct product workflows and maturity boundaries.

:::article-block host-boundary
Authentication, secrets, model routing, storage, identity, and user data remain host responsibilities. I develop Workspace as the portable construction layer between those host capabilities and reusable UI and execution libraries.
