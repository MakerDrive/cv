---
id: project-graph-details
lang: ru-RU
source: cv-show-presentation-project
revision: 121
---

# CV Show

## [project-graph-details | mode=read] project-graph-details
@audio ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/clips/24-detail-project-graph-details-b3c5466b2fd6.opus
@align ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/aligned/24-detail-project-graph-details.json
Project Graph анализирует структуру репозитория и готовит несколько представлений одного проекта. Это зависимости, скелеты кода, компактная карта и проверяемые факты. Цель здесь не в том, чтобы загрузить весь репозиторий в контекст модели. Наоборот. Сначала строится компактная структура. После этого сильная модель получает только тот участок, который действительно нужен для конкретной задачи. Отдельно система может хранить факты браузерной или другой внешней проверки. То есть модель получает не только пересказ кода, но и структурированный контекст с происхождением конкретной информации. Более быстрая и дешёвая модель может заниматься построением карты. А более сильная модель использовать уже сфокусированный контекст для решения сложной задачи. Я рассматриваю этот слой как практический context engineering. То есть как управление тем, какую структуру проекта модель видит, в каком объёме и с какими связями.
@focus article.project-graph-mcp.repository-root lead:3650 #project-graph-details.root gesture:3050 settle:anchor until:turn-end policy:required
@scroll article.project-graph-mcp.compact-skeleton at:"скелеты кода, компактная карта" lead:2650 #project-graph-details.skeleton:scroll gesture:1000 clip:01
@focus article.project-graph-mcp.compact-skeleton at:"скелеты кода, компактная карта" lead:1450 #project-graph-details.skeleton gesture:1200 after:project-graph-details.skeleton:scroll policy:required
@scroll article.project-graph-mcp.browser-fact at:"факты браузерной или другой внешней проверки" lead:2150 #project-graph-details.fact:scroll gesture:1000 clip:02
@select article.project-graph-mcp.browser-fact at:"факты браузерной или другой внешней проверки" lead:950 #project-graph-details.fact gesture:650 after:project-graph-details.fact:scroll policy:required
@scroll article.project-graph-mcp.focus-zone at:"уже сфокусированный контекст" lead:2650 #project-graph-details.focus:scroll gesture:1000 clip:03
@focus article.project-graph-mcp.focus-zone at:"уже сфокусированный контекст" lead:1450 #project-graph-details.focus gesture:1200 after:project-graph-details.focus:scroll policy:required
