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
@focus article.lifecycle-messaging-platform.product-surfaces lead:3650
@scroll article.lifecycle-messaging-platform.backend-runtime at:"Эй пи ай и база PostgreSQL" lead:2650
@focus article.lifecycle-messaging-platform.backend-runtime at:"Эй пи ай и база PostgreSQL" lead:1450
@scroll article.lifecycle-messaging-platform.delivery-ops at:"управляли пулами джи эс эм модемов" lead:2650
@focus article.lifecycle-messaging-platform.delivery-ops at:"управляли пулами джи эс эм модемов" lead:1450
@scroll article.lifecycle-messaging-platform.delivery-flow at:"очередь, повторяемое выполнение" lead:2500
@marker route article.lifecycle-messaging-platform.delivery-flow at:"очередь, повторяемое выполнение" lead:1500
@scroll article.lifecycle-messaging-platform.digital-twin at:"локальный Digital Twin" lead:2500
@marker parallel-route article.lifecycle-messaging-platform.digital-twin at:"локальный Digital Twin" lead:1500
