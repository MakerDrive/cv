Terminal X MCP was an early prototype for describing terminal work through MCP. The repository wired a stdio server and registered contracts for command execution, process monitoring, security assessment, and workflow planning. Those schemas established the intended boundary between an agent request and a terminal operation.

The implementation stopped at that boundary. The command, monitoring, validation, and planning handlers returned placeholder responses; the advertised executor and monitoring agents were roadmap items. The prototype did not execute commands or provide a terminal sandbox.

Terminal X demonstrates how the tool surface was decomposed and how explicit errors and result shapes were considered. In the current Agent Portal architecture, terminal servers are optional configured tools, while Agent Pool owns the implemented CLI process lifecycle for delegated agents.
