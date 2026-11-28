---
id: symbiote-engine-details
lang: ru-RU
source: cv-show-presentation-project
revision: 121
---

# CV Show

## [symbiote-engine-details | mode=read] symbiote-engine-details
@audio ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/clips/19-detail-symbiote-engine-details-28b9fe41bc68.opus
@align ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/aligned/19-detail-symbiote-engine-details.json
Symbiote Engine предоставляет компонуемые серверные примитивы. Это обработчики, команды, графы выполнения и хранение состояния. Идея здесь похожа на Symbiote UI. Я не хочу жёстко зашивать всю серверную логику внутрь одного продукта. Продукт может собрать свой процесс из небольших функциональных блоков. Workspace затем связывает этот процесс с интерфейсом и переносимой конфигурацией. Получается отдельный визуальный слой, отдельный исполнительный слой и понятный контракт между ними. Я специально сохраняю это разделение. Engine должен оставаться пригодным не только для Workspace. Его можно использовать в разных сервисах и рабочих средах, где нужен граф исполнения, состояние и управляемая автоматизация.
@focus article.symbiote-engine.layer-diagram lead:3650 #symbiote-engine-details.layers gesture:3050 settle:anchor until:turn-end policy:required
@scroll article.symbiote-engine.readonly-graph-demo at:"Продукт может собрать свой процесс" lead:2150 #symbiote-engine-details.execution:scroll gesture:1000 clip:01
@select article.symbiote-engine.readonly-graph-demo at:"Продукт может собрать свой процесс" lead:950 #symbiote-engine-details.execution gesture:650 after:symbiote-engine-details.execution:scroll policy:required
@scroll article.symbiote-engine.readonly-graph-demo at:"Workspace затем связывает этот процесс" lead:2250 #symbiote-engine-details.demo:scroll gesture:1000 clip:02
@click article.symbiote-engine.readonly-graph-demo at:"Workspace затем связывает этот процесс" lead:1050 #symbiote-engine-details.demo gesture:800 after:symbiote-engine-details.demo:scroll policy:optional
