I developed Symbiote UI as the reusable interface and provider-contract layer for the Symbiote projects. Its manifest describes Web Components, layouts, schemas, rules, themes, and WebMCP metadata. Agents can inspect that catalog before selecting a component; browser registration stays behind `symbiote-ui/ui`, while the root and contract entry points remain safe for Node and SSR imports.

The package owns graph, tree, editor, chat, media, and layout primitives. Components emit intent events and consume explicit data. Navigation, persistence, permissions, secrets, and user identity stay with the host application.

The same ownership applies to the Cascade token system and T2 system roles. Inline action-message parts emit typed events, keyed embed parts give the host a slot for a live widget, and the presenter cursor turns target references into a controlled visual scenario. These are provider contracts in Symbiote UI, including when Agent Portal consumes them.
