The Browser X beta keeps its Playwright browser and page in process-local state. Before reusing an existing instance, `start_browser` evaluates a trivial expression on the page. If that probe fails, the stored instance is cleared and a new browser can be started.

Browser actions require an active page. Navigation, extraction, input, clicks, and evaluation return an explicit error instructing the caller to start the browser when the page is absent. This is the implemented recovery boundary: detect a dead instance, discard it, and require the caller to establish browser state again.

If the browser process is lost, the page state is not reconstructed. The caller must reopen the target and read the current DOM before continuing; cookies and local storage are not restored by this recovery path.
