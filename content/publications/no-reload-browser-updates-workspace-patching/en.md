Symbiote Workspace can validate and apply a config patch while the browser workspace remains mounted. A patch may update theme, design, layout, runtime, export, validation, module, or other config sections. The validator merges a candidate config, applies the Symbiote UI design policy where relevant, and runs strict workspace validation.

`proposeWorkspacePatch()` returns diagnostics, suggested corrections, the candidate config, and a structural diff. `applyWorkspacePatch()` accepts only a proposal without hard violations and records the applied operations plus a validation report in the config.

When the change runs through dispatch, mutating tools also require the current base revision and receive a new revision after success. This validation, diff, evidence, and revision flow is the implemented no-reload contract.
