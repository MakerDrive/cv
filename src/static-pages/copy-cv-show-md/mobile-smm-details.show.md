---
id: mobile-smm-details
lang: ru-RU
source: cv-show-presentation-project
revision: 121
---

# CV Show

## [mobile-smm-details | mode=read] mobile-smm-details
@audio ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/clips/26-detail-mobile-smm-details-ce4311f6dafe.opus
@align ../copy-cv-show-audio/barzana-2/28e4b6f981c84e043c5bcdac434df78016e91cd38305cf80961a1e6eb8ad5bcd/aligned/26-detail-mobile-smm-details.json
В центре системы находится модель профилей, аккаунтов, медиаматериалов и публикаций. Сервер управляет расписанием, очередью и подключёнными Андроид устройствами. Для стабильных участков процесса используется заранее подготовленный сценарий в формате джейсон. Он выполняет известный путь и записывает результат в журнал. Это дешевле и надёжнее, чем просить модель заново рассуждать на каждом обычном шаге. Но мобильный интерфейс может измениться. Если структура экрана больше не соответствует ожидаемому сценарию, исполнитель не должен продолжать нажимать вслепую. Он останавливается в безопасной точке. После этого агент анализирует новое состояние интерфейса и готовит обновлённый вариант сценария. Этот вариант сначала передаётся на проверку. Исходящие действия проходят через лимиты, устойчивую дедупликацию и подтверждение. Поэтому повторный запуск процесса не должен случайно дублировать уже выполненное действие. Здесь я соединяю детерминированную автоматизацию там, где она работает хорошо, и агентную адаптацию там, где действительно появляется неопределённость.
@focus article.mobile-smm-platform.media-gallery lead:3650 #mobile-smm-details.gallery gesture:3050 settle:anchor until:turn-end policy:required
@scroll article.mobile-smm-platform.schedule at:"Сервер управляет расписанием, очередью" lead:2650 #mobile-smm-details.schedule:scroll gesture:1000 clip:01
@focus article.mobile-smm-platform.schedule at:"Сервер управляет расписанием, очередью" lead:1450 #mobile-smm-details.schedule gesture:1200 after:mobile-smm-details.schedule:scroll policy:required
@scroll article.mobile-smm-platform.queue at:"подготовленный сценарий в формате джейсон" lead:2650 #mobile-smm-details.queue:scroll gesture:1000 clip:02
@focus article.mobile-smm-platform.queue at:"подготовленный сценарий в формате джейсон" lead:1450 #mobile-smm-details.queue gesture:1200 after:mobile-smm-details.queue:scroll policy:required
@scroll article.mobile-smm-platform.ui-change-demo at:"структура экрана больше не соответствует" lead:2250 #mobile-smm-details.ui-change:scroll gesture:1000 clip:03
@click article.mobile-smm-platform.ui-change-demo at:"структура экрана больше не соответствует" lead:1050 #mobile-smm-details.ui-change gesture:800 after:mobile-smm-details.ui-change:scroll policy:required
@scroll article.mobile-smm-platform.local-demo at:"Этот вариант сначала передаётся на проверку" lead:2250 #mobile-smm-details.draft:scroll gesture:1000 clip:04
@click article.mobile-smm-platform.local-demo at:"Этот вариант сначала передаётся на проверку" lead:1050 #mobile-smm-details.draft gesture:800 after:mobile-smm-details.draft:scroll policy:required
@scroll article.mobile-smm-platform.approval-log at:"лимиты, устойчивую дедупликацию и подтверждение" lead:2650 #mobile-smm-details.approval:scroll gesture:1000 clip:05
@focus article.mobile-smm-platform.approval-log at:"лимиты, устойчивую дедупликацию и подтверждение" lead:1450 #mobile-smm-details.approval gesture:1200 after:mobile-smm-details.approval:scroll policy:required
