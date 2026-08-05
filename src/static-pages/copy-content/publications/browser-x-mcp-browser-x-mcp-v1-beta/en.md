Browser X MCP `1.0.0-beta.1` packaged the first public browser server in this tool line. It uses Playwright to own a Chromium page and exposes its operations through an MCP stdio server.

The beta tool surface includes browser startup, navigation, structured virtual-canvas extraction, text input, scrolling, element listing, target details, atomic actions, batch actions, screenshots, and page-context evaluation. The virtual canvas derives interactive element data from the current DOM and assigns identifiers plus coordinates that later actions can consume.

The package version, Playwright dependency, registered MCP tools, and implemented handlers define this experimental beta. The repository does not establish strict W3C conformance, process isolation from a separate browser instance, or a policy of disabling CDP. Those properties should not be inferred from the release label.
