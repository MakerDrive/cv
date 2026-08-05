Project Graph MCP includes dedicated structural parsers for TypeScript, Python, and Go when the JavaScript Acorn path is not applicable. These parsers extract the declarations and dependency signals needed by the common graph model.

The shared language utility masks comments and string contents while preserving character positions and line breaks. Regex matches can then report locations against the original file. Python parsing accounts for hash comments, triple-quoted strings, indentation, imports, classes, and functions. The Go parser maps structs and interfaces into the generic class-like records used by the graph.

This is structural analysis with documented heuristic limits, not complete compiler semantics. The public language set is JavaScript, TypeScript, Python, and Go. The package does not advertise Rust support or expose a separate parser-configuration object.
