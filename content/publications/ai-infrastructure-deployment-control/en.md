## Three deployment modes

An AI contour runs in one of three ways: a local machine, cloud infrastructure, or a hybrid contour. The move between them is gradual — a local contour gains external resources as the load grows.

**Local machine.** The model and the data it needs stay inside a managed environment. Less information leaves the boundary, and the same decision brings own operation, updates, and performance control.

**Cloud.** It fits variable load, ready-made models, and external services. Cost and availability depend on the provider, the quotas, and the network connection, while data transfer is described by a separate policy.

**Hybrid contour.** Local execution combines with external resources, and the executor is chosen by the rules of the task, data requirements, cost, and available capacity.

## A confirmed placement decision

In Agent Portal, models and subscriptions are grouped into resource groups, so a stage receives an executor with matching capabilities and an available quota. Fast models take simple and exploratory work; strong models take complex decisions on compressed project context.

Execution stays local in that setup: a delegation starts a CLI worker and returns a task identifier immediately, while the acceptance decision belongs to the orchestrator. The constraint is measurable — the resource group quota and the compressed context budget. The external API stays part of the contour: the local runtime keeps running, and the orchestrator accepts the result.

## The data boundary

For confidential documents, a boundary of permitted transfer is defined. The system decides what stays inside and which data may be sent to an external API. That boundary takes technical implementation and verification; the scheme itself guarantees no privacy.

## Operations

Operations cover roles and access, secret storage, observability, queues, redundancy, logging, and cost control. Configurations grow with the load: a local machine, the cloud, and a hybrid contour remain available options of the same process.
