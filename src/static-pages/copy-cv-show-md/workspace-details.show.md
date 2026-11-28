---
id: workspace-details
lang: ru-RU
source: cv-show-presentation-project
revision: 121
---

# CV Show

## [workspace-details | mode=read] workspace-details
@audio ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/clips/17-detail-workspace-details-aef13d1023d1.opus
@align ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/aligned/17-detail-workspace-details.json
Если посмотреть глубже, основной объект Workspace это не заранее написанное приложение, а конфигурация рабочей среды. В ней задаются компоновка, панели, модули, действия и связи между ними. Агент выбирает подходящие готовые блоки, формирует конфигурацию, проверяет её и собирает интерфейс в браузере. Это важно, потому что агент не генерирует каждый раз произвольный интерфейс с нуля. Он работает с известными компонентами и с понятными контрактами. Конфигурацию можно изменять уже во время работы. Например, добавить новую панель, перестроить рабочий процесс или открыть другой инструмент, не пересобирая отдельное приложение целиком. После этого состояние можно сохранить и открыть в другом совместимом хост приложении. При этом секреты, авторизация и пользовательские данные не нужно переносить внутрь самой конфигурации. Они остаются на стороне хоста. Для меня это позволяет разделить две вещи. Есть переносимое описание рабочего процесса. И есть конкретная среда, которая предоставляет ему доступ к данным, авторизации и инфраструктуре. Я развиваю Workspace как общий слой для специализированных рабочих процессов, а не как одно приложение для одной предметной области.
@focus article.symbiote-workspace.config-flow lead:3650 #workspace-details.flow-frame gesture:3050 settle:anchor until:turn-end policy:required
@scroll article.symbiote-workspace.config-flow at:"Агент выбирает подходящие готовые блоки" lead:2500 #workspace-details.flow-route:scroll gesture:800 clip:01
@marker route article.symbiote-workspace.config-flow series:workspace-config-flow at:"Агент выбирает подходящие готовые блоки" lead:1500 #workspace-details.flow-route gesture:1200 after:workspace-details.flow-route:scroll policy:required
@scroll article.symbiote-workspace.config-artifact at:"Конфигурацию можно изменять уже во время работы" lead:2650 #workspace-details.artifact:scroll gesture:1000 clip:02
@focus article.symbiote-workspace.config-artifact at:"Конфигурацию можно изменять уже во время работы" lead:1450 #workspace-details.artifact gesture:1200 after:workspace-details.artifact:scroll policy:required
@scroll article.symbiote-workspace.host-examples at:"Они остаются на стороне хоста" lead:2650 #workspace-details.hosts:scroll gesture:1000 clip:03
@focus article.symbiote-workspace.host-examples at:"Они остаются на стороне хоста" lead:1450 #workspace-details.hosts gesture:1200 after:workspace-details.hosts:scroll policy:required
