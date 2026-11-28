---
id: symbiote-ui-details
lang: ru-RU
source: cv-show-presentation-project
revision: 121
---

# CV Show

## [symbiote-ui-details | mode=read] symbiote-ui-details
@audio ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/clips/18-detail-symbiote-ui-details-6a21c91a79b6.opus
@align ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/aligned/18-detail-symbiote-ui-details.json
Я развиваю Symbiote UI как библиотеку нейтральных интерфейсных блоков. Главная идея в том, что интерфейсы должны быть компонуемыми программно. Компонент при этом представляет собой не только визуальный элемент. Он может публиковать свою роль, состояние и безопасные действия. Для этого используются манифесты и семантические контракты. В том числе Веб эм си пи контракты. Так агент получает не набор пикселей, а понятную модель возможностей интерфейса. Например, он может знать, что перед ним список заявок, какая заявка выбрана, какие действия разрешены и какие данные связаны с текущим состоянием. Workspace использует этот каталог, когда собирает конкретную рабочую среду. Продуктовый смысл появляется уже на уровне конфигурации. Один и тот же нейтральный блок может использоваться в совершенно разных предметных областях. Для меня это принципиальное разделение. Библиотека предоставляет переиспользуемые возможности. А конкретный продукт или рабочий процесс придаёт им смысл. И за счёт того, что эти возможности описаны семантически, агент может работать с интерфейсом на том же уровне, на котором с ним работает человек.
@select article.symbiote-ui.programmatic-composition lead:3750 #symbiote-ui-details.composition gesture:3150 settle:anchor policy:required
@scroll article.symbiote-ui.provider-catalog at:"публиковать свою роль, состояние" lead:2650 #symbiote-ui-details.catalog:scroll gesture:1000 clip:01
@focus article.symbiote-ui.provider-catalog at:"публиковать свою роль, состояние" lead:1450 #symbiote-ui-details.catalog gesture:1200 after:symbiote-ui-details.catalog:scroll policy:required
@scroll article.symbiote-ui.manifest-demo at:"манифесты и семантические контракты" lead:2250 #symbiote-ui-details.manifest:scroll gesture:1000 clip:02
@click article.symbiote-ui.manifest-demo at:"манифесты и семантические контракты" lead:1050 #symbiote-ui-details.manifest gesture:800 after:symbiote-ui-details.manifest:scroll policy:required
@scroll article.symbiote-ui.workspace-link at:"Workspace использует этот каталог" lead:2500 #symbiote-ui-details.workspace-route:scroll gesture:800 clip:03
@marker arrow article.symbiote-ui.workspace-link series:symbiote-ui-workspace at:"Workspace использует этот каталог" lead:1500 #symbiote-ui-details.workspace-route gesture:1200 after:symbiote-ui-details.workspace-route:scroll policy:required
