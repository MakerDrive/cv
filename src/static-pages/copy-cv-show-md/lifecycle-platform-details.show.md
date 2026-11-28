---
id: lifecycle-platform-details
lang: ru-RU
source: cv-show-presentation-project
revision: 121
---

# CV Show

## [lifecycle-platform-details | mode=read] lifecycle-platform-details
@audio ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/clips/25-detail-lifecycle-platform-details-478e45575080.opus
@align ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/aligned/25-detail-lifecycle-platform-details.json
Этот проект соединял сразу несколько разных слоёв. Был веб продукт. Была серверная инфраструктура. И был физический контур доставки через модемы. Эй пи ай и база PostgreSQL хранили продуктовые данные и состояние системы. WebSocket связывал сервер с удалёнными исполнительными инстансами. Эти инстансы управляли пулами джи эс эм модемов через serial интерфейс и эй ти команды. В таком контуре нельзя исходить из того, что сеть и устройство всегда находятся в идеальном состоянии. Связь может пропасть. Модем может изменить состояние. Удалённый инстанс может перезапуститься. Поэтому очередь, повторяемое выполнение, состояние задач и мониторинг были частью самой архитектуры. Я старался сделать процесс восстанавливаемым и наблюдаемым на каждом этапе. При этом тестировать всё только на реальном пуле модемов неудобно и дорого. Поэтому я сделал локальный Digital Twin. Он воспроизводил физический контур виртуальными устройствами и позволял повторять нужные сценарии локально.
@focus article.lifecycle-messaging-platform.product-surfaces lead:3650 #lifecycle-details.product gesture:3050 settle:anchor until:turn-end policy:required
@scroll article.lifecycle-messaging-platform.backend-runtime at:"Эй пи ай и база PostgreSQL" lead:2650 #lifecycle-details.runtime:scroll gesture:1000 clip:01
@focus article.lifecycle-messaging-platform.backend-runtime at:"Эй пи ай и база PostgreSQL" lead:1450 #lifecycle-details.runtime gesture:1200 after:lifecycle-details.runtime:scroll policy:required
@scroll article.lifecycle-messaging-platform.delivery-ops at:"управляли пулами джи эс эм модемов" lead:2650 #lifecycle-details.delivery:scroll gesture:1000 clip:02
@focus article.lifecycle-messaging-platform.delivery-ops at:"управляли пулами джи эс эм модемов" lead:1450 #lifecycle-details.delivery gesture:1200 after:lifecycle-details.delivery:scroll policy:required
@scroll article.lifecycle-messaging-platform.delivery-flow at:"очередь, повторяемое выполнение" lead:2500 #lifecycle-details.route:scroll gesture:800 clip:03
@marker route article.lifecycle-messaging-platform.delivery-flow series:lifecycle-delivery at:"очередь, повторяемое выполнение" lead:1500 #lifecycle-details.route gesture:1200 after:lifecycle-details.route:scroll policy:required
@scroll article.lifecycle-messaging-platform.digital-twin at:"локальный Digital Twin" lead:2500 #lifecycle-details.twin:scroll gesture:800 clip:04
@marker parallel-route article.lifecycle-messaging-platform.digital-twin series:lifecycle-twin at:"локальный Digital Twin" lead:1500 #lifecycle-details.twin gesture:1200 after:lifecycle-details.twin:scroll policy:required
