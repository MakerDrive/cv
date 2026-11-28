---
id: agent-pool-details
lang: ru-RU
source: cv-show-presentation-project
revision: 121
---

# CV Show

## [agent-pool-details | mode=read] agent-pool-details
@audio ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/clips/23-detail-agent-pool-details-24c08ca8c1a0.opus
@align ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/aligned/23-detail-agent-pool-details.json
Я создавал Agent Pool как независимый слой исполнения для разных си эл ай агентов и разных моделей. Он не должен зависеть от одного конкретного провайдера. Система поддерживает параллельные задачи, последовательные пайплайны, передачу сессий, политики исполнения и группы ресурсов. Например, один процесс может поручить реализацию одному агенту. А независимую проверку результата другому. Так проверяющий агент не обязан наследовать рассуждения и предположения исполнителя. В сценариях кросс модельного ревью можно использовать модели разных провайдеров. Они независимо анализируют задачу, после чего результаты сравниваются и собираются в общий структурированный ответ. Для меня это способ строить процессы не вокруг одной умной модели, а вокруг системы исполнителей с разными ролями, возможностями и ограничениями.
@focus article.agent-pool-mcp.execution-runtime lead:3650 #agent-pool-details.runtime gesture:3050 settle:anchor until:turn-end policy:required
@scroll article.agent-pool-mcp.work-branch at:"поручить реализацию одному агенту" lead:2500 #agent-pool-details.work:scroll gesture:800 clip:01
@marker route article.agent-pool-mcp.work-branch series:agent-pool-review at:"поручить реализацию одному агенту" lead:1500 #agent-pool-details.work gesture:1200 after:agent-pool-details.work:scroll policy:required
@scroll article.agent-pool-mcp.review-branch at:"независимую проверку результата другому" lead:2500 #agent-pool-details.review:scroll gesture:800 clip:02
@marker route article.agent-pool-mcp.review-branch series:agent-pool-review at:"независимую проверку результата другому" lead:1500 #agent-pool-details.review gesture:1200 after:agent-pool-details.review:scroll policy:required
@scroll article.agent-pool-mcp.result at:"общий структурированный ответ" lead:2500 #agent-pool-details.result:scroll gesture:800 clip:03
@marker route article.agent-pool-mcp.result series:agent-pool-review at:"общий структурированный ответ" lead:1500 #agent-pool-details.result gesture:1200 after:agent-pool-details.result:scroll policy:required
