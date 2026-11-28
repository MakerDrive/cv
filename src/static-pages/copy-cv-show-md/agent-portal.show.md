---
id: agent-portal
lang: ru-RU
source: cv-show-presentation-project
revision: 121
---

# CV Show

## [agent-portal | mode=read] agent-portal
@audio ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/clips/05-short-agent-portal-0359c0efc8bd.opus
@align ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/aligned/05-short-agent-portal.json
С начала две тысячи двадцать шестого года я развиваю Agent Portal. Сейчас я постепенно переношу его в Symbiote Workspace как одну из конфигураций. Проект появился как мой собственный управляющий слой над разными агентными средами. По сути это единый процесс поверх разных агентов, моделей и способов доступа к ним. Он позволяет сохранять контроль над контекстом, задачами и ресурсами и при этом менять исполнителей под конкретный этап. Когда я начинал эту линию, я не нашёл готового решения с нужным мне сочетанием возможностей, поэтому стал развивать собственную архитектуру. Часть слоя управления мы открыли как опенсорс проект. А внутри Agent Portal есть два важных инструмента. Agent Pool отвечает за исполнение и распределение ресурсов. Project Graph отвечает за структуру и контекст проекта.
@navigate projects/agent-portal lead:6400 #agent-portal.open gesture:5800 settle:anchor policy:required
@scroll article.agent-portal.process-path at:"собственный управляющий слой" lead:2500 #agent-portal.path:scroll gesture:800 clip:01
@marker route article.agent-portal.process-path series:agent-portal-process at:"собственный управляющий слой" lead:1500 #agent-portal.path gesture:1200 after:agent-portal.path:scroll policy:required
@scroll media/agent-portal/image/process-illustration at:"По сути это единый процесс поверх разных агентов" lead:2700 #agent-portal.illustration-process:scroll gesture:1000 after:agent-portal.open
@focus media/agent-portal/image/process-illustration at:"По сути это единый процесс поверх разных агентов" lead:1500 #agent-portal.illustration-process gesture:1200 after:agent-portal.illustration-process:scroll policy:required
@scroll article.agent-portal.human-decision at:"контроль над контекстом, задачами и ресурсами" lead:3800 #agent-portal.human-decision:scroll gesture:800 clip:02
@marker oval article.agent-portal.human-decision series:agent-portal-process at:"контроль над контекстом, задачами и ресурсами" lead:1500 #agent-portal.human-decision gesture:3000 after:agent-portal.human-decision:scroll policy:required
@scroll article.agent-portal.open-source at:"Часть слоя управления мы открыли" lead:3850 #agent-portal.open-source:scroll gesture:2200 clip:03
@focus article.agent-portal.open-source at:"Часть слоя управления мы открыли" lead:1450 #agent-portal.open-source gesture:1200 after:agent-portal.open-source:scroll policy:required
@scroll project-link.agent-portal.github at:"А внутри Agent Portal есть два важных инструмента" lead:2650 #agent-portal.github-link:scroll gesture:1000 clip:04
@focus project-link.agent-portal.github at:"А внутри Agent Portal есть два важных инструмента" lead:1450 #agent-portal.github-link gesture:1200 after:agent-portal.github-link:scroll policy:required
@scroll project-link.agent-portal.demo at:"Project Graph отвечает за структуру" lead:2500 #agent-portal.demo-link:scroll gesture:800 clip:05
@marker arrow project-link.agent-portal.demo at:"Project Graph отвечает за структуру" lead:1500 #agent-portal.demo-link gesture:1200 after:agent-portal.demo-link:scroll policy:required
