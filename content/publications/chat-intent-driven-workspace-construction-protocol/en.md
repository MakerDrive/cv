I implemented chat-led workspace construction as a sequence of explicit planning and validation steps. The constructor classifies the request, records questionnaire state, selects provider modules, resolves layout and execution requirements, and produces a portable workspace config.

The resulting artifact describes views, panels, actions, wires, theme state, runtime slots, and required host services. Symbiote UI supplies discoverable components and layout contracts; Symbiote Engine supplies executable graph primitives. Authentication, model routing, storage, and permissions remain in the host.

Construction tools run through the same dispatch registry used by CLI and MCP. A config is validated before mounting, and mutations require the current base revision. The accepted config is the intermediate artifact passed to browser assembly.
