Symbiote Engine registers node types from self-describing driver records. Each record names the type, socket inputs and outputs, parameters, category, and execution function or lifecycle. The registry can list drivers, validate parameters, find compatible sockets, and group node types for an editor menu.

A domain pack batches node definitions with any socket types they introduce. The Engine CLI can load named packs before running, validating, or inspecting workflow JSON. The built-in video pack follows the same registration path as custom packs.

Symbiote Video adds a stricter manifest around this engine contract: a pack carries a name, version, namespace, capabilities, and required host services. Its ownership map rejects a second namespace that tries to claim an existing node type while keeping the graph's type identifiers unchanged.
