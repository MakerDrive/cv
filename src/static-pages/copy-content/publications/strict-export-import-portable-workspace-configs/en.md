Symbiote Workspace exports portable JSON and validates it again on import. Strict export rejects grant objects and non-portable source fields. The sanitizer excludes authentication state, user identity, server endpoints, session data, local paths, and absolute file references from the shareable artifact.

The exported host-integration contract lists required imports, components, services, runtime slots, and persistence tools. Identifiers must follow the portable naming rules. A compatible host can inspect these requirements before mounting the workspace.

Workspace packages add a manifest for dependencies and relative assets, then run the same config import validation during inspection. URLs, host state, marketplace state, credentials, and local filesystem references are rejected. Portability checks and the shareable artifact operate on JSON.
