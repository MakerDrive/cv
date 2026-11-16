During MCP initialization, Agent Portal reads the client's workspace roots and registers each root as a project in StateGraph. The project becomes an open dashboard tab and is available to the shared backend used by the connected IDE windows.

StateGraph deduplicates projects by the stored path string. Registering the same path updates the existing record and its last-opened time. The implementation does not currently canonicalize the path with `realpath`, hash it, or collapse case variants. Symlink aliases and different path spelling can therefore represent separate records.

The implemented design uses a short random project ID after exact-path lookup and persists project state through StateGraph. Deduplication depends on the path identity supplied by the MCP client.
