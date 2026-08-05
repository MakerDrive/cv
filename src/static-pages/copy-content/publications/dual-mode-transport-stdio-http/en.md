Agent Portal exposes the same owned tool registry through different transport boundaries. An IDE starts the MCP entry point over stdio. The local proxy connects that client to the detached singleton backend over WebSocket, where child servers and shared portal state are managed.

Sub-agents can connect to `/mcp` through Streamable HTTP. The handler supports MCP initialization, session identifiers, `tools/list`, and validated tool calls. It uses the gateway's dynamic tool source, so discovery and execution do not maintain separate copies of the public registry.

The product is implemented in Node.js, and its public HTTP path is a separate MCP handler rather than a Rust transport enum. The reusable contract is the message and tool surface: transport adapters carry the same MCP requests into portal-owned routing. Session lifecycle and response delivery remain specific to each transport.
