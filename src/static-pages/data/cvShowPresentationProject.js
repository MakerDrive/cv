import {
  createPresentationAuthoringProject,
  createPresentationAuthoringProjectHashes,
  createPresentationAuthoringTimelineProjection,
  validatePresentationAuthoringProject,
} from 'symbiote-workspace/browser';

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (let child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

export const CV_SHOW_AUTHORING_PROJECT_INPUT = freezeDeep(
/* CV_SHOW_AUTHORING_PROJECT_INPUT:START */
{
  "cells": [
    {
      "dependsOn": [],
      "id": "cv-show:narration:positioning",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "positioning",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Привет, я Владимир. Я ар эн ди-инженер: нахожу проблемы и продуктовые возможности, формулирую задачи, придумываю решения и довожу их до работающего результата — самостоятельно или отвечая за свою часть работы в команде. Сейчас мой основной фокус — программные платформы и агентные продукты. В этой презентации я покажу, как этот ар эн ди-подход работает в разных предметных областях — от программных платформ до медиа и оборудования — и отдельно обозначу свою роль в каждом проекте."
      },
      "turnId": "positioning"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-workspace",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-workspace",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Начну с текущего центра моей работы. С середины две тысячи двадцать шестого года я развиваю Симбиот Воркспейс — универсальную среду, где агент собирает рабочее пространство под конкретную задачу. Результат сохраняется как переносимая исполняемая конфигурация. Некоторые мои текущие проекты появились раньше Воркспейса и теперь постепенно становятся его конфигурациями."
      },
      "turnId": "symbiote-workspace"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-ui",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-ui",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Визуальную основу Воркспейса даёт оупен сорс библиотека Симбиот ю-ай. В ней собраны компоненты, компоновки, графовые инструменты и семантические контракты интерфейса. На её основе построен и весь интерфейс этого си-ви: навигация, рабочие панели, чат и плеер презентации. Исходный код и техническое описание доступны на Гитхаб, а прямо в этой презентации можно открыть подробный разбор проекта."
      },
      "turnId": "symbiote-ui"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-engine",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-engine",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Функциональные блоки даёт Symbiote Engine. Это серверная библиотека для сервисов, графов выполнения и автоматизации. Workspace соединяет визуальные блоки UI с этим исполнительным слоем в одной конфигурации."
      },
      "turnId": "symbiote-engine"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:agent-portal",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "agent-portal",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Эйджент Портал — один из проектов, которые я сейчас переношу в Симбиот Воркспейс как конфигурации. Я развиваю его с начала две тысячи двадцать шестого года. Проект появился как собственный управляющий слой над разными агентными средами — своего рода харнесс над харнессес. Он объединяет их в один видимый процесс и позволяет сохранять контроль над контекстом, задачами и ресурсами, при этом быстро меняя агентов, модели и способы доступа к ним. Когда я начинал эту линию, я не нашёл готового решения с таким сочетанием возможностей, поэтому стал развивать собственный вариант. Мы решили открыть управляющий контур эм-си-пи эйджент портал, хотя развиваем Эйджент Портал прежде всего для собственной практической работы. Исходный код этого контура доступен на Гитхаб, а интерфейс Эйджент Портал можно посмотреть в интерактивном демо. Чтобы показать его внутреннее устройство, дальше я разберу два отдельных инструмента. Эйджент Пул эм-си-пи отвечает за исполнение и распределение ресурсов, а Проджект Граф эм-си-пи — за структуру и контекст проекта."
      },
      "turnId": "agent-portal"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-video-studio",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-video-studio",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Ещё один актуальный проект — Симбиот Видео Студио. Материалы, граф, таймлайн, предпросмотр и рендер собраны здесь в один видимый процесс. Агент работает с семантическими элементами интерфейса, а человек может проверить каждый этап. Сейчас Студио оформляется как конфигурация Симбиот Воркспейс."
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:adaptive-maximo-workbench",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "adaptive-maximo-workbench",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Следующий пример — Adaptive Maximo Workbench. Он показывает, как заявки, оборудование, локации, бригады и доступные действия собираются в одном рабочем пространстве с общим актуальным контекстом. Сейчас это Demo/Alpha возможностей Workspace. Подключение к реальному Maximo выполняется как отдельная интеграция."
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:agent-pool-mcp",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "agent-pool-mcp",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В начале две тысячи двадцать шестого года Эйджент Пул эм-си-пи оформился как самостоятельный эм-си-пи-сервер, который можно напрямую подключить к агенту. В Эйджент Портал он используется как исполнительный слой: распределяет задачи между агентами, отслеживает владение и состояние, передаёт сессии и маршрутизирует ресурсы."
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:project-graph-mcp",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "project-graph-mcp",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Второй инструмент — Проджект Граф эм-си-пи, самостоятельный оупен сорс эм-си-пи-сервер для навигации по кодовой базе. Он строит компактный граф репозитория, который в Эйджент Портал отображается как визуальная карта проекта. Человек может выбрать интересующий узел, а агент — раскрыть для нужной части зависимости, скелеты кода, документацию и более подробный контекст. Так человек и агент работают с одной структурой проекта, а модель получает релевантные проверяемые факты, не перечитывая весь репозиторий. Исходный код доступен на Гитхаб, а интерактивное демо доступно по соседней ссылке."
      },
      "turnId": "project-graph-mcp"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:lifecycle-messaging-platform",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "lifecycle-messaging-platform",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Теперь вернусь к периоду с две тысячи двадцать второго по две тысячи двадцать шестой год и к Лайфсайкл Месседжинг Платформ. Это маркетинговая платформа для автоматизации клиентских коммуникаций: сегментация аудитории, управление кампаниями, опт-ин эс-эм-эс сценарии и аналитика. Я проектировал эй-пи-ай, распределение заданий, связь с удалёнными инстансами, мониторинг и инструменты эксплуатации. Для проверки модемного контура я сделал локальный Диджитал Твин с виртуальными устройствами и воспроизводимыми сценариями."
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:mobile-smm-platform",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "mobile-smm-platform",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Отдельный прикладной кейс — мобильная эс-эм-эм платформа для управляемой работы с несколькими профилями. В одном контуре собраны медиаматериалы, публикации, расписание, входящие обращения и очередь. Андроид-устройства выполняют стабильные операции по готовым сценариям. При изменении интерфейса агент останавливает процесс, анализирует экран и готовит обновление сценария для проверки. Лимиты, дедупликация, согласование и журнал сохраняют управляемость действий."
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:f360-studio",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "f360-studio",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Теперь вернусь по истории программно-аппаратных проектов. В две тысячи двадцать первом — две тысячи двадцать втором годах я основал и вёл эф триста шестьдесят Студио — проект высокоточного три дэ-сканирования. Я выстраивал процесс от физической съёмочной установки и управляемого света до геометрии, текстур и готовой презентации модели. При переезде в Аргентину физическую производственную базу пришлось закрыть."
      },
      "turnId": "f360-studio"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:autobox",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "autobox",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Перед эф триста шестьдесят была музейная технология Автобокс, которую я развивал в две тысячи девятнадцатом — две тысячи двадцать первом годах. Здесь показана предварительная три дэ-визуализация оборудования Автобокс. Я подготовил её ещё до сборки установки, чтобы представить будущую конструкцию партнёрам, с которыми мы работали над три дэ-сканированием музейных объектов в Эрмитаже. Здесь я отлаживаю процесс фотограмметрии на поворотном столе ФотоПицца. Это один из предварительных экспериментов, проведённых до разработки установки для Эрмитажа. Здесь показан промежуточный результат той же отладки в Реалити Кэпчер. Слева видны исходные фотографии позолоченного Будды, а в три дэ-пространстве я вращаю уже обработанную модель и проверяю результат фотограмметрии перед разработкой оборудования для Эрмитажа. Здесь я собственноручно изготавливаю одну из деталей Автобокс версии один — лазером вырезаю вентиляционную сетку для светового модуля. Здесь собранный прототип Автобокс версии один сканирует нэцке в Эрмитаже. Здесь — вводный ролик эрмитажной серии „Нэцке под увеличительным стеклом“. Представленные в ней нэцке я собственноручно сканировал и визуализировал во время отладки технологии Автобокс. Для того же позолоченного Будды я сделал художественную три дэ-визуализацию. Она показывает качество сканирования сложного металлического объекта: сохранились мелкие детали, повреждения и царапины. Здесь — художественная визуализация могольского кинжала из собрания Эрмитажа. Сочетание полированного металла, позолоты и инкрустации драгоценными камнями делало его особенно сложным для фотограмметрии, но нам удалось сохранить и форму, и детали разных материалов. Здесь — художественная визуализация головы королевы-матери из Королевства Бенин. Сканирование точно передало сложный рельеф и патину бронзовой поверхности."
      },
      "turnId": "autobox"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:complexscan",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "complexscan",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "Теперь вернусь к Комплексскан — коммерческой линии оборудования, чьи разработки стали частью технической базы Автобокс. Я развивал Комплексскан в две тысячи семнадцатом — две тысячи двадцать втором годах. В линию входили прозрачные платформы для бестеневой съёмки предметов в формате фото триста шестьдесят и для три дэ-сканирования. Здесь я демонстрирую одну из таких платформ и веб-приложение, из которого управляю ею. Здесь я показываю обновлённые версии поворотной платформы Комплексскан и веб-приложения для управления ею. Я проектировал оборудование и метод съёмки как единый продукт и довёл линию до первых международных поставок. Отдельным прикладным проектом стал БутБот — система автоматизации каталожной съёмки винных бутылок непосредственно на складе заказчика. Система объединяла компактную съёмочную будку, управляемые световые панели, моторизированную камеру, пресеты съёмки и автоматическую обработку фотографий. Световая сцена была заранее настроена для бестеневой съёмки и контролируемых бликов, поэтому фотографии практически не требовали ручной коррекции. Система автоматически отделяла бутылку от фона, оптимизировала изображение и выдавала готовый материал для каталога. Благодаря этому сотрудники без студийного опыта могли получать повторяемый результат прямо на складе. Следующим этапом должна была стать прямая публикация готовых фотографий на сайте, но после моего переезда в Аргентину развитие проекта было приостановлено."
      },
      "turnId": "complexscan"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:photopizza",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "photopizza",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "В начале этой линии была ФотоПицца, которую я развивал с две тысячи десятого года. Проект появился внутри Мегавизор как инструмент для повторяемой съёмки фото триста шестьдесят. Здесь показан ускоренный демонстрационный ролик о сборке первой версии ФотоПицца — без подробной инструкции. Это промо Мегавизор, где показан весь спектр поддерживаемого контента, включая фото триста шестьдесят объектов. Я продумал механику, электронику, прошивку, документацию и упаковку. Таймлапс сборки прототипа ФотоПицца из конструкционного алюминиевого профиля и шагового двигателя. Позже ФотоПицца стала оупен сорс проектом. Здесь я показываю, как собрать простую поворотную платформу из подноса ИКЕА и вручную снять фото триста шестьдесят. Такие демонстрационные ролики я продюсировал для Мегавизор, чтобы популяризировать формат и снизить порог входа в технологию. Здесь я показываю новое веб-приложение ФотоПицца: с телефона запускаю съёмку и по вай-фай управляю поворотным столом и камерой через веб-приложение. Универсальный блок управления работал с поворотными платформами, слайдером камеры и моторизированной панорамной головкой. На грузовой поворотной платформе ФотоПицца мы снимали в формате фото триста шестьдесят даже тяжёлые объекты, включая мотоциклы. Проект продолжал развиваться до моего переезда в Аргентину в две тысячи двадцать втором году."
      },
      "turnId": "photopizza"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:finale",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "conclude",
        "id": "finale",
        "persona": "vladimir",
        "sourceRefs": [],
        "text": "А теперь вернусь в настоящее. От программно-аппаратных систем для съёмки я пришёл к распределённой инфраструктуре и текущим агентным рабочим средам. Во всех этих проектах я соединяю исследование, архитектуру и реализацию в работающий процесс с понятными границами и проверяемым результатом. Сейчас главным центром этой работы стал Symbiote Workspace. Здесь можно продолжить знакомство с проектами, открыть резюме или связаться со мной."
      },
      "turnId": "finale"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:workspace-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "workspace-details",
        "persona": "vladimir",
        "replyTo": "symbiote-workspace",
        "sourceRefs": [],
        "text": "Рабочая среда описывается конфигурацией: в ней задаются компоновка, панели, модули, действия и связи. Агент подбирает готовые блоки, валидирует конфигурацию и собирает интерфейс в браузере. Конфигурацию можно обновлять во время работы, сохранять и открывать в совместимом host-приложении. Секреты, авторизация и пользовательские данные остаются на стороне host. Я развиваю эту архитектуру как общий слой для специализированных рабочих процессов."
      },
      "turnId": "workspace-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-ui-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-ui-details",
        "persona": "vladimir",
        "replyTo": "symbiote-ui",
        "sourceRefs": [],
        "text": "Я развиваю Symbiote UI как библиотеку интерфейсных блоков, которые можно компоновать программно и описывать для агентов. Компоненты публикуют роли, состояния и безопасные действия через манифесты и WebMCP-контракты. Workspace использует этот каталог при сборке рабочей среды. Продуктовый смысл добавляет конкретная конфигурация, а библиотека сохраняет нейтральные переиспользуемые возможности."
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:symbiote-engine-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "symbiote-engine-details",
        "persona": "vladimir",
        "replyTo": "symbiote-engine",
        "sourceRefs": [],
        "text": "Symbiote Engine предоставляет компонуемые серверные примитивы: обработчики, команды, графы и хранение состояния. Продукт собирает из них свой backend-процесс, а Workspace связывает исполнение с переносимой конфигурацией интерфейса. Я сохраняю разделение слоёв, чтобы Engine можно было использовать в разных рабочих средах и сервисах."
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:agent-portal-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "agent-portal-details",
        "persona": "vladimir",
        "replyTo": "agent-portal",
        "sourceRefs": [],
        "text": "Agent Portal — мой open-source проект. Я придумал и реализовал его архитектуру, а в работе мы использовали его как общую среду для агентной разработки. В центре находится исполняемая канбан-доска: каждая колонка запускает часть процесса и может получить свои действия, роли и пул специализированных агентов. Для задач с кодом система создаёт изолированную рабочую копию и ветку. Один агент выполняет работу, другой независимо проверяет результат. Успешный аудит открывает путь к публикации, а конфликт переводит карточку к решению человека. Модели и подписки объединяются в группы ресурсов, поэтому этап получает исполнителя с подходящими возможностями и доступным лимитом."
      },
      "turnId": "agent-portal-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:video-studio-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "video-studio-details",
        "persona": "vladimir",
        "replyTo": "symbiote-video-studio",
        "sourceRefs": [],
        "text": "В основе Studio лежит ядро Symbiote Video. Агент описывает структуру ролика семантической JSON-схемой: сцены, слои, клипы и переходы. Движок превращает описание в граф, таймлайн и композицию. В рабочей среде можно проверить node graph, запустить live preview, сохранить состояние и перейти к экспорту. Видео-ядро уже работает, а Studio как универсальная конфигурация Workspace продолжает развиваться в alpha-режиме."
      },
      "turnId": "video-studio-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:maximo-workbench-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "maximo-workbench-details",
        "persona": "vladimir",
        "replyTo": "adaptive-maximo-workbench",
        "sourceRefs": [],
        "text": "В этом demo Workspace получает предметную конфигурацию для обслуживания оборудования. Панели связывают заявки, активы, локации, бригады и безопасные действия. Агент читает тот же актуальный контекст, который видит человек, и работает через объявленные действия интерфейса. Этот контур проверяет архитектуру Workspace на корпоративном процессе. Реальные данные, авторизация и Maximo API подключаются отдельным интеграционным слоем."
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:agent-pool-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "agent-pool-details",
        "persona": "vladimir",
        "replyTo": "agent-pool-mcp",
        "sourceRefs": [],
        "text": "Я создавал Agent Pool MCP как независимый слой исполнения для разных CLI-агентов и моделей. Он поддерживает параллельные задачи, последовательные pipelines, handoff сессий, политики и группы ресурсов. Один процесс может поручить реализацию одному агенту, а независимую проверку — другому. В сценариях cross-model peer review агенты разных провайдеров сравнивают выводы и возвращают общий структурированный результат."
      },
      "turnId": "agent-pool-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:project-graph-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "project-graph-details",
        "persona": "vladimir",
        "replyTo": "project-graph-mcp",
        "sourceRefs": [],
        "text": "Project Graph MCP анализирует структуру репозитория и готовит несколько представлений: зависимости, скелеты кода, краткую карту проекта и факты браузерной проверки. Более быстрая модель может собрать эту карту, а сильная модель получает сфокусированный контекст для решения. Я использую этот слой как context engineering и структурированное извлечение с графовыми связями."
      },
      "turnId": "project-graph-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:lifecycle-platform-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "lifecycle-platform-details",
        "persona": "vladimir",
        "replyTo": "lifecycle-messaging-platform",
        "sourceRefs": [],
        "text": "Платформа соединяла веб-продукт, серверную инфраструктуру и физическую доставку через модемы. API и PostgreSQL хранили продуктовые данные, WebSocket связывал runtime, а распределённые инстансы управляли пулами GSM-модемов через serial и AT-команды. Связь и устройства могли менять состояние, поэтому очередь, повторяемое выполнение и мониторинг сохраняли управляемость процесса. Digital Twin воспроизводил физический контур для локальной проверки. В одном историческом эксперименте создание материалов и их проверка работали как независимые контуры с разными правилами оценки."
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:mobile-smm-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "mobile-smm-details",
        "persona": "vladimir",
        "replyTo": "mobile-smm-platform",
        "sourceRefs": [],
        "text": "В центре системы находится модель профилей, аккаунтов, медиаматериалов и публикаций. Сервер управляет расписанием, очередью и подключёнными Android-устройствами. Готовый JSON-сценарий выполняет стабильный путь и записывает результат в журнал. Если структура экрана изменилась, исполнитель останавливается в безопасной точке. Агент анализирует актуальный экран, готовит обновлённый сценарий и передаёт его на проверку. Исходящие действия проходят через лимиты, устойчивую дедупликацию и approval. Демонстрация заканчивается dry-run или подтверждением в журнале без внешней отправки."
      },
      "turnId": "mobile-smm-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:f360-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "f360-details",
        "persona": "vladimir",
        "replyTo": "f360-studio",
        "sourceRefs": [],
        "text": "F триста шестьдесят переносила дисциплину музейной съёмки в коммерческий студийный процесс. Для каждого объекта я планировал ракурсы и свет, контролировал исходные фотографии, проводил фотограмметрическую обработку и проверял геометрию с текстурами. Я собрал единый производственный путь от установки до финальной три D-модели и её публикации. Публичные примеры сохранились на YouTube и в портфолио Sketchfab. Студия завершила работу в две тысячи двадцать втором году во время моего переезда."
      },
      "turnId": "f360-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:autobox-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "autobox-details",
        "persona": "vladimir",
        "replyTo": "autobox",
        "sourceRefs": [],
        "text": "Рабочая система управляла камерой, светом и позиционированием. Она сначала снимала полную серию, после чего компьютерное зрение анализировало материал, оценивало резкость и отбирало исходники для построения три D-модели. Следующий прототип начинал с чернового три D-сканирования и упрощённой формы предмета. Затем он заранее рассчитывал весь план детальной макросъёмки: зоны, ракурсы, положения камеры, параметры оптики, глубину резкости и перекрытие. Расчёт учитывал сложную геометрию предмета, диапазон механики, габариты камеры, препятствия и безопасное расстояние. После проверки принципа я проектировал дополнительные контуры безопасности, включая лидарный контроль расстояния на случай смещения предмета. Этот слой остался следующим этапом разработки. Сама AUTOBOX уже работала в музеях: в Эрмитаже я сканировал японские нэцкэ, а технологическая линия применялась для бенинской бронзы в Кунсткамере."
      },
      "turnId": "autobox-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:complexscan-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "complexscan-details",
        "persona": "vladimir",
        "replyTo": "complexscan",
        "sourceRefs": [],
        "text": "Я придумал ComplexScan как коммерческую линию профессионального оборудования после open-source работы над PhotoPizza. Прозрачный вращающийся диск, стабильная механика и управляемый свет давали чистые исходники для фото триста шестьдесят и фотограмметрии. Я собственноручно собирал прототипы и первые изделия, разбивал конструкцию на детали для профильных подрядчиков, затем выполнял финальную сборку и тестирование. Отдельно я проектировал защитную упаковку, оформлял экспортные документы и организовывал доставки клиентам в разные страны. Внутри этой линии AUTOBOX развивала музейное направление, а бутылочная установка решала задачу повторяемой каталожной съёмки."
      },
      "turnId": "complexscan-details"
    },
    {
      "dependsOn": [],
      "id": "cv-show:narration:photopizza-details",
      "kind": "narration",
      "layerId": "cv-show:layer:narration",
      "turn": {
        "claims": [],
        "dialogueAct": "explain",
        "id": "photopizza-details",
        "persona": "vladimir",
        "replyTo": "photopizza",
        "sourceRefs": [],
        "text": "Изначально PhotoPizza была внутренним инструментом MEGAVISOR — облачного сервиса для фото триста шестьдесят объектов, три D-панорам, видео и виртуальных туров. В MEGAVISOR я разрабатывал технологию и оборудование и составил техническое задание на управляющее ПО; первую Arduino-версию по этому заданию реализовал привлечённый специалист. После MEGAVISOR я сам продолжил управляющее ПО на JavaScript и Espruino. Я подбирал доступные компоненты и подробно описывал сборку с калибровкой, чтобы люди могли собирать свои версии. Один контроллер управлял поворотной платформой, слайдером камеры и автоматической панорамной головкой. Этот открытый проект дал практическую основу для последующих экспериментов ComplexScan и AUTOBOX."
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "profile.experience.15-plus"
      },
      "dependsOn": [],
      "id": "cv-show:cue:positioning.tenure-marker:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "в разных предметных областях"
        },
        "gestureDurationMs": 800,
        "leadMs": 3800,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "profile.experience.15-plus"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:positioning.tenure-marker:scroll"
        }
      ],
      "id": "cv-show:cue:positioning.tenure-marker",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "в разных предметных областях"
        },
        "gestureDurationMs": 2500,
        "leadMs": 2800,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "project-card.symbiote-workspace"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:positioning.tenure-marker"
        }
      ],
      "id": "cv-show:cue:positioning.workspace-transition:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "в каждом проекте"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "project-card.symbiote-workspace"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:positioning.workspace-transition:scroll"
        }
      ],
      "id": "cv-show:cue:positioning.workspace-transition",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "в каждом проекте"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "profile/photo"
      },
      "dependsOn": [],
      "id": "cv-show:cue:positioning.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 8700,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "positioning"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/symbiote-workspace"
      },
      "dependsOn": [],
      "id": "cv-show:cue:workspace.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.intro"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.open"
        }
      ],
      "id": "cv-show:cue:workspace.intro-frame:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "С середины две тысячи двадцать шестого года"
        },
        "gestureDurationMs": 1800,
        "leadMs": 3450,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.intro"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.intro-frame:scroll"
        }
      ],
      "id": "cv-show:cue:workspace.intro-frame",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "С середины две тысячи двадцать шестого года"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.portable-config"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.intro-frame"
        }
      ],
      "id": "cv-show:cue:workspace.portable-config:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Результат сохраняется"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.portable-config"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.portable-config:scroll"
        }
      ],
      "id": "cv-show:cue:workspace.portable-config",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Результат сохраняется"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.agent-portal"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.portable-config"
        }
      ],
      "id": "cv-show:cue:workspace.agent-portal-card:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Некоторые мои текущие проекты"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.agent-portal"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace.agent-portal-card:scroll"
        }
      ],
      "id": "cv-show:cue:workspace.agent-portal-card",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Некоторые мои текущие проекты"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-workspace"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/symbiote-ui"
      },
      "dependsOn": [],
      "id": "cv-show:cue:symbiote-ui.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.graph-tooling"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.open"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.graph-tooling:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "графовые инструменты"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-ui.graph-tooling"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.graph-tooling:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.graph-tooling",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "графовые инструменты"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "portfolio.show-stage"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.graph-tooling"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.current-show:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "весь интерфейс этого си-ви"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "portfolio.show-stage"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui.current-show:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui.current-show",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "весь интерфейс этого си-ви"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-ui"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/symbiote-engine"
      },
      "dependsOn": [],
      "id": "cv-show:cue:symbiote-engine.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.intro"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.open"
        }
      ],
      "id": "cv-show:cue:symbiote-engine.intro:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "серверная библиотека"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-engine.intro"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.intro:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-engine.intro",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "серверная библиотека"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.intro"
        }
      ],
      "id": "cv-show:cue:symbiote-engine.workspace-join:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace соединяет"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine.workspace-join:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-engine.workspace-join",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace соединяет"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-engine"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/agent-portal"
      },
      "dependsOn": [],
      "id": "cv-show:cue:agent-portal.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.process-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.open"
        }
      ],
      "id": "cv-show:cue:agent-portal.path:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "один видимый процесс"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.agent-portal.process-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.path:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal.path",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "один видимый процесс"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.human-decision"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.path"
        }
      ],
      "id": "cv-show:cue:agent-portal.human-decision:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "контроль над контекстом, задачами и ресурсами"
        },
        "gestureDurationMs": 800,
        "leadMs": 3800,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.agent-portal.human-decision"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.human-decision:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal.human-decision",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "контроль над контекстом, задачами и ресурсами"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.open-source"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.human-decision"
        }
      ],
      "id": "cv-show:cue:agent-portal.open-source:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Мы решили открыть управляющий контур"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-portal.open-source"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal.open-source:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal.open-source",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Мы решили открыть управляющий контур"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-portal"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/symbiote-video-studio"
      },
      "dependsOn": [],
      "id": "cv-show:cue:video-studio.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.open"
        }
      ],
      "id": "cv-show:cue:video-studio.visible-process:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "предпросмотр и рендер"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3350,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.visible-process:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio.visible-process",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "предпросмотр и рендер"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.visible-process"
        }
      ],
      "id": "cv-show:cue:video-studio.demo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Агент работает"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio.demo:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio.demo",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Агент работает"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-video-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/adaptive-maximo-workbench"
      },
      "dependsOn": [],
      "id": "cv-show:cue:maximo.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.work-orders"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.open"
        }
      ],
      "id": "cv-show:cue:maximo.work-orders:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "заявки, оборудование"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.work-orders"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.work-orders:scroll"
        }
      ],
      "id": "cv-show:cue:maximo.work-orders",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "заявки, оборудование"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.asset-context"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.work-orders"
        }
      ],
      "id": "cv-show:cue:maximo.asset-context:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "общим актуальным контекстом"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.asset-context"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo.asset-context:scroll"
        }
      ],
      "id": "cv-show:cue:maximo.asset-context",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "общим актуальным контекстом"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "adaptive-maximo-workbench"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/agent-pool-mcp"
      },
      "dependsOn": [],
      "id": "cv-show:cue:agent-pool.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-pool-mcp.execution-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool.open"
        }
      ],
      "id": "cv-show:cue:agent-pool.flow:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "распределяет задачи"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.agent-pool-mcp.execution-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool.flow:scroll"
        }
      ],
      "id": "cv-show:cue:agent-pool.flow",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "распределяет задачи"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-pool-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/project-graph-mcp"
      },
      "dependsOn": [],
      "id": "cv-show:cue:project-graph.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.graph-example"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.open"
        }
      ],
      "id": "cv-show:cue:project-graph.example:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "компактный граф"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.project-graph-mcp.graph-example"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.example:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph.example",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "компактный граф"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.browser-fact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.example"
        }
      ],
      "id": "cv-show:cue:project-graph.context:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "раскрыть для нужной части"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.browser-fact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.context:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph.context",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "раскрыть для нужной части"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.readonly-node"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.context"
        }
      ],
      "id": "cv-show:cue:project-graph.node:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "проверяемые факты"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.readonly-node"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph.node:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph.node",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "проверяемые факты"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-mcp"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/lifecycle-messaging-platform"
      },
      "dependsOn": [],
      "id": "cv-show:cue:lifecycle.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.product-scope"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.open"
        }
      ],
      "id": "cv-show:cue:lifecycle.scope:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "маркетинговая платформа"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3350,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.product-scope"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.scope:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle.scope",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "маркетинговая платформа"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.product-surfaces"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.scope"
        }
      ],
      "id": "cv-show:cue:lifecycle.product-number:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сегментация аудитории"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.product-surfaces"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.product-number:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle.product-number",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сегментация аудитории"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.backend-runtime"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.product-number"
        }
      ],
      "id": "cv-show:cue:lifecycle.runtime-number:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "распределение заданий"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.backend-runtime"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.runtime-number:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle.runtime-number",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "распределение заданий"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.digital-twin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.runtime-number"
        }
      ],
      "id": "cv-show:cue:lifecycle.digital-twin:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Диджитал Твин"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.digital-twin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle.digital-twin:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle.digital-twin",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Диджитал Твин"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-messaging-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/mobile-smm-platform"
      },
      "dependsOn": [],
      "id": "cv-show:cue:mobile-smm.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.system-map"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.open"
        }
      ],
      "id": "cv-show:cue:mobile-smm.overview:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В одном контуре"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.system-map"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.overview:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm.overview",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В одном контуре"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.stable-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.overview"
        }
      ],
      "id": "cv-show:cue:mobile-smm.stable-path:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Андроид-устройства"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.mobile-smm-platform.stable-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.stable-path:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm.stable-path",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Андроид-устройства"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.agent-update"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.stable-path"
        }
      ],
      "id": "cv-show:cue:mobile-smm.agent-update:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "При изменении интерфейса"
        },
        "gestureDurationMs": 800,
        "leadMs": 3800,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.mobile-smm-platform.agent-update"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm.agent-update:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm.agent-update",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "При изменении интерфейса"
        },
        "gestureDurationMs": 2500,
        "leadMs": 2800,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-platform"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/f360-studio"
      },
      "dependsOn": [],
      "id": "cv-show:cue:f360.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.production-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.open"
        }
      ],
      "id": "cv-show:cue:f360.process:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "процесс от физической"
        },
        "gestureDurationMs": 2200,
        "leadMs": 3850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.f360-studio.production-path"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.process:scroll"
        }
      ],
      "id": "cv-show:cue:f360.process",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "процесс от физической"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.process"
        }
      ],
      "id": "cv-show:cue:f360.result:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "готовой презентации модели"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360.result:scroll"
        }
      ],
      "id": "cv-show:cue:f360.result",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "готовой презентации модели"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-studio"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/autobox-v1"
      },
      "dependsOn": [],
      "id": "cv-show:cue:autobox.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/IPEY0yiVb-I"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.open"
        }
      ],
      "id": "cv-show:cue:autobox.video-01:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь показана предварительная три дэ-визуализация оборудования Автобокс"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/IPEY0yiVb-I"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-01:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-01",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь показана предварительная три дэ-визуализация оборудования Автобокс"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/NWpMtNZjrzI"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-01"
        }
      ],
      "id": "cv-show:cue:autobox.video-02:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я отлаживаю процесс фотограмметрии"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/NWpMtNZjrzI"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-02:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-02",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я отлаживаю процесс фотограмметрии"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/8XsSHyQFtV8"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-02"
        }
      ],
      "id": "cv-show:cue:autobox.video-03:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь показан промежуточный результат той же отладки"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/8XsSHyQFtV8"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-03:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-03",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь показан промежуточный результат той же отладки"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/zb47xAYQBcE"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-03"
        }
      ],
      "id": "cv-show:cue:autobox.video-04:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я собственноручно изготавливаю"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/zb47xAYQBcE"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-04:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-04",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я собственноручно изготавливаю"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/us3vQHuTYPw"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-04"
        }
      ],
      "id": "cv-show:cue:autobox.video-05:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь собранный прототип Автобокс версии один"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/us3vQHuTYPw"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-05:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-05",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь собранный прототип Автобокс версии один"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/FugBzpZqXZ0"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-05"
        }
      ],
      "id": "cv-show:cue:autobox.video-06:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь — вводный ролик эрмитажной серии"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/FugBzpZqXZ0"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-06:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-06",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь — вводный ролик эрмитажной серии"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/iNqxRJgrqM8"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-06"
        }
      ],
      "id": "cv-show:cue:autobox.video-07:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Для того же позолоченного Будды"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/iNqxRJgrqM8"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-07:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-07",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Для того же позолоченного Будды"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/M0cHqy3cScc"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-07"
        }
      ],
      "id": "cv-show:cue:autobox.video-08:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь — художественная визуализация могольского кинжала"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/M0cHqy3cScc"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-08:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-08",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь — художественная визуализация могольского кинжала"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/o4XzMKW8a2E"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-08"
        }
      ],
      "id": "cv-show:cue:autobox.video-09:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь — художественная визуализация головы королевы-матери"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/autobox-v1/youtube/o4XzMKW8a2E"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox.video-09:scroll"
        }
      ],
      "id": "cv-show:cue:autobox.video-09",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь — художественная визуализация головы королевы-матери"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/complexscan"
      },
      "dependsOn": [],
      "id": "cv-show:cue:complexscan.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 7850,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.product-line"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.open"
        }
      ],
      "id": "cv-show:cue:complexscan.line:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "коммерческой линии оборудования"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.complexscan.product-line"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.line:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.line",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "коммерческой линии оборудования"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/complexscan/youtube/MHfWHxVSgn4"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.line"
        }
      ],
      "id": "cv-show:cue:complexscan.video-01:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я демонстрирую одну из таких платформ"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/complexscan/youtube/MHfWHxVSgn4"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.video-01:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.video-01",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я демонстрирую одну из таких платформ"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/complexscan/youtube/PFPoitVEWcE"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.video-01"
        }
      ],
      "id": "cv-show:cue:complexscan.video-02:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я показываю обновлённые версии"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/complexscan/youtube/PFPoitVEWcE"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.video-02:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.video-02",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я показываю обновлённые версии"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.international-delivery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.video-02"
        }
      ],
      "id": "cv-show:cue:complexscan.delivery:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "международных поставок"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.international-delivery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.delivery:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.delivery",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "международных поставок"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "projects/boothbot"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.delivery"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-open:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Отдельным прикладным проектом стал БутБот"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/boothbot"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-open:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Отдельным прикладным проектом стал БутБот"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/boothbot/ims/gallery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-open"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-gallery:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Система объединяла компактную съёмочную будку"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "media/boothbot/ims/gallery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-gallery:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-gallery",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Система объединяла компактную съёмочную будку"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.boothbot.solution"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-gallery"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-catalog-ready:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "готовый материал для каталога"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.boothbot.solution"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan.boothbot-catalog-ready:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan.boothbot-catalog-ready",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "готовый материал для каталога"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "complexscan"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/photopizza"
      },
      "dependsOn": [],
      "id": "cv-show:cue:photopizza.open",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.megavisor-origin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.open"
        }
      ],
      "id": "cv-show:cue:photopizza.origin:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Проект появился внутри Мегавизор"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.megavisor-origin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.origin:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.origin",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Проект появился внутри Мегавизор"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/2lO2VsZFAz0"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.origin"
        }
      ],
      "id": "cv-show:cue:photopizza.video-01:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь показан ускоренный демонстрационный ролик"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/2lO2VsZFAz0"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-01:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-01",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь показан ускоренный демонстрационный ролик"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/6CpdVcjtZoU"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-01"
        }
      ],
      "id": "cv-show:cue:photopizza.video-02:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Это промо Мегавизор"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/6CpdVcjtZoU"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-02:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-02",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Это промо Мегавизор"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.mechanics"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-02"
        }
      ],
      "id": "cv-show:cue:photopizza.mechanics:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Я продумал механику"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.photopizza.mechanics"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.mechanics:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.mechanics",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Я продумал механику"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/f1cB4X1wI50"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.mechanics"
        }
      ],
      "id": "cv-show:cue:photopizza.video-03:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Таймлапс сборки прототипа ФотоПицца"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/f1cB4X1wI50"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-03:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-03",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Таймлапс сборки прототипа ФотоПицца"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/cFPJqtcWNSU"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-03"
        }
      ],
      "id": "cv-show:cue:photopizza.video-04:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я показываю, как собрать простую поворотную платформу"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/cFPJqtcWNSU"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-04:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-04",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я показываю, как собрать простую поворотную платформу"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/HeLMIjuMZac"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-04"
        }
      ],
      "id": "cv-show:cue:photopizza.video-05:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я показываю новое веб-приложение ФотоПицца"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/youtube/HeLMIjuMZac"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-05:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.video-05",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь я показываю новое веб-приложение ФотоПицца"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.controller"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.video-05"
        }
      ],
      "id": "cv-show:cue:photopizza.controller:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Универсальный блок управления"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.photopizza.controller"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.controller:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.controller",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Универсальный блок управления"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/ims/spinner"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.controller"
        }
      ],
      "id": "cv-show:cue:photopizza.spinner:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "На грузовой поворотной платформе ФотоПицца"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "media/photopizza/ims/spinner"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza.spinner:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza.spinner",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "На грузовой поворотной платформе ФотоПицца"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "navigate"
        },
        "kind": "interaction",
        "targetId": "projects/index"
      },
      "dependsOn": [],
      "id": "cv-show:cue:finale.map",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 5800,
        "leadMs": 6400,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "portfolio.map.historical-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.map"
        }
      ],
      "id": "cv-show:cue:finale.history:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "От программно-аппаратных систем"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "portfolio.map.historical-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.history:scroll"
        }
      ],
      "id": "cv-show:cue:finale.history",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "От программно-аппаратных систем"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "portfolio.map.engineering-scale-route"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.history"
        }
      ],
      "id": "cv-show:cue:finale.scale-route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Во всех этих проектах"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "portfolio.map.engineering-scale-route"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.scale-route:scroll"
        }
      ],
      "id": "cv-show:cue:finale.scale-route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Во всех этих проектах"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "project-card.symbiote-workspace"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.scale-route"
        }
      ],
      "id": "cv-show:cue:finale.workspace:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сейчас главным центром"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "project-card.symbiote-workspace"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.workspace:scroll"
        }
      ],
      "id": "cv-show:cue:finale.workspace",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сейчас главным центром"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "chat.actions.finale"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.workspace"
        }
      ],
      "id": "cv-show:cue:finale.actions:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь можно продолжить"
        },
        "gestureDurationMs": 1200,
        "leadMs": 2450,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "chat.actions.finale"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.actions:scroll"
        }
      ],
      "id": "cv-show:cue:finale.actions",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Здесь можно продолжить"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "profile.contacts"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.actions"
        }
      ],
      "id": "cv-show:cue:finale.contacts:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "связаться со мной"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "profile.contacts"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:finale.contacts:scroll"
        }
      ],
      "id": "cv-show:cue:finale.contacts",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "связаться со мной"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "finale"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.config-flow"
      },
      "dependsOn": [],
      "id": "cv-show:cue:workspace-details.flow-frame",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.config-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.flow-frame"
        }
      ],
      "id": "cv-show:cue:workspace-details.flow-route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Агент подбирает"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.symbiote-workspace.config-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.flow-route:scroll"
        }
      ],
      "id": "cv-show:cue:workspace-details.flow-route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Агент подбирает"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.config-artifact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.flow-route"
        }
      ],
      "id": "cv-show:cue:workspace-details.artifact:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Конфигурацию можно обновлять"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.config-artifact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.artifact:scroll"
        }
      ],
      "id": "cv-show:cue:workspace-details.artifact",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Конфигурацию можно обновлять"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-workspace.host-examples"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.artifact"
        }
      ],
      "id": "cv-show:cue:workspace-details.hosts:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Секреты, авторизация"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-workspace.host-examples"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:workspace-details.hosts:scroll"
        }
      ],
      "id": "cv-show:cue:workspace-details.hosts",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Секреты, авторизация"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "workspace-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.programmatic-composition"
      },
      "dependsOn": [],
      "id": "cv-show:cue:symbiote-ui-details.composition",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3150,
        "leadMs": 3750,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.provider-catalog"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.composition"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.catalog:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Компоненты публикуют"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-ui.provider-catalog"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.catalog:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.catalog",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Компоненты публикуют"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.manifest-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.catalog"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.manifest:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "манифесты"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.manifest-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.manifest:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.manifest",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "манифесты"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-ui.workspace-link"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.manifest"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.workspace-route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace использует"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "arrow"
        },
        "kind": "annotation",
        "targetId": "article.symbiote-ui.workspace-link"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-ui-details.workspace-route:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-ui-details.workspace-route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace использует"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-ui-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-engine.layer-diagram"
      },
      "dependsOn": [],
      "id": "cv-show:cue:symbiote-engine-details.layers",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.layers"
        }
      ],
      "id": "cv-show:cue:symbiote-engine-details.execution:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Продукт собирает"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.execution:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-engine-details.execution",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Продукт собирает"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.execution"
        }
      ],
      "id": "cv-show:cue:symbiote-engine-details.demo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace связывает"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-engine.readonly-graph-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:symbiote-engine-details.demo:scroll"
        }
      ],
      "id": "cv-show:cue:symbiote-engine-details.demo",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Workspace связывает"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "symbiote-engine-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.workspace-gallery"
      },
      "dependsOn": [],
      "id": "cv-show:cue:agent-portal-details.gallery",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3300,
        "leadMs": 3900,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.kanban-board"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.gallery"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.board:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В центре находится"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-portal.kanban-board"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.board:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.board",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В центре находится"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.column-settings"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.board"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.settings:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "каждая колонка"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.column-settings"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.settings:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.settings",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "каждая колонка"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.process-diagram"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.settings"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.architecture:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Для задач с кодом"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-portal.process-diagram"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.architecture:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.architecture",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Для задач с кодом"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-portal.resource-groups"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.architecture"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.resource-groups:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Модели и подписки"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-portal.resource-groups"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-portal-details.resource-groups:scroll"
        }
      ],
      "id": "cv-show:cue:agent-portal-details.resource-groups",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Модели и подписки"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-portal-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [],
      "id": "cv-show:cue:video-studio-details.flow",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.flow"
        }
      ],
      "id": "cv-show:cue:video-studio-details.route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Движок превращает"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.symbiote-video-studio.semantic-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.route:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio-details.route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Движок превращает"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.route"
        }
      ],
      "id": "cv-show:cue:video-studio-details.demo:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В рабочей среде"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.demo:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio-details.demo",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "В рабочей среде"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.full-video"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.demo"
        }
      ],
      "id": "cv-show:cue:video-studio-details.media:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Видео-ядро уже работает"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.symbiote-video-studio.full-video"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:video-studio-details.media:scroll"
        }
      ],
      "id": "cv-show:cue:video-studio-details.media",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Видео-ядро уже работает"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "video-studio-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.work-order-demo"
      },
      "dependsOn": [],
      "id": "cv-show:cue:maximo-details.work-order",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3300,
        "leadMs": 3900,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.asset-context"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.work-order"
        }
      ],
      "id": "cv-show:cue:maximo-details.asset:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Панели связывают"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.asset-context"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.asset:scroll"
        }
      ],
      "id": "cv-show:cue:maximo-details.asset",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Панели связывают"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.adaptive-maximo-workbench.safe-actions"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.asset"
        }
      ],
      "id": "cv-show:cue:maximo-details.actions:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "работает через объявленные действия"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.adaptive-maximo-workbench.safe-actions"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:maximo-details.actions:scroll"
        }
      ],
      "id": "cv-show:cue:maximo-details.actions",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "работает через объявленные действия"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "maximo-workbench-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.agent-pool-mcp.execution-runtime"
      },
      "dependsOn": [],
      "id": "cv-show:cue:agent-pool-details.runtime",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-pool-mcp.work-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.runtime"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.work:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "поручить реализацию"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.agent-pool-mcp.work-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.work:scroll"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.work",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "поручить реализацию"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-pool-mcp.review-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.work"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.review:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "независимую проверку"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.agent-pool-mcp.review-branch"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.review:scroll"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.review",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "независимую проверку"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.agent-pool-mcp.result"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.review"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.result:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "общий структурированный результат"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.agent-pool-mcp.result"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:agent-pool-details.result:scroll"
        }
      ],
      "id": "cv-show:cue:agent-pool-details.result",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "общий структурированный результат"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "agent-pool-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.project-graph-mcp.repository-root"
      },
      "dependsOn": [],
      "id": "cv-show:cue:project-graph-details.root",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.compact-skeleton"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.root"
        }
      ],
      "id": "cv-show:cue:project-graph-details.skeleton:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "скелеты кода"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.project-graph-mcp.compact-skeleton"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.skeleton:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph-details.skeleton",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "скелеты кода"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.browser-fact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.skeleton"
        }
      ],
      "id": "cv-show:cue:project-graph-details.fact:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "факты браузерной проверки"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.browser-fact"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.fact:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph-details.fact",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "факты браузерной проверки"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.project-graph-mcp.focus-zone"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.fact"
        }
      ],
      "id": "cv-show:cue:project-graph-details.focus:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сфокусированный контекст"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.project-graph-mcp.focus-zone"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:project-graph-details.focus:scroll"
        }
      ],
      "id": "cv-show:cue:project-graph-details.focus",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сфокусированный контекст"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "project-graph-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.lifecycle-messaging-platform.product-surfaces"
      },
      "dependsOn": [],
      "id": "cv-show:cue:lifecycle-details.product",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.backend-runtime"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.product"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.runtime:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "API"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.lifecycle-messaging-platform.backend-runtime"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.runtime:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.runtime",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "API"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.delivery-ops"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.runtime"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.delivery:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "управляли пулами"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.lifecycle-messaging-platform.delivery-ops"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.delivery:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.delivery",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "управляли пулами"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.delivery-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.delivery"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "очередь, повторяемое выполнение"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.delivery-flow"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.route:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "очередь, повторяемое выполнение"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.lifecycle-messaging-platform.digital-twin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.route"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.twin:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Digital Twin"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.lifecycle-messaging-platform.digital-twin"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:lifecycle-details.twin:scroll"
        }
      ],
      "id": "cv-show:cue:lifecycle-details.twin",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Digital Twin"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "lifecycle-platform-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.media-gallery"
      },
      "dependsOn": [],
      "id": "cv-show:cue:mobile-smm-details.gallery",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.schedule"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.gallery"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.schedule:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сервер управляет расписанием"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.schedule"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.schedule:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.schedule",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Сервер управляет расписанием"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.queue"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.schedule"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.queue:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Готовый JSON-сценарий"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.queue"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.queue:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.queue",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Готовый JSON-сценарий"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.ui-change-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.queue"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.ui-change:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Если структура экрана изменилась"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.ui-change-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.ui-change:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.ui-change",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Если структура экрана изменилась"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.approval-log"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.ui-change"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.approval:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Исходящие действия"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.mobile-smm-platform.approval-log"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.approval:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.approval",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Исходящие действия"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.local-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.approval"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.draft:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Демонстрация заканчивается"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.mobile-smm-platform.local-demo"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:mobile-smm-details.draft:scroll"
        }
      ],
      "id": "cv-show:cue:mobile-smm-details.draft",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Демонстрация заканчивается"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "mobile-smm-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.f360-studio.production-path"
      },
      "dependsOn": [],
      "id": "cv-show:cue:f360-details.path",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result-one"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.path"
        }
      ],
      "id": "cv-show:cue:f360-details.result-one:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Публичные примеры"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result-one"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.result-one:scroll"
        }
      ],
      "id": "cv-show:cue:f360-details.result-one",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Публичные примеры"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result-two"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.result-one"
        }
      ],
      "id": "cv-show:cue:f360-details.period:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Студия завершила работу"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2150,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.f360-studio.gallery-result-two"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:f360-details.period:scroll"
        }
      ],
      "id": "cv-show:cue:f360-details.period",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Студия завершила работу"
        },
        "gestureDurationMs": 650,
        "leadMs": 950,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "f360-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.autobox-v1.working-system"
      },
      "dependsOn": [],
      "id": "cv-show:cue:autobox-details.working-system",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.working-system"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.working-system"
        }
      ],
      "id": "cv-show:cue:autobox-details.working-route:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "компьютерное зрение"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.autobox-v1.working-system"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.working-route:scroll"
        }
      ],
      "id": "cv-show:cue:autobox-details.working-route",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "компьютерное зрение"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.netsuke-video"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.working-route"
        }
      ],
      "id": "cv-show:cue:autobox-details.video:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "в Эрмитаже я сканировал"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.netsuke-video"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.video:scroll"
        }
      ],
      "id": "cv-show:cue:autobox-details.video",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "в Эрмитаже я сканировал"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.benin-bronze"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.video"
        }
      ],
      "id": "cv-show:cue:autobox-details.bronze:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "бенинской бронзы"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.autobox-v1.benin-bronze"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:autobox-details.bronze:scroll"
        }
      ],
      "id": "cv-show:cue:autobox-details.bronze",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "бенинской бронзы"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "autobox-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.complexscan.transparent-platform"
      },
      "dependsOn": [],
      "id": "cv-show:cue:complexscan-details.platform",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3050,
        "leadMs": 3650,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.controlled-light"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.platform"
        }
      ],
      "id": "cv-show:cue:complexscan-details.light:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "управляемый свет"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.complexscan.controlled-light"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.light:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan-details.light",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "управляемый свет"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.product-gallery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.light"
        }
      ],
      "id": "cv-show:cue:complexscan-details.gallery:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "собирал прототипы"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.product-gallery"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.gallery:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan-details.gallery",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "собирал прототипы"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.complexscan.autobox-museum-link"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.gallery"
        }
      ],
      "id": "cv-show:cue:complexscan-details.autobox:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "музейное направление"
        },
        "gestureDurationMs": 800,
        "leadMs": 2500,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "annotation": {
          "intent": "pointer",
          "marker": "underline"
        },
        "kind": "annotation",
        "targetId": "article.complexscan.autobox-museum-link"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:complexscan-details.autobox:scroll"
        }
      ],
      "id": "cv-show:cue:complexscan-details.autobox",
      "kind": "cue",
      "layerId": "cv-show:layer:annotation",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "музейное направление"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1500,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "complexscan-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "select"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.megavisor-origin"
      },
      "dependsOn": [],
      "id": "cv-show:cue:photopizza-details.origin",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "turn-start",
          "offsetMs": 0
        },
        "gestureDurationMs": 3150,
        "leadMs": 3750,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.controller-attribution"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.origin"
        }
      ],
      "id": "cv-show:cue:photopizza-details.attribution:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Arduino-версию"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.photopizza.controller-attribution"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.attribution:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza-details.attribution",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "Arduino-версию"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.controller-media"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.attribution"
        }
      ],
      "id": "cv-show:cue:photopizza-details.media:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "я сам продолжил"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2250,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "click"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.controller-media"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.media:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza-details.media",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "я сам продолжил"
        },
        "gestureDurationMs": 800,
        "leadMs": 1050,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "interaction": {
          "reversible": false,
          "type": "scroll"
        },
        "kind": "interaction",
        "targetId": "article.photopizza.assembly-calibration"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.media"
        }
      ],
      "id": "cv-show:cue:photopizza-details.documentation:scroll",
      "kind": "cue",
      "layerId": "cv-show:layer:interaction",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сборку с калибровкой"
        },
        "gestureDurationMs": 1000,
        "leadMs": 2650,
        "settleBy": "anchor",
        "until": null
      },
      "turnId": "photopizza-details"
    },
    {
      "cue": {
        "focus": {
          "mode": "frame"
        },
        "kind": "focus",
        "targetId": "article.photopizza.assembly-calibration"
      },
      "dependsOn": [
        {
          "barrier": "settled",
          "cellId": "cv-show:cue:photopizza-details.documentation:scroll"
        }
      ],
      "id": "cv-show:cue:photopizza-details.documentation",
      "kind": "cue",
      "layerId": "cv-show:layer:focus",
      "timing": {
        "at": {
          "anchor": "speech",
          "edge": "start",
          "occurrence": 1,
          "offsetMs": 0,
          "quote": "сборку с калибровкой"
        },
        "gestureDurationMs": 1200,
        "leadMs": 1450,
        "settleBy": "anchor",
        "until": {
          "anchor": "turn-end",
          "offsetMs": 0
        }
      },
      "turnId": "photopizza-details"
    }
  ],
  "id": "cv-show",
  "layers": [
    {
      "collisionDomainId": null,
      "id": "cv-show:layer:narration",
      "kind": "narration",
      "name": "Narration",
      "visualOwnerId": null
    },
    {
      "collisionDomainId": "cv-show:presenter-gesture",
      "id": "cv-show:layer:focus",
      "kind": "focus",
      "name": "Focus",
      "visualOwnerId": "cv-show:presenter"
    },
    {
      "collisionDomainId": "cv-show:presenter-gesture",
      "id": "cv-show:layer:annotation",
      "kind": "annotation",
      "name": "Annotation",
      "visualOwnerId": "cv-show:presenter"
    },
    {
      "collisionDomainId": "cv-show:presenter-gesture",
      "id": "cv-show:layer:interaction",
      "kind": "interaction",
      "name": "Interaction",
      "visualOwnerId": "cv-show:presenter"
    },
    {
      "collisionDomainId": null,
      "id": "cv-show:layer:state",
      "kind": "state",
      "name": "State",
      "visualOwnerId": null
    }
  ],
  "policy": {
    "collisionDomains": [
      {
        "exclusive": true,
        "id": "cv-show:presenter-gesture",
        "name": "CV Show presenter gesture"
      }
    ],
    "visualOwnerId": "cv-show:presenter"
  },
  "revision": 47,
  "schemaVersion": "workspace-presentation-authoring-project-v1",
  "script": {
    "grounding": {
      "sources": []
    },
    "locale": "ru",
    "metadata": {
      "cvShow": {
        "contractRevision": "34c3d40c1c53cd320362aff9888c1727c977b9b3c7dcfb0d3cc73683bcf29af9",
        "conversationRevision": "cv-show-agent-context-v1",
        "directives": {
          "cv-show:cue:agent-pool-details.result": {
            "policy": "required",
            "refinements": {
              "series": "agent-pool-review",
              "shape": "route"
            }
          },
          "cv-show:cue:agent-pool-details.review": {
            "policy": "required",
            "refinements": {
              "series": "agent-pool-review",
              "shape": "route"
            }
          },
          "cv-show:cue:agent-pool-details.runtime": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-pool-details.work": {
            "policy": "required",
            "refinements": {
              "series": "agent-pool-review",
              "shape": "route"
            }
          },
          "cv-show:cue:agent-pool.flow": {
            "policy": "required",
            "refinements": {
              "series": "agent-pool-flow",
              "shape": "route"
            }
          },
          "cv-show:cue:agent-pool.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal-details.architecture": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal-details.board": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal-details.gallery": {
            "policy": "required",
            "refinements": {
              "safePath": "open-readonly-kanban-gallery"
            }
          },
          "cv-show:cue:agent-portal-details.resource-groups": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal-details.settings": {
            "policy": "optional",
            "refinements": {
              "safePath": "open-readonly-settings"
            }
          },
          "cv-show:cue:agent-portal.human-decision": {
            "policy": "required",
            "refinements": {
              "series": "agent-portal-process",
              "shape": "oval"
            }
          },
          "cv-show:cue:agent-portal.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal.open-source": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:agent-portal.path": {
            "policy": "required",
            "refinements": {
              "series": "agent-portal-process",
              "shape": "route"
            }
          },
          "cv-show:cue:autobox-details.bronze": {
            "policy": "optional",
            "refinements": {
              "safePath": "rotate-interactive-model"
            }
          },
          "cv-show:cue:autobox-details.video": {
            "policy": "optional",
            "refinements": {
              "action": "skip-video",
              "mode": "full-with-media-audio"
            }
          },
          "cv-show:cue:autobox-details.working-route": {
            "policy": "required",
            "refinements": {
              "series": "autobox-working",
              "shape": "route"
            }
          },
          "cv-show:cue:autobox-details.working-system": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:autobox.video-01": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:autobox.video-02": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:autobox.video-03": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:autobox.video-04": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:autobox.video-05": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:autobox.video-06": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:autobox.video-07": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:autobox.video-08": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:autobox.video-09": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:complexscan-details.autobox": {
            "policy": "required",
            "refinements": {
              "series": "complexscan-applications",
              "shape": "route"
            }
          },
          "cv-show:cue:complexscan-details.gallery": {
            "policy": "required",
            "refinements": {
              "safePath": "prototype-product-packaging-delivery"
            }
          },
          "cv-show:cue:complexscan-details.light": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan-details.platform": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.boothbot-catalog-ready": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "готовый материал для каталога",
              "series": "boothbot-result",
              "shape": "oval"
            }
          },
          "cv-show:cue:complexscan.boothbot-gallery": {
            "policy": "required",
            "refinements": {
              "finalFrame": 5,
              "frames": [
                1,
                2,
                3,
                4,
                5
              ],
              "safePath": "boothbot-five-frame-gallery-sequence"
            }
          },
          "cv-show:cue:complexscan.boothbot-open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.delivery": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "доставки клиентам в разные страны"
            }
          },
          "cv-show:cue:complexscan.line": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:complexscan.video-01": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:complexscan.video-02": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:f360-details.path": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:f360-details.period": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "2021–2022 годах"
            }
          },
          "cv-show:cue:f360-details.result-one": {
            "policy": "required",
            "refinements": {
              "safePath": "open-source-backed-result"
            }
          },
          "cv-show:cue:f360.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:f360.process": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:f360.result": {
            "policy": "required",
            "refinements": {
              "safePath": "open-source-backed-result"
            }
          },
          "cv-show:cue:finale.actions": {
            "policy": "required",
            "refinements": {
              "actions": [
                "projects",
                "resume",
                "contact"
              ],
              "persistent": true
            }
          },
          "cv-show:cue:finale.contacts": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:finale.history": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:finale.map": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:finale.scale-route": {
            "policy": "required",
            "refinements": {
              "series": "finale-scale",
              "shape": "route"
            }
          },
          "cv-show:cue:finale.workspace": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.delivery": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.product": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.route": {
            "policy": "required",
            "refinements": {
              "series": "lifecycle-delivery",
              "shape": "route"
            }
          },
          "cv-show:cue:lifecycle-details.runtime": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle-details.twin": {
            "policy": "required",
            "refinements": {
              "series": "lifecycle-twin",
              "shape": "parallel-route"
            }
          },
          "cv-show:cue:lifecycle.digital-twin": {
            "policy": "required",
            "refinements": {
              "series": "lifecycle-twin",
              "shape": "bidirectional-route"
            }
          },
          "cv-show:cue:lifecycle.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:lifecycle.product-number": {
            "policy": "required",
            "refinements": {
              "series": "lifecycle-layers",
              "shape": "number",
              "text": "1"
            }
          },
          "cv-show:cue:lifecycle.runtime-number": {
            "policy": "required",
            "refinements": {
              "series": "lifecycle-layers",
              "shape": "number",
              "text": "2"
            }
          },
          "cv-show:cue:lifecycle.scope": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "клиентских коммуникаций на основе согласия"
            }
          },
          "cv-show:cue:maximo-details.actions": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo-details.asset": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo-details.work-order": {
            "policy": "required",
            "refinements": {
              "safePath": "open-readonly-work-order"
            }
          },
          "cv-show:cue:maximo.asset-context": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:maximo.work-orders": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.approval": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.draft": {
            "policy": "required",
            "refinements": {
              "safePath": "draft-test-target-approval-dry-run"
            }
          },
          "cv-show:cue:mobile-smm-details.gallery": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.queue": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.schedule": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm-details.ui-change": {
            "policy": "required",
            "refinements": {
              "safePath": "stop-analyze-propose-for-review"
            }
          },
          "cv-show:cue:mobile-smm.agent-update": {
            "policy": "required",
            "refinements": {
              "series": "mobile-smm-flow",
              "shape": "oval"
            }
          },
          "cv-show:cue:mobile-smm.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm.overview": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:mobile-smm.stable-path": {
            "policy": "required",
            "refinements": {
              "series": "mobile-smm-flow",
              "shape": "route"
            }
          },
          "cv-show:cue:photopizza-details.attribution": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza-details.documentation": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza-details.media": {
            "policy": "required",
            "refinements": {
              "safePath": "open-three-controller-media"
            }
          },
          "cv-show:cue:photopizza-details.origin": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "доступный, быстрый и повторяемый способ"
            }
          },
          "cv-show:cue:photopizza.controller": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.mechanics": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:photopizza.origin": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "внутри проекта MEGAVISOR"
            }
          },
          "cv-show:cue:photopizza.spinner": {
            "policy": "required",
            "refinements": {
              "action": "play-inline",
              "keepPlayingDuringQuote": true,
              "mode": "short-inline-continuous"
            }
          },
          "cv-show:cue:photopizza.video-01": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:photopizza.video-02": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:photopizza.video-03": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:photopizza.video-04": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:photopizza.video-05": {
            "policy": "required",
            "refinements": {
              "action": "watch-full-video",
              "mode": "short-muted-montage"
            }
          },
          "cv-show:cue:positioning.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:positioning.tenure-marker": {
            "policy": "required",
            "refinements": {
              "series": "positioning-tenure",
              "shape": "oval"
            }
          },
          "cv-show:cue:positioning.workspace-transition": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph-details.fact": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "проверяемые браузерные факты"
            }
          },
          "cv-show:cue:project-graph-details.focus": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph-details.root": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph-details.skeleton": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph.context": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "компактный структурированный инженерный контекст"
            }
          },
          "cv-show:cue:project-graph.example": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:project-graph.node": {
            "policy": "optional",
            "refinements": {
              "safePath": "expand-readonly-node"
            }
          },
          "cv-show:cue:project-graph.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-engine-details.demo": {
            "policy": "optional",
            "refinements": {
              "safePath": "open-readonly-execution"
            }
          },
          "cv-show:cue:symbiote-engine-details.execution": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "компонуемые серверные примитивы"
            }
          },
          "cv-show:cue:symbiote-engine-details.layers": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-engine.intro": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-engine.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-engine.workspace-join": {
            "policy": "required",
            "refinements": {
              "series": "workspace-layers",
              "shape": "underline"
            }
          },
          "cv-show:cue:symbiote-ui-details.catalog": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui-details.composition": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "интерфейсы должны быть компонуемыми программно"
            }
          },
          "cv-show:cue:symbiote-ui-details.manifest": {
            "policy": "required",
            "refinements": {
              "safePath": "open-readonly-manifest"
            }
          },
          "cv-show:cue:symbiote-ui-details.workspace-route": {
            "policy": "required",
            "refinements": {
              "series": "symbiote-ui-workspace",
              "shape": "arrow"
            }
          },
          "cv-show:cue:symbiote-ui.current-show": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui.graph-tooling": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:symbiote-ui.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:video-studio-details.demo": {
            "policy": "required",
            "refinements": {
              "safePath": "graph-timeline-preview"
            }
          },
          "cv-show:cue:video-studio-details.flow": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:video-studio-details.media": {
            "policy": "optional",
            "refinements": {
              "action": "skip-video",
              "mode": "full-with-media-audio"
            }
          },
          "cv-show:cue:video-studio-details.route": {
            "policy": "required",
            "refinements": {
              "series": "video-studio-flow",
              "shape": "route"
            }
          },
          "cv-show:cue:video-studio.demo": {
            "policy": "required",
            "refinements": {
              "safePath": "graph-timeline-preview"
            }
          },
          "cv-show:cue:video-studio.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:video-studio.visible-process": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "один видимый процесс"
            }
          },
          "cv-show:cue:workspace-details.artifact": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace-details.flow-frame": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace-details.flow-route": {
            "policy": "required",
            "refinements": {
              "series": "workspace-config-flow",
              "shape": "route"
            }
          },
          "cv-show:cue:workspace-details.hosts": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace.agent-portal-card": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace.intro-frame": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace.open": {
            "policy": "required",
            "refinements": {}
          },
          "cv-show:cue:workspace.portable-config": {
            "policy": "required",
            "refinements": {
              "occurrence": 1,
              "quote": "переносимая исполняемая конфигурация"
            }
          }
        },
        "entries": {
          "adaptive-maximo-workbench": {
            "branchId": "maximo-workbench-details",
            "chat": {
              "actionLabel": "Подробнее об Adaptive Maximo Workbench",
              "text": "Показываю корпоративный Demo/Alpha-кейс Adaptive Maximo Workbench."
            },
            "media": {
              "durationMilliseconds": 23350,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-U5QgojnOmkJFhAjPngJf2XHywMb5knnydSrGA8qTirU=",
              "sourceAlignmentFileHash": "sha256:f9d25ddd6ef1f402322447fc0b429a9b8d84e62a0fd828007ca06eedf43e8251",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-vyI0rxE0/sJfslbkzoRYVFr0m6aUcaLk4PoRvbEkCDk=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-7dJUWKStNhWhvY68VwVlA9e2NGOV//td5/72zZ13izA=",
              "wavHash": "sha256:0acf8f42d5b1b9a1a7912f48523e6092cde6df88f8c81955c5ae7370cedf2ba9"
            },
            "period": "Date pending",
            "projectId": "projects/adaptive-maximo-workbench",
            "return": null,
            "subtitle": "Следующий пример — Adaptive Maximo Workbench. Он показывает, как заявки, оборудование, локации, бригады и доступные действия собираются в одном рабочем пространстве с общим актуальным контекстом. Сейчас это Demo/Alpha возможностей Workspace. Подключение к реальному Maximo выполняется как отдельная интеграция.",
            "title": "Adaptive Maximo Workbench"
          },
          "agent-pool-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Agent Pool MCP."
            },
            "media": {
              "durationMilliseconds": 29280,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-MAysqc9Y7SwZuCDHHgAFlayKnUqynu2DRr6Lrmf3TXM=",
              "sourceAlignmentFileHash": "sha256:7cfd46e60325f623f86780a542ab4452c77e1f906bd89f79879183667afa4293",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-9IpVRo8Fk1YEM0d8bvj8BqpWxjZfE8nFoMvF03pQAWo=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-93nUeU+vEC5yVQ2KM+RwWnTCYQq4l/SP0Uo39liQtB8=",
              "wavHash": "sha256:f6b4b332ed56db47716f0bc579c49897ddcee2e13419f3b5f2b6dfc9c7e3d003"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.agent-pool",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Я создавал Agent Pool MCP как независимый слой исполнения для разных CLI-агентов и моделей. Он поддерживает параллельные задачи, последовательные pipelines, handoff сессий, политики и группы ресурсов. Один процесс может поручить реализацию одному агенту, а независимую проверку — другому. В сценариях cross-model peer review агенты разных провайдеров сравнивают выводы и возвращают общий структурированный результат.",
            "title": null
          },
          "agent-pool-mcp": {
            "branchId": "agent-pool-details",
            "chat": {
              "actionLabel": "Подробнее об Agent Pool MCP",
              "text": "Показываю исполнительный слой Agent Pool MCP."
            },
            "media": {
              "durationMilliseconds": 22610,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-L9JlNmhNT+4IQzOLX8IRmJm7anBYZRiL3FnWuIr/iO8=",
              "sourceAlignmentFileHash": "sha256:79739ed1f1664f2c95772a6808e20e0a5dffd3d86965556495ff3091fa2aa440",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-xPFCz6idueKTMojSGntWn0WgnQ1l6V2xGDoT+7Ru08Y=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-/ySKn4aXXs9JJge17sY2P6exQplUzQcALKKCrDjA2ao=",
              "wavHash": "sha256:e1d09e85d25f5e57b1b37cabcc55ee8f5955d9b402d60e742f5824297f9ebdc2"
            },
            "period": "2026",
            "projectId": "projects/agent-pool-mcp",
            "return": null,
            "subtitle": "В начале 2026 года Agent Pool MCP оформился как самостоятельный MCP-сервер, который можно напрямую подключить к агенту. В Agent Portal он используется как исполнительный слой: распределяет задачи между агентами, отслеживает владение и состояние, передаёт сессии и маршрутизирует ресурсы.",
            "title": "Agent Pool MCP"
          },
          "agent-portal": {
            "branchId": "agent-portal-details",
            "chat": {
              "actionLabel": "Подробнее об Agent Portal",
              "text": "Показываю Agent Portal и его исполняемый процесс."
            },
            "media": {
              "durationMilliseconds": 69920,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-H5gAsEoW1cyHBBMCgv7OuJwm1VuqV0S88mWwQFoDBqI=",
              "sourceAlignmentFileHash": "sha256:833299c23986e2d057ae2ee266eac1f82e49192f9b4a76b4ceff3b38b3f437b7",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-Kbbta5bGntb6sGAz8M2VxB9YPaeshtJOGYPx2qrVVrw=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-dN41DuEBpzm6ETMpb+Bp4S1ydjjm+iAKTjk7W9Yjcic=",
              "wavHash": "sha256:1a6799d9624a41f4f2658cbcfc38ecd4b4f87e30dca00d340f34165da87bc387"
            },
            "period": "2025–2026",
            "projectId": "projects/agent-portal",
            "return": null,
            "subtitle": "Agent Portal — один из проектов, которые я сейчас переношу в Symbiote Workspace как конфигурации. Я развиваю его с начала две тысячи двадцать шестого года. Проект появился как собственный управляющий слой над разными агентными средами — своего рода harness над harnesses. Он объединяет их в один видимый процесс и позволяет сохранять контроль над контекстом, задачами и ресурсами, при этом быстро меняя агентов, модели и способы доступа к ним. Когда я начинал эту линию, я не нашёл готового решения с таким сочетанием возможностей, поэтому стал развивать собственный вариант. Мы решили открыть управляющий контур mcp-agent-portal, хотя развиваем Agent Portal прежде всего для собственной практической работы. Исходный код этого контура доступен на GitHub, а интерфейс Agent Portal можно посмотреть в интерактивном демо. Чтобы показать его внутреннее устройство, дальше я разберу два отдельных инструмента. Agent Pool MCP отвечает за исполнение и распределение ресурсов, а Project Graph MCP — за структуру и контекст проекта.",
            "title": "Agent Portal"
          },
          "agent-portal-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Agent Portal."
            },
            "media": {
              "durationMilliseconds": 45490,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-LeYgypDyD3mCmVpLphti3dc5sCXcjwRHsynPYZRMrK0=",
              "sourceAlignmentFileHash": "sha256:34bbcc1d1b38677f4a4ddd76fb5ae3a2450ff75843467cd0a876fd78526d6b4f",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-UpkT4HT/xTSatAITxeqUBYZLu+OjRXHTd/GLMbOiaVo=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-kjWa8VtmLRigBs9UVhhaH5rHCoSspD56uoRX9ZleEFY=",
              "wavHash": "sha256:fa68ddfce8d2f2e228ce34e3514a32993e9e450e137e97c829450cac4cf75150"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.agent-portal",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Agent Portal — мой open-source проект. Я придумал и реализовал его архитектуру, а в работе мы использовали его как общую среду для агентной разработки. В центре находится исполняемая канбан-доска: каждая колонка запускает часть процесса и может получить свои действия, роли и пул специализированных агентов. Для задач с кодом система создаёт изолированную рабочую копию и ветку. Один агент выполняет работу, другой независимо проверяет результат. Успешный аудит открывает путь к публикации, а конфликт переводит карточку к решению человека. Модели и подписки объединяются в группы ресурсов, поэтому этап получает исполнителя с подходящими возможностями и доступным лимитом.",
            "title": null
          },
          "autobox": {
            "branchId": "autobox-details",
            "chat": {
              "actionLabel": "Подробнее об AUTOBOX",
              "text": "Показываю музейную технологию AUTOBOX."
            },
            "media": {
              "durationMilliseconds": 115430,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-1ZRaNLOK9YhzAdzJjmrPvZG/KxX7GAV+vM0Kc/2V74A=",
              "sourceAlignmentFileHash": "sha256:da0d38c28932e55b2a6ddd4568c98d534cab960ebe01f7e4720896c6b9dfb4f3",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-OvHGXLNCgBaUf3dHDx3I0h+pjDKEZqXh/nS4DruoOWQ=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-/MmpuJp8dseY9QmSCfx1vVGr51ceReCd2qpHW94WAO4=",
              "wavHash": "sha256:5981c65c779956fc87110afbd1ccedc444d4601a1b02106bd2a6024ba3df3346"
            },
            "period": "2019–2021",
            "projectId": "projects/autobox-v1",
            "return": null,
            "subtitle": "Перед F360 была музейная технология AUTOBOX, которую я развивал в 2019–2021 годах. Здесь показана предварительная 3D-визуализация оборудования AUTOBOX. Я подготовил её ещё до сборки установки, чтобы представить будущую конструкцию партнёрам, с которыми мы работали над 3D-сканированием музейных объектов в Эрмитаже. Здесь я отлаживаю процесс фотограмметрии на поворотном столе PhotoPizza. Это один из предварительных экспериментов, проведённых до разработки установки для Эрмитажа. Здесь показан промежуточный результат той же отладки в RealityCapture. Слева видны исходные фотографии позолоченного Будды, а в 3D-пространстве я вращаю уже обработанную модель и проверяю результат фотограмметрии перед разработкой оборудования для Эрмитажа. Здесь я собственноручно изготавливаю одну из деталей AUTOBOX v1 — лазером вырезаю вентиляционную сетку для светового модуля. Здесь собранный прототип AUTOBOX v1 сканирует нэцке в Эрмитаже. Здесь — вводный ролик эрмитажной серии „Нэцке под увеличительным стеклом“. Представленные в ней нэцке я собственноручно сканировал и визуализировал во время отладки технологии AUTOBOX. Для того же позолоченного Будды я сделал художественную 3D-визуализацию. Она показывает качество сканирования сложного металлического объекта: сохранились мелкие детали, повреждения и царапины. Здесь — художественная визуализация могольского кинжала из собрания Эрмитажа. Сочетание полированного металла, позолоты и инкрустации драгоценными камнями делало его особенно сложным для фотограмметрии, но нам удалось сохранить и форму, и детали разных материалов. Здесь — художественная визуализация головы королевы-матери из Королевства Бенин. Сканирование точно передало сложный рельеф и патину бронзовой поверхности.",
            "title": "AUTOBOX"
          },
          "autobox-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: AUTOBOX."
            },
            "media": {
              "durationMilliseconds": 56180,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-s1WKiUihxfUqv7TSRn7ZUm+N1Bl42lYA9gC6lP4LVVY=",
              "sourceAlignmentFileHash": "sha256:0f188d63d129462ce498180d231c619529e84628db5aa5c3bfea942fa27963aa",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-lbcYqKCJ11Kt7ZDG/XqzyrixKEzH3haQ+7Ur7544sYs=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-K4zSlNVaO/jZCkomhuho5TP7p5VgyJzqmzqCT3fUW9o=",
              "wavHash": "sha256:127b78a0f7ecd217ea7362e8e4c86c4bfa7e81341595aa62321129961e2c4eea"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.autobox",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Рабочая система управляла камерой, светом и позиционированием. Она сначала снимала полную серию, после чего компьютерное зрение анализировало материал, оценивало резкость и отбирало исходники для построения три D-модели. Следующий прототип начинал с чернового три D-сканирования и упрощённой формы предмета. Затем он заранее рассчитывал весь план детальной макросъёмки: зоны, ракурсы, положения камеры, параметры оптики, глубину резкости и перекрытие. Расчёт учитывал сложную геометрию предмета, диапазон механики, габариты камеры, препятствия и безопасное расстояние. После проверки принципа я проектировал дополнительные контуры безопасности, включая лидарный контроль расстояния на случай смещения предмета. Этот слой остался следующим этапом разработки. Сама AUTOBOX уже работала в музеях: в Эрмитаже я сканировал японские нэцкэ, а технологическая линия применялась для бенинской бронзы в Кунсткамере.",
            "title": null
          },
          "complexscan": {
            "branchId": "complexscan-details",
            "chat": {
              "actionLabel": "Подробнее о ComplexScan",
              "text": "Показываю коммерческую линейку оборудования ComplexScan."
            },
            "media": {
              "durationMilliseconds": 94400,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-uPo+183cmKiz61NIT8YHo0sbbwv9HHEio8ExUgf5Wdc=",
              "sourceAlignmentFileHash": "sha256:03958c301d4ee4fecc60cf1623cea70328a55a8fec6fe68943069b2dd16889cb",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-fhuOfmoCsPP/6fJpUDuUlxlPVJzytA4hzb9vDmrcQ4I=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-RVb/u37v+ZOwCMaSpyWWEWsuYgSbKsT/olp3hf8LXTc=",
              "wavHash": "sha256:ee0d4504edeee99c078235508637c93b54afdf1ed08dcdb8c028851353a326a0"
            },
            "period": "2017–2022",
            "projectId": "projects/complexscan",
            "return": null,
            "subtitle": "Теперь вернусь к ComplexScan — коммерческой линии оборудования, чьи разработки стали частью технической базы AUTOBOX. Я развивал ComplexScan в 2017–2022 годах. В линию входили прозрачные платформы для бестеневой съёмки предметов в формате фото 360 и для 3D-сканирования. Здесь я демонстрирую одну из таких платформ и веб-приложение, из которого управляю ею. Здесь я показываю обновлённые версии поворотной платформы ComplexScan и веб-приложения для управления ею. Я проектировал оборудование и метод съёмки как единый продукт и довёл линию до первых международных поставок. Отдельным прикладным проектом стал BoothBot — система автоматизации каталожной съёмки винных бутылок непосредственно на складе заказчика. Система объединяла компактную съёмочную будку, управляемые световые панели, моторизированную камеру, пресеты съёмки и автоматическую обработку фотографий. Световая сцена была заранее настроена для бестеневой съёмки и контролируемых бликов, поэтому фотографии практически не требовали ручной коррекции. Система автоматически отделяла бутылку от фона, оптимизировала изображение и выдавала готовый материал для каталога. Благодаря этому сотрудники без студийного опыта могли получать повторяемый результат прямо на складе. Следующим этапом должна была стать прямая публикация готовых фотографий на сайте, но после моего переезда в Аргентину развитие проекта было приостановлено.",
            "title": "ComplexScan"
          },
          "complexscan-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: ComplexScan."
            },
            "media": {
              "durationMilliseconds": 43180,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-jh9ghVk054A5ijizB62CVhrswY9igYl5qMlC6tQSdD4=",
              "sourceAlignmentFileHash": "sha256:63889e1e3aa2428baae6f8085830d085211a608cf65c8123118773733c2e858c",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-NVEaIH5ZqFViJ4BguG5rbCA7VXTJEX2rHpd6A0Rmha8=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-h+IOZ+Zjn0YdegYdIdyMS0pdNwEUwYI1Td9vpuPvBy0=",
              "wavHash": "sha256:49d15f916f4e1f08cc569898ab01fb42a84910945455e325a727048e894669d9"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.complexscan",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Я придумал ComplexScan как коммерческую линию профессионального оборудования после open-source работы над PhotoPizza. Прозрачный вращающийся диск, стабильная механика и управляемый свет давали чистые исходники для фото триста шестьдесят и фотограмметрии. Я собственноручно собирал прототипы и первые изделия, разбивал конструкцию на детали для профильных подрядчиков, затем выполнял финальную сборку и тестирование. Отдельно я проектировал защитную упаковку, оформлял экспортные документы и организовывал доставки клиентам в разные страны. Внутри этой линии AUTOBOX развивала музейное направление, а бутылочная установка решала задачу повторяемой каталожной съёмки.",
            "title": null
          },
          "f360-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: F360 Studio."
            },
            "media": {
              "durationMilliseconds": 32270,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-m4Cd//n0sh1fVnRbIkKz/cF5j6PnarE5bf3yEw3gILE=",
              "sourceAlignmentFileHash": "sha256:559e0f16da2aa2745259aa2426a29183a9e84531e62ed4966e314a470cd1948d",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-D40V9gkmElcV2stI9fQmd/Jbm2VatxX8GUr3cM8yFqI=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-pXFp+LVNNCB2UJynyllogkFdFcZ6fBpldgbtN8C6eZs=",
              "wavHash": "sha256:0f9415d586250df8c1ee6e94f226cb9abb2d0c0af4580b95cc3f2edaaae26863"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.f360",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "F триста шестьдесят переносила дисциплину музейной съёмки в коммерческий студийный процесс. Для каждого объекта я планировал ракурсы и свет, контролировал исходные фотографии, проводил фотограмметрическую обработку и проверял геометрию с текстурами. Я собрал единый производственный путь от установки до финальной три D-модели и её публикации. Публичные примеры сохранились на YouTube и в портфолио Sketchfab. Студия завершила работу в две тысячи двадцать втором году во время моего переезда.",
            "title": null
          },
          "f360-studio": {
            "branchId": "f360-details",
            "chat": {
              "actionLabel": "Подробнее о F360 Studio",
              "text": "Перехожу к исторической программно-аппаратной ветке и F360 Studio."
            },
            "media": {
              "durationMilliseconds": 25970,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-aovfyEab5R6JAT2sTJXYOQVTsPyfsU6Uz9SjoN27NfU=",
              "sourceAlignmentFileHash": "sha256:e7075e7940e763a0a3e60e853807824a62163297746bd261f0a9b56bfbe565b5",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-CeDMoi9/WwNDL1wZy9cGHT9xyBylArxy7QUlQFdXsx0=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-I8FoyCyAiYHgN+1qMcJVS+XcV1ndBT5a+irziAvQjvI=",
              "wavHash": "sha256:04fe967fd516062f0e7fdd44f50df0e4adeb0eac8a4ee773613e78f87451e768"
            },
            "period": "2021–2022",
            "projectId": "projects/f360-studio",
            "return": null,
            "subtitle": "Теперь вернусь по истории программно-аппаратных проектов. В две тысячи двадцать первом — две тысячи двадцать втором годах я основал и вёл F триста шестьдесят Studio — проект высокоточного три D-сканирования. Я выстраивал процесс от физической съёмочной установки и управляемого света до геометрии, текстур и готовой презентации модели. При переезде в Аргентину физическую производственную базу пришлось закрыть.",
            "title": "F360 Studio"
          },
          "finale": {
            "branchId": null,
            "chat": {
              "text": "Возвращаю рассказ в настоящее и оставляю итоговые действия."
            },
            "media": {
              "durationMilliseconds": 30550,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-3/v7C4dnMpHww9y4a+TtyT+RaePlpg7SpC30BVlwJ8g=",
              "sourceAlignmentFileHash": "sha256:8b4af568655ddfa0d9eff799e5601bdbdfbf250c07a142acf4e6354d89fcee53",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-zEKe86L75HPsyI/fsXucx39wiCmIUvhcIHUmesRnzKU=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-OB7OEHyj11TqEft0b+OZrVjmcJh/Fom+zzUEJWv8oAk=",
              "wavHash": "sha256:55998a1fdce049efe8d88425076289eb53c1f64d6991d556a06729665fe06700"
            },
            "period": "настоящее",
            "projectId": null,
            "return": null,
            "subtitle": "А теперь вернусь в настоящее. От программно-аппаратных систем для съёмки я пришёл к распределённой инфраструктуре и текущим агентным рабочим средам. Во всех этих проектах я соединяю исследование, архитектуру и реализацию в работающий процесс с понятными границами и проверяемым результатом. Сейчас главным центром этой работы стал Symbiote Workspace. Здесь можно продолжить знакомство с проектами, открыть резюме или связаться со мной.",
            "title": "Возврат в настоящее"
          },
          "lifecycle-messaging-platform": {
            "branchId": "lifecycle-platform-details",
            "chat": {
              "actionLabel": "Подробнее о Lifecycle Messaging Platform",
              "text": "Показываю распределённый контур Lifecycle Messaging Platform."
            },
            "media": {
              "durationMilliseconds": 37840,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-sKP7iUWFlw6sYYWh7LWGRP+jpo6Hhi3yxjMKHHf6JMg=",
              "sourceAlignmentFileHash": "sha256:4ddb4d1fa45902e1cb0a203161e631a1618ae35e144043660938a94840e94e38",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-0VvIdAmLXHh5UwQzvaNuTIBZ+ip/c7lPamGuvOQ49Vw=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-ckGXGS0ggimOc54e9yfoj1kgTCYstm2T7fzkGIJJ1+0=",
              "wavHash": "sha256:5efae76824e05cb192552bc2012f97b98a793203de37897acb34ce47ded10012"
            },
            "period": "2022–2026",
            "projectId": "projects/lifecycle-messaging-platform",
            "return": null,
            "subtitle": "Теперь вернусь к периоду 2022–2026 и к Lifecycle Messaging Platform. Это маркетинговая платформа для автоматизации клиентских коммуникаций: сегментация аудитории, управление кампаниями, opt-in SMS-сценарии и аналитика. Я проектировал API, распределение заданий, связь с удалёнными инстансами, мониторинг и инструменты эксплуатации. Для проверки модемного контура я сделал локальный Digital Twin с виртуальными устройствами и воспроизводимыми сценариями.",
            "title": "Lifecycle Messaging Platform"
          },
          "lifecycle-platform-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Lifecycle Messaging Platform."
            },
            "media": {
              "durationMilliseconds": 37930,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-mz+VOJAyW6nlpvQbnCN7e2qYMo9SY0DWnOQea7h7YG8=",
              "sourceAlignmentFileHash": "sha256:149cb7f5725e548267aca1788500077bc5c24b4a4896ec995ae9452ec5d7b4ec",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-KT6/+lLG2ICsHZiffpZbocRE2a06cik/Zjc37Ragb0s=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-CvyLD7WAESiNkgbGFBim6l+mklotNWVWdQ2z5N92Vc8=",
              "wavHash": "sha256:def322c74deaf058b5ddc1d33f868f5b984d5383f2d181409f6b0d319750d2a0"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.lifecycle-platform",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Платформа соединяла веб-продукт, серверную инфраструктуру и физическую доставку через модемы. API и PostgreSQL хранили продуктовые данные, WebSocket связывал runtime, а распределённые инстансы управляли пулами GSM-модемов через serial и AT-команды. Связь и устройства могли менять состояние, поэтому очередь, повторяемое выполнение и мониторинг сохраняли управляемость процесса. Digital Twin воспроизводил физический контур для локальной проверки. В одном историческом эксперименте создание материалов и их проверка работали как независимые контуры с разными правилами оценки.",
            "title": null
          },
          "maximo-workbench-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Adaptive Maximo Workbench."
            },
            "media": {
              "durationMilliseconds": 30560,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-UNQjPC/RXeXKN9aqXNN0TfjdxM3ybfppEpE4KR0jtJ4=",
              "sourceAlignmentFileHash": "sha256:e2827e7e565724a1dd0acca2e4efe9cbb3d6f444def4f23c7f527fe7913dc6ec",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-L+tN7JKrZ+FRkFIxp48klwPaB4Yd2vTlrz5q2y8kt34=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-ds7QJEDa9xW3mtQKmEWqeR5A5K2P8ulczEWKSKLjPrY=",
              "wavHash": "sha256:ec26a9b823bc0a9ea577cf8b67c19bd8b998991aee6aa40ebff8134739a89f11"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.maximo-workbench",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "В этом demo Workspace получает предметную конфигурацию для обслуживания оборудования. Панели связывают заявки, активы, локации, бригады и безопасные действия. Агент читает тот же актуальный контекст, который видит человек, и работает через объявленные действия интерфейса. Этот контур проверяет архитектуру Workspace на корпоративном процессе. Реальные данные, авторизация и Maximo API подключаются отдельным интеграционным слоем.",
            "title": null
          },
          "mobile-smm-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Мобильная SMM-платформа."
            },
            "media": {
              "durationMilliseconds": 38000,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-zu/jiPi4Y8Z1k9hcLyPQvGqj/6MoG2rHtawiA2TWPDI=",
              "sourceAlignmentFileHash": "sha256:c2fd7d2aeb605a55a82fb4bed27d79c1d55caf753a6080e68469cb18f668a3f9",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-WHrxXDqRPQtDain/HwUeuxbbUv+Gv+LZw25C9EfP7co=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-mPjlYYnwRUeq4nt5oZuntS0G1S0wEtehh8fLSc5u0Ho=",
              "wavHash": "sha256:25dbd5b963b9cc8c7c4197af98df3b95ac3b9c6bc8f9dd2710455f2201a20d5d"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.mobile-smm",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "В центре системы находится модель профилей, аккаунтов, медиаматериалов и публикаций. Сервер управляет расписанием, очередью и подключёнными Android-устройствами. Готовый JSON-сценарий выполняет стабильный путь и записывает результат в журнал. Если структура экрана изменилась, исполнитель останавливается в безопасной точке. Агент анализирует актуальный экран, готовит обновлённый сценарий и передаёт его на проверку. Исходящие действия проходят через лимиты, устойчивую дедупликацию и approval. Демонстрация заканчивается dry-run или подтверждением в журнале без внешней отправки.",
            "title": null
          },
          "mobile-smm-platform": {
            "branchId": "mobile-smm-details",
            "chat": {
              "actionLabel": "Подробнее о мобильной SMM-платформе",
              "text": "Показываю отдельный прикладной кейс мобильной SMM-платформы."
            },
            "media": {
              "durationMilliseconds": 30880,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-djLALpxv12Imez2AIy4zeMLitwpMmxgsm1wIn39gA9U=",
              "sourceAlignmentFileHash": "sha256:7b1f32bb305b572344a81311a47c65abb4b252b9bad8c820b12a2379fc2c19e7",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-dSbRbvNVgx2CgApzpMaK/ivsqhYbHhCpbx3KlWg6i2Q=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-ldemO1xVlQLniQokQFr96XA8uBRwkwHDYYqPhncEnPE=",
              "wavHash": "sha256:d50568297c895f2981a271dd00b116ae07defc7d38fff5a53e4921704c682631"
            },
            "period": "Date pending",
            "projectId": "projects/mobile-smm-platform",
            "return": null,
            "subtitle": "Отдельный прикладной кейс — мобильная SMM-платформа для управляемой работы с несколькими профилями. В одном контуре собраны медиаматериалы, публикации, расписание, входящие обращения и очередь. Android-устройства выполняют стабильные операции по готовым сценариям. При изменении интерфейса агент останавливает процесс, анализирует экран и готовит обновление сценария для проверки. Лимиты, дедупликация, согласование и журнал сохраняют управляемость действий.",
            "title": "Мобильная SMM-платформа"
          },
          "photopizza": {
            "branchId": "photopizza-details",
            "chat": {
              "actionLabel": "Подробнее о PhotoPizza",
              "text": "Показываю открытую основу этой линии — PhotoPizza."
            },
            "media": {
              "durationMilliseconds": 94900,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-eDpC1M8qLPoIhK61vEN1Nd68cnarq5iSt1oXprSGwHw=",
              "sourceAlignmentFileHash": "sha256:684297da301bcab8b965ce74d2583240a4e2a6d6bc972d5e5a31ac0cbb676147",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-xPlKDM2RdLq+R9LfBF0EIJN8K/P+koefJ50lesOluvY=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-qfETT9mLVlsk02Mrx1ZOmwazELOc74jl28RdOnxG2+8=",
              "wavHash": "sha256:4ba9b1bfdcbd5c53b3a9c0eb2452ac510305191216f5fed3a22a4a8fcd226098"
            },
            "period": "2010–2022",
            "projectId": "projects/photopizza",
            "return": null,
            "subtitle": "В начале этой линии была PhotoPizza, которую я развивал с две тысячи десятого года. Проект появился внутри MEGAVISOR как инструмент для повторяемой съёмки фото триста шестьдесят. Здесь показан ускоренный демонстрационный ролик о сборке первой версии PhotoPizza — без подробной инструкции. Это промо MEGAVISOR, где показан весь спектр поддерживаемого контента, включая фото триста шестьдесят объектов. Я продумал механику, электронику, прошивку, документацию и упаковку. Таймлапс сборки прототипа PhotoPizza из конструкционного алюминиевого профиля и шагового двигателя. Позже PhotoPizza стала open-source проектом. Здесь я показываю, как собрать простую поворотную платформу из подноса IKEA и вручную снять фото триста шестьдесят. Такие демонстрационные ролики я продюсировал для MEGAVISOR, чтобы популяризировать формат и снизить порог входа в технологию. Здесь я показываю новое веб-приложение PhotoPizza: с телефона запускаю съёмку и по Wi‑Fi управляю поворотным столом и камерой через веб-приложение. Универсальный блок управления работал с поворотными платформами, слайдером камеры и моторизированной панорамной головкой. На грузовой поворотной платформе PhotoPizza мы снимали в формате фото триста шестьдесят даже тяжёлые объекты, включая мотоциклы. Проект продолжал развиваться до моего переезда в Аргентину в две тысячи двадцать втором году.",
            "title": "PhotoPizza"
          },
          "photopizza-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: PhotoPizza."
            },
            "media": {
              "durationMilliseconds": 46490,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-H/CXpqxg6070QXiTwh7tn0flC1LGxBqOAsQ+5C2zKsE=",
              "sourceAlignmentFileHash": "sha256:ba1237c452ead2d0c6313a3cdd6902743967c7cc49b7b6483980794a1096ef5c",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-Kw7DZdY1a0zZNT9URODmLXxXTf9xGuKXZNeSVECbLqg=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-RMoRCLC1mu2okaZ6ojjYWtwJ0uYb4Djw0rFde5rdO2o=",
              "wavHash": "sha256:3f67194e42a6b77a7c20d54511cd2d8764631c1a023f148ee26c2d0ab64cc285"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.photopizza",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Изначально PhotoPizza была внутренним инструментом MEGAVISOR — облачного сервиса для фото триста шестьдесят объектов, три D-панорам, видео и виртуальных туров. В MEGAVISOR я разрабатывал технологию и оборудование и составил техническое задание на управляющее ПО; первую Arduino-версию по этому заданию реализовал привлечённый специалист. После MEGAVISOR я сам продолжил управляющее ПО на JavaScript и Espruino. Я подбирал доступные компоненты и подробно описывал сборку с калибровкой, чтобы люди могли собирать свои версии. Один контроллер управлял поворотной платформой, слайдером камеры и автоматической панорамной головкой. Этот открытый проект дал практическую основу для последующих экспериментов ComplexScan и AUTOBOX.",
            "title": null
          },
          "positioning": {
            "branchId": null,
            "chat": {
              "text": "Начинаю краткий обзор опыта и проектов."
            },
            "media": {
              "durationMilliseconds": 36640,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-JOArV0rr0CtyoeEZGkR6BP+RLhDjstcLyzJ+UaXrFBc=",
              "sourceAlignmentFileHash": "sha256:9470b8bc9a9112473a50c9fc10e20f6330acb18b717e69d5ad75d829ac097efe",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-nIG1jocxaADYHGDeMhX5ocQy7B66fM+Q5FbbrczQa9A=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-RoO5XeE+3RXrmDwopagoRE8OrBNcyj496GZU8lFCbyQ=",
              "wavHash": "sha256:aef01f7a96b1681d266c92b4965024b766e283bf311775f735d60892d8caadb8"
            },
            "period": "present",
            "projectId": null,
            "return": null,
            "subtitle": "Привет, я Владимир. Я R&amp;D-инженер: нахожу проблемы и продуктовые возможности, формулирую задачи, придумываю решения и довожу их до работающего результата — самостоятельно или отвечая за свою часть работы в команде. Сейчас мой основной фокус — программные платформы и агентные продукты. В этой презентации я покажу, как этот R&amp;D-подход работает в разных предметных областях — от программных платформ до медиа и оборудования — и отдельно обозначу свою роль в каждом проекте.",
            "title": "Кто я"
          },
          "project-graph-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Project Graph MCP."
            },
            "media": {
              "durationMilliseconds": 23360,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-doJGQbCkN59UhduTpqaVNRJsgq+xij6XDGURXsmks2A=",
              "sourceAlignmentFileHash": "sha256:f87ffed117b6b3892e3482cb6ed604f67fffbbb53a00ca6f1d8df4f7e428a04b",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-G/f27jo8Oj1UMot+MkMOu5Kh8xwL4JCSaXUh3b7OD+Y=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-msxvkmt7a+94R3uRMdpfDhNYqQKcUMVLV54Rxc4bYds=",
              "wavHash": "sha256:cc5a97dfc66b8fcb508def6c9d1ede2babf65fa712e8c4350b4884181aa1af7e"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.project-graph",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Project Graph MCP анализирует структуру репозитория и готовит несколько представлений: зависимости, скелеты кода, краткую карту проекта и факты браузерной проверки. Более быстрая модель может собрать эту карту, а сильная модель получает сфокусированный контекст для решения. Я использую этот слой как context engineering и структурированное извлечение с графовыми связями.",
            "title": null
          },
          "project-graph-mcp": {
            "branchId": "project-graph-details",
            "chat": {
              "actionLabel": "Подробнее о Project Graph MCP",
              "text": "Показываю слой структуры и контекста Project Graph MCP."
            },
            "media": {
              "durationMilliseconds": 38810,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-zUGqeZY57jwR2IOKDRgjRy4b26ZFte1RMJ8bnxr8EMs=",
              "sourceAlignmentFileHash": "sha256:6fbc8bde8d7455eeafd694768069be9a76b8ad16147bf206ae56d24e152eb432",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-96e9tHufOl01YTiwilsnamH3YmM9GTVcwGB0N7xBWPM=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-724/UnGUjLxE6dgIc82SmehIWVg4+M7RBD/R68YQwPs=",
              "wavHash": "sha256:470f154c45eba3426bf95f4346f16d9971483ba4872919ac03bbfbaaf186dba9"
            },
            "period": "2026",
            "projectId": "projects/project-graph-mcp",
            "return": null,
            "subtitle": "Второй инструмент — Project Graph MCP, самостоятельный open-source MCP-сервер для навигации по кодовой базе. Он строит компактный граф репозитория, который в Agent Portal отображается как визуальная карта проекта. Человек может выбрать интересующий узел, а агент — раскрыть для нужной части зависимости, скелеты кода, документацию и более подробный контекст. Так человек и агент работают с одной структурой проекта, а модель получает релевантные проверяемые факты, не перечитывая весь репозиторий. Исходный код доступен на GitHub, а интерактивное демо доступно по соседней ссылке.",
            "title": "Project Graph MCP"
          },
          "symbiote-engine": {
            "branchId": "symbiote-engine-details",
            "chat": {
              "actionLabel": "Подробнее о Symbiote Engine",
              "text": "Показываю исполнительный слой — Symbiote Engine."
            },
            "media": {
              "durationMilliseconds": 15200,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-GeID0VUpGpUtgSGxmpT+YAXZC9NcdkC4A/f3IqcKRW4=",
              "sourceAlignmentFileHash": "sha256:3fdf19cb86e1c82e39cbac3fe92d0ced879f2032cb1827a3ce1d2d3df69e79b1",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-My2rzO2kXuLWAL09R7GtVCO1BhDGaRhSYnKBRzBEtyc=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-PzOY4auoLHXP92JPnCcEw4RwAimCNQx+OgZpuC/74qo=",
              "wavHash": "sha256:103b25038b75b5de107d3d9c3d13165ade0cde21de4a694032fafe254d35af97"
            },
            "period": "2026",
            "projectId": "projects/symbiote-engine",
            "return": null,
            "subtitle": "Функциональные блоки даёт Symbiote Engine. Это серверная библиотека для сервисов, графов выполнения и автоматизации. Workspace соединяет визуальные блоки UI с этим исполнительным слоем в одной конфигурации.",
            "title": "Symbiote Engine"
          },
          "symbiote-engine-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Symbiote Engine."
            },
            "media": {
              "durationMilliseconds": 22720,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-eycB+ZX3mXKkTEVNuLcRHJqe/EJDH20h9Muq1rJLdoA=",
              "sourceAlignmentFileHash": "sha256:0a45841d909c06a292b316e30ef6cda23d49a193e06eeb1597eb80cf1730589e",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-BvWgkP9f+UdeJwS8NuWRk8+QjFc3vJ6AxpMgCeM74Xs=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-1b5Q/jDU5Yg+1o5+PRDFj/ZdV4AkPYZ1abYo6xhomKI=",
              "wavHash": "sha256:aa271eb6ea243bf99269592b6a62189319783c1763a4248fb1563e49094c86c1"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.symbiote-engine",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Symbiote Engine предоставляет компонуемые серверные примитивы: обработчики, команды, графы и хранение состояния. Продукт собирает из них свой backend-процесс, а Workspace связывает исполнение с переносимой конфигурацией интерфейса. Я сохраняю разделение слоёв, чтобы Engine можно было использовать в разных рабочих средах и сервисах.",
            "title": null
          },
          "symbiote-ui": {
            "branchId": "symbiote-ui-details",
            "chat": {
              "actionLabel": "Подробнее о Symbiote UI",
              "text": "Показываю визуальную библиотечную основу — Symbiote UI."
            },
            "media": {
              "durationMilliseconds": 29440,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-GcU+ovHzK+MY1Ieb1MJj5D5njiCQGXWAFNJKXJKDuyo=",
              "sourceAlignmentFileHash": "sha256:b6e20ecee60ff4725b1874c91788718608f4791d675fccd55a47e14e80188055",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-a0l2zScRYmCogZXnqm3kbEm+38H4hmTCRKx5+ioF+0Q=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-Yxy/fKLLLdpWFcEcly3unHomVbz83X95Bk2SoxYVsQ0=",
              "wavHash": "sha256:208a77fb3c2eb74de300de0570504483e1c7e862ecccdae2e34020faab8e00e3"
            },
            "period": "2026",
            "projectId": "projects/symbiote-ui",
            "return": null,
            "subtitle": "Визуальную основу Workspace даёт open-source библиотека Symbiote UI. В ней собраны компоненты, компоновки, графовые инструменты и семантические контракты интерфейса. На её основе построен и весь интерфейс этого CV: навигация, рабочие панели, чат и плеер презентации. Исходный код и техническое описание доступны на GitHub, а прямо в этой презентации можно открыть подробный разбор проекта.",
            "title": "Symbiote UI"
          },
          "symbiote-ui-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Symbiote UI."
            },
            "media": {
              "durationMilliseconds": 24160,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-auZssrnGEC8BT0247CNGk2unHJcZMxiQlDls+qDS1zo=",
              "sourceAlignmentFileHash": "sha256:ae2fe1d60c96686996aa0bde122faa9c464dc7cbb27a1d88c374de1f8b174031",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-fLRJzFUs7LlBi+acGWjVV35OjLHQ/tEfbq0DxB5UaIc=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-GwXYSlfLHSYdDcUvNJBcs8Zx9XI7q2i/tqbZ3PGoaJg=",
              "wavHash": "sha256:0fb03d28883796d06835976923cf836e182edf5e8aaaddc2b164400a46c52822"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.symbiote-ui",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Я развиваю Symbiote UI как библиотеку интерфейсных блоков, которые можно компоновать программно и описывать для агентов. Компоненты публикуют роли, состояния и безопасные действия через манифесты и WebMCP-контракты. Workspace использует этот каталог при сборке рабочей среды. Продуктовый смысл добавляет конкретная конфигурация, а библиотека сохраняет нейтральные переиспользуемые возможности.",
            "title": null
          },
          "symbiote-video-studio": {
            "branchId": "video-studio-details",
            "chat": {
              "actionLabel": "Подробнее о Symbiote Video Studio",
              "text": "Показываю Symbiote Video Studio как актуальный workspace-кейс."
            },
            "media": {
              "durationMilliseconds": 19510,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-qBsMLEq/fuw61Fnzvl3dpLhnKitD7H9j+JNJnegqqMA=",
              "sourceAlignmentFileHash": "sha256:26518a3c926131ba21f5c27a86b7fe7e88d0f81e747503b9df95773097820549",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-p2f+yDjmVOui4kAnEnKiHMJRbb8axeJQ07nFQyZnj7Q=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-FEtfkkztWhQzjUtK3QoymF7H7MdVTsR8/j9z5jChqZ8=",
              "wavHash": "sha256:48ce775c70f8233f99d1d9d1c42731d3784475d86ce6eb379f5e9d8878ab18a0"
            },
            "period": "2025–2026",
            "projectId": "projects/symbiote-video-studio",
            "return": null,
            "subtitle": "Ещё один актуальный проект — Symbiote Video Studio. Материалы, граф, таймлайн, предпросмотр и рендер собраны здесь в один видимый процесс. Агент работает с семантическими элементами интерфейса, а человек может проверить каждый этап. Сейчас Studio оформляется как конфигурация Symbiote Workspace.",
            "title": "Symbiote Video Studio"
          },
          "symbiote-workspace": {
            "branchId": "workspace-details",
            "chat": {
              "actionLabel": "Подробнее о Symbiote Workspace",
              "text": "Показываю текущий центр работы — Symbiote Workspace."
            },
            "media": {
              "durationMilliseconds": 24720,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-5Ks0jkXlVbiLrdwDKk/02tQwdYONz9FBLIeQ3V4qngA=",
              "sourceAlignmentFileHash": "sha256:5466c4e861431f3ff225f038e322e05f38ce861e67f45681877fe5d9534809e6",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-BC+O7QTG7QDCqrcTdoQkiG3b/qniCrOBgwwNnf+6aYE=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-cMhNpgCLdwktDCG7aUmTGayhfYstQ5+imMvoUx4cHvo=",
              "wavHash": "sha256:9908778ef14916420d7560c53a616df48afa2caf903c9c59d3d6533e82a15a2f"
            },
            "period": "2026",
            "projectId": "projects/symbiote-workspace",
            "return": null,
            "subtitle": "Начну с текущего центра моей работы. С середины 2026 года я развиваю Symbiote Workspace — универсальную среду, где агент собирает рабочее пространство под конкретную задачу. Результат сохраняется как переносимая исполняемая конфигурация. Некоторые мои текущие проекты появились раньше Workspace и теперь постепенно становятся его конфигурациями.",
            "title": "Symbiote Workspace"
          },
          "video-studio-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Symbiote Video Studio."
            },
            "media": {
              "durationMilliseconds": 28470,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-sr2HxdiEieS++qZCyHnEmc/1lTgTCggAJAmCf0sPkHk=",
              "sourceAlignmentFileHash": "sha256:b45f1ee37a4fbedf76d85e411c8c4e3be423ec255277de8fa3dc668ece0f50ce",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-zSiT/hdTM+JJss29yHMs2eG5XxvqiWk6tM5gUCn9gG4=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-DKYX+4zr5UbptIhKP5XGlWjYmHOzgLh2tneW+HV13A8=",
              "wavHash": "sha256:04c8d331aa4ec4f45d19fea3d4f88534af13a6effd2bd200e400572602f4f623"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.video-studio",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "В основе Studio лежит ядро Symbiote Video. Агент описывает структуру ролика семантической JSON-схемой: сцены, слои, клипы и переходы. Движок превращает описание в граф, таймлайн и композицию. В рабочей среде можно проверить node graph, запустить live preview, сохранить состояние и перейти к экспорту. Видео-ядро уже работает, а Studio как универсальная конфигурация Workspace продолжает развиваться в alpha-режиме.",
            "title": null
          },
          "workspace-details": {
            "branchId": null,
            "chat": {
              "text": "Подробная ветка: Symbiote Workspace."
            },
            "media": {
              "durationMilliseconds": 29070,
              "sourceAlignedSequenceHash": "workspace-aligned-sequence-v3:sha256-xyqkp62n/w+BX7TDwiBNJf++u0uTclLL+N/N6V6TFUQ=",
              "sourceAlignmentFileHash": "sha256:8f3fad035b189fdf6d6ab8a3c3614df287fd200286c3c0999a84d7b54d165bfa",
              "sourceNarrationCellHash": "workspace-presentation-authoring-project-v1:cell:sha256-6lTA33BPjdmi7z8rOekzlA4klDp01epNYlwo3jGxeW4=",
              "sourceTimelineHash": "presentation-timeline-v3:sha256-9yW5MROcgwVYAK0RnBmc7xc0I9OS21v45XUeMgUlrAA=",
              "wavHash": "sha256:0c404601661e4251401a4b6016a935d5edb189b7d99482115bf997b355e824a7"
            },
            "period": null,
            "projectId": null,
            "return": {
              "anchor": "short.after.workspace",
              "replayCompletedSpeech": false,
              "resume": "paused"
            },
            "subtitle": "Рабочая среда описывается конфигурацией: в ней задаются компоновка, панели, модули, действия и связи. Агент подбирает готовые блоки, валидирует конфигурацию и собирает интерфейс в браузере. Конфигурацию можно обновлять во время работы, сохранять и открывать в совместимом host-приложении. Секреты, авторизация и пользовательские данные остаются на стороне host. Я развиваю эту архитектуру как общий слой для специализированных рабочих процессов.",
            "title": null
          }
        },
        "narrationLocale": "ru",
        "runtimePolicy": {
          "attention": {
            "cursorCount": 1,
            "cursorPersistent": true,
            "exclusive": [
              "cursor",
              "frame",
              "native-selection",
              "activation"
            ]
          },
          "audio": {
            "detailVideo": "full-media-audio-with-silent-tour",
            "exclusive": true,
            "shortVideo": "muted-montage-with-tour-speech"
          },
          "branch": {
            "preserves": [
              "mode",
              "scene",
              "position",
              "playback",
              "subject"
            ],
            "returnState": "paused"
          },
          "marker": {
            "accumulatesWithinSeries": true,
            "clearOnAttentionChange": true
          },
          "ownership": {
            "productScenario": "cv",
            "sharedRuntime": "symbiote-ui"
          },
          "userInteraction": {
            "autoPause": "meaningful-only",
            "ignored": [
              "hover",
              "pointer-move"
            ],
            "resumeAction": "continue"
          }
        },
        "storyVersion": 1
      }
    },
    "personas": {
      "vladimir": {
        "locale": "ru",
        "name": "Владимир",
        "role": "presenter"
      }
    },
    "profile": "full",
    "source": "cv-show-authoring-project",
    "title": "CV Show"
  }
}
/* CV_SHOW_AUTHORING_PROJECT_INPUT:END */
);

export const CV_SHOW_AUDIO_RELEASE = freezeDeep(
/* CV_SHOW_AUDIO_RELEASE_INPUT:START */
{
  "acceptedProvenance": {
    "alignerContractHash": "cv-show-aligner-contract-v1:sha256-WJXMA0f9i4DwyS1CYrZ3FSAznMtAbhDA/lcaYjQVtNY=",
    "asrProfileHash": "cv-show-asr-profile-v1:sha256-xkDP1BOrbemy4iknmMC7Vj4rwXfu/OsnY5Q7ZPGcfIc=",
    "entries": [
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-MqF7FL5S+0RU8FyOTUyIHonyrbTM8fZkLwxsszuEV1Q=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-bfYXmZECWXVDxrq8Y7qBcjtSzfLvfme7ICOI5zpLllI=",
        "entryId": "positioning",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-nC7fTd53NcOL7fEAaov3HX90hRDWfyQOM5942TjnzrY=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-s8TlQtQjbjcNnxTuZMsvp91I04Xi5Qc0Uu0WRfyplcY=",
        "sourceCellIds": [
          "cv-show:narration:positioning",
          "cv-show:cue:positioning.tenure-marker:scroll",
          "cv-show:cue:positioning.tenure-marker",
          "cv-show:cue:positioning.workspace-transition:scroll",
          "cv-show:cue:positioning.workspace-transition",
          "cv-show:cue:positioning.open"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-9AA8Kp5B0vVJlMro0/1DHmQDhbPcp9Rzo/U9qdLcxbI="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-r5fmeI/rgD22Ue3P01gYOYBfl4ms/LV/uJJtPc7C4Ww=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-21nH89mRYG9IrgZ3rFha2FPigbkEwOXAP3KqiBOXJDc=",
        "entryId": "symbiote-workspace",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-ecxjq6sWmGXrh4AZhczyg2XUk9FkafbXQOAGzN1E0SI=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-1MflTZ1l44CbMvKmOSjQIeiMILJE3U28V4yzFbax42w=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-workspace",
          "cv-show:cue:workspace.open",
          "cv-show:cue:workspace.intro-frame:scroll",
          "cv-show:cue:workspace.intro-frame",
          "cv-show:cue:workspace.portable-config:scroll",
          "cv-show:cue:workspace.portable-config",
          "cv-show:cue:workspace.agent-portal-card:scroll",
          "cv-show:cue:workspace.agent-portal-card"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-8T8K90qppOVit8YVafoPHfyzyr4NwNSppzNOxz5yqXE="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-J0RaafV6dMuXhhOvqko/kVfQQyEAkwYpkTvQsLeg4FM=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-K683xkbRvDauUwDIsMcTrDNHfv2E+9uNXpS4Ul81xTI=",
        "entryId": "symbiote-ui",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-ZqeQEgpphRz0Fy/RB759dQtQY2BPkv099oI9ZLFoTYs=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-aNn9X76p4swYMJV2HD1eA6rMnf+0q5tKBDHs9XFkfkQ=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-ui",
          "cv-show:cue:symbiote-ui.open",
          "cv-show:cue:symbiote-ui.graph-tooling:scroll",
          "cv-show:cue:symbiote-ui.graph-tooling",
          "cv-show:cue:symbiote-ui.current-show:scroll",
          "cv-show:cue:symbiote-ui.current-show"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-2Es+KfFDcfkrtJdrTNcWs0CL2RWabRmPfbw8b9k4v/g="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-MHJhJN4//GIMq6RPi0uaFfJLkIA7h4/2axAfIKRADn8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-PxgA1jmphbdOsuGWLThmcFlS9KAkPlIcGvamzWUc3g8=",
        "entryId": "symbiote-engine",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Ibbe7zyvlOfrtgrZ3A0oCESRsMiGJQ3OgVrmVJpjoOo=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-rPFrozOo8qk7JXLQWW5Red6QWTeq7aQg2Px44b28TV8=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-engine",
          "cv-show:cue:symbiote-engine.open",
          "cv-show:cue:symbiote-engine.intro:scroll",
          "cv-show:cue:symbiote-engine.intro",
          "cv-show:cue:symbiote-engine.workspace-join:scroll",
          "cv-show:cue:symbiote-engine.workspace-join"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-flVqK6b0pA4uEgvhReKDQdNoOlvYcS3+QA/v6whdC/s="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-g1w6w2sU4sI+f5Exm1QmVW4drCBWN0JiYtCIWOlhFmU=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-eUIdQnLjrnvQ8qR/WEjGeZmsn5t1yVPxjjDC9dBdTIo=",
        "entryId": "agent-portal",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-s3ayNkdNkFVA+/+Ywla5Yc+Ne5QyEWPDMK8gHGjj5MI=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-hHSrN01ig6BsXnERdAzeJUwGplCkdWOMuSpFEDraEKc=",
        "sourceCellIds": [
          "cv-show:narration:agent-portal",
          "cv-show:cue:agent-portal.open",
          "cv-show:cue:agent-portal.path:scroll",
          "cv-show:cue:agent-portal.path",
          "cv-show:cue:agent-portal.human-decision:scroll",
          "cv-show:cue:agent-portal.human-decision",
          "cv-show:cue:agent-portal.open-source:scroll",
          "cv-show:cue:agent-portal.open-source"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-/7wLBaAaFVobkdHXEWpFT0PJsfFXpKmz7THXVDQkj8g="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-7nMDkWQX3/9OelAIh5xuAEDQ9MCfw7spgmYC/F5Q2qo=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ePLVKIGbM72AiBoNYr5Z7D1iXsfY86UJ4jd6wH71czU=",
        "entryId": "symbiote-video-studio",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-dU43w/2GT4qafqGql66QeExbAsiCMqcIlPchfzquxQw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-ifz7EfSK7QYcW3S8lVr3/0U+fzK+NRoOLXeWUEDV2Nw=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-video-studio",
          "cv-show:cue:video-studio.open",
          "cv-show:cue:video-studio.visible-process:scroll",
          "cv-show:cue:video-studio.visible-process",
          "cv-show:cue:video-studio.demo:scroll",
          "cv-show:cue:video-studio.demo"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-qxSGZpPkOjcMOUHxcl/VVH5Qcf/WsEAkMENzNULa4+A="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-XG99cKWgpMddBKxJJHureISezZ/1H6vcZm2x2S6ahoY=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-4pi3ZWJ2Aw/X6z6LwDS9XYiIV8MeFc1itg1gG90MUog=",
        "entryId": "adaptive-maximo-workbench",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Oj5ShPZXip5Dz1RXMACMehFnM9DxW8Eli3DUEzRUJys=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-Ze9BzvKLMIOQqh0iz3bwtW3NeLLWZkIaAbxjynnfz4E=",
        "sourceCellIds": [
          "cv-show:narration:adaptive-maximo-workbench",
          "cv-show:cue:maximo.open",
          "cv-show:cue:maximo.work-orders:scroll",
          "cv-show:cue:maximo.work-orders",
          "cv-show:cue:maximo.asset-context:scroll",
          "cv-show:cue:maximo.asset-context"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-TrGu+UrLzDyh1f/IhuJRB/AFBXyj+iiCmcZz/zz6sJk="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-GBa1BwmxIGdUyNikmYPwYUVn24rSzNLKAPlpSyv6A1U=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-hxu52C2IzGLVrf6R+1Kcv2g/Y805YV/vbZdNJ3qpHiM=",
        "entryId": "agent-pool-mcp",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-7FdzEUJjbV9IJoMi9vGq7obOp/rJ9ps6rvJFTodEsJ0=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-yO9FZv9AI0u20GFC9q8tJmfNvNnxcef9AFQ/62n82/A=",
        "sourceCellIds": [
          "cv-show:narration:agent-pool-mcp",
          "cv-show:cue:agent-pool.open",
          "cv-show:cue:agent-pool.flow:scroll",
          "cv-show:cue:agent-pool.flow"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-oI3mv0/3TAV8KqHPS4wpZgDPJLyFGo+gYZdIgoIAwx4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-jTZrtI2V44p6IEJoI7RY/A6lgBOjBwUcQdLnnH9G6r4=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-iXrvNAHI7KJn+vSkxJwyqYmYK2YDpJ7CBPGQAupwXqA=",
        "entryId": "project-graph-mcp",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-Odz/nmDpm+uZtKJYpkqLp/lFFs8t8+N+in2kxCd+ssA=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-U58IW8+hFFKJ0WGIvcHjDwhN8KMZkqtvi5FSngtQSRM=",
        "sourceCellIds": [
          "cv-show:narration:project-graph-mcp",
          "cv-show:cue:project-graph.open",
          "cv-show:cue:project-graph.example:scroll",
          "cv-show:cue:project-graph.example",
          "cv-show:cue:project-graph.context:scroll",
          "cv-show:cue:project-graph.context",
          "cv-show:cue:project-graph.node:scroll",
          "cv-show:cue:project-graph.node"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-khvzxZ2eBFNLVOKkH5rM/CEC/PoFQiPbvixwX21eCkc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-FEP/I4HKENhldG4MmDa7NU2HVRE/hH0XfQS0MYCB27E=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-GxzF8nyPWcnkaZCYkuYINxmkARGVaOIcpnhoEpg4aMM=",
        "entryId": "lifecycle-messaging-platform",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-i0YBbwB9i8I17w59HTNxzSTGe2BkoHF9FnXGF9TSdMw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-q3aLZb3lW4E6osTGeyHyY8nlcqR5xdAESmvEc9NR7QE=",
        "sourceCellIds": [
          "cv-show:narration:lifecycle-messaging-platform",
          "cv-show:cue:lifecycle.open",
          "cv-show:cue:lifecycle.scope:scroll",
          "cv-show:cue:lifecycle.scope",
          "cv-show:cue:lifecycle.product-number:scroll",
          "cv-show:cue:lifecycle.product-number",
          "cv-show:cue:lifecycle.runtime-number:scroll",
          "cv-show:cue:lifecycle.runtime-number",
          "cv-show:cue:lifecycle.digital-twin:scroll",
          "cv-show:cue:lifecycle.digital-twin"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-0SXF/hXwnd9OR1HA0Tiz4C/t1au7Dt8Pczb//2bf0pQ="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-E1giGAKjGplkmFvuStgQsqSv/JEvUE77QZNlLEWoZCY=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-/7Rf4I08J9S2kvJ0BjwtP6IlPERfMvfuayMubRX805w=",
        "entryId": "mobile-smm-platform",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-+fNIC9y6v/I+6WcjfrqOghi2LoDQrv6D3FmcAk2c+Pk=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-qPcdeY+Q5VYvJRX3T6R04guNYEqzfCSwzDv3U7LVFjQ=",
        "sourceCellIds": [
          "cv-show:narration:mobile-smm-platform",
          "cv-show:cue:mobile-smm.open",
          "cv-show:cue:mobile-smm.overview:scroll",
          "cv-show:cue:mobile-smm.overview",
          "cv-show:cue:mobile-smm.stable-path:scroll",
          "cv-show:cue:mobile-smm.stable-path",
          "cv-show:cue:mobile-smm.agent-update:scroll",
          "cv-show:cue:mobile-smm.agent-update"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-f0oOUXCHnn45mgkjqfBSHzVR6XtxyE5uuIho7rD9Uiw="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-rVl67pA0s+xXsYFJJVquywdT2ldVmQ7qHAMC+jhEtu8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-2krwOn725y4pbD4EXSLpha/rR+kZ85k9LUYAQcggXVQ=",
        "entryId": "f360-studio",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-tR9/r1do58pAeCE62+4YQPVr02cDWom7bTkU51o52Ks=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-f9DLeivAYg2ON6ZHekFQgk+NyNEXBABkJ/HkdZK9yMg=",
        "sourceCellIds": [
          "cv-show:narration:f360-studio",
          "cv-show:cue:f360.open",
          "cv-show:cue:f360.process:scroll",
          "cv-show:cue:f360.process",
          "cv-show:cue:f360.result:scroll",
          "cv-show:cue:f360.result"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-qfq8f290phoy+xlWUKsJQpfP1m2Bo6/G/2Mhz7SaWyY="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-ZXyVhkglAuQcVE7ALm5YvSGNQBwLjm1uHqsvOvNZJe8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-Pjco8z/lQk5FXRBN49csEzfJxKRiLazVoYp+eyKNBuo=",
        "entryId": "autobox",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-EOSbYj9+2UMK/BFcY+esUbdrOjpp+JcM8lNFPZ1D/4E=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-gaxS+MfY9q7XJnBzmHF4C/UuK4TJdc8kPdPil6AnQ2o=",
        "sourceCellIds": [
          "cv-show:narration:autobox",
          "cv-show:cue:autobox.open",
          "cv-show:cue:autobox.video-01:scroll",
          "cv-show:cue:autobox.video-01",
          "cv-show:cue:autobox.video-02:scroll",
          "cv-show:cue:autobox.video-02",
          "cv-show:cue:autobox.video-03:scroll",
          "cv-show:cue:autobox.video-03",
          "cv-show:cue:autobox.video-04:scroll",
          "cv-show:cue:autobox.video-04",
          "cv-show:cue:autobox.video-05:scroll",
          "cv-show:cue:autobox.video-05",
          "cv-show:cue:autobox.video-06:scroll",
          "cv-show:cue:autobox.video-06",
          "cv-show:cue:autobox.video-07:scroll",
          "cv-show:cue:autobox.video-07",
          "cv-show:cue:autobox.video-08:scroll",
          "cv-show:cue:autobox.video-08",
          "cv-show:cue:autobox.video-09:scroll",
          "cv-show:cue:autobox.video-09"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-mJBsY9IeomjVQ5zHpry+cv8JDFK8l2q9MZfnv+Yas+s="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-0F0EqSfVZJym8A4rSlVDmEXKDurJsYZnaUq47xdFDcA=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-JsA5vefg8tMTD/nIcTJKQmVgLCJTxeXEnR1BeQOPCKA=",
        "entryId": "complexscan",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-xI3GNLdYGAObfE7o/G4L0J/uw8Vj5JVRIB2HL8zztkU=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-3lWOHGMNue5E2Gr3Vn/v7uMEBHkzeUn36wu61dSfqZg=",
        "sourceCellIds": [
          "cv-show:narration:complexscan",
          "cv-show:cue:complexscan.open",
          "cv-show:cue:complexscan.line:scroll",
          "cv-show:cue:complexscan.line",
          "cv-show:cue:complexscan.video-01:scroll",
          "cv-show:cue:complexscan.video-01",
          "cv-show:cue:complexscan.video-02:scroll",
          "cv-show:cue:complexscan.video-02",
          "cv-show:cue:complexscan.delivery:scroll",
          "cv-show:cue:complexscan.delivery",
          "cv-show:cue:complexscan.boothbot-open:scroll",
          "cv-show:cue:complexscan.boothbot-open",
          "cv-show:cue:complexscan.boothbot-gallery:scroll",
          "cv-show:cue:complexscan.boothbot-gallery",
          "cv-show:cue:complexscan.boothbot-catalog-ready:scroll",
          "cv-show:cue:complexscan.boothbot-catalog-ready"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-BaSWDgOhyQdBHeoYVDANgfo3iU6DxiLbfrCCeSt0j6Q="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-/CZ8wAk4VLfoV0L8CB4vvf5GxPA/gec9XAw98zEMemk=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-s63R4hyHm9W6ncbqs/y8DT8CifieKb0n9Y6S/qmT3Mc=",
        "entryId": "photopizza",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-u72hRX3bBZNzgnrvlS10ELqQvHHOo/0MrYtDUK7+4tw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-8T37C1Khs3xOgEl036hFK6m5W7t/UuN9K44vywWSiZ8=",
        "sourceCellIds": [
          "cv-show:narration:photopizza",
          "cv-show:cue:photopizza.open",
          "cv-show:cue:photopizza.origin:scroll",
          "cv-show:cue:photopizza.origin",
          "cv-show:cue:photopizza.video-01:scroll",
          "cv-show:cue:photopizza.video-01",
          "cv-show:cue:photopizza.video-02:scroll",
          "cv-show:cue:photopizza.video-02",
          "cv-show:cue:photopizza.mechanics:scroll",
          "cv-show:cue:photopizza.mechanics",
          "cv-show:cue:photopizza.video-03:scroll",
          "cv-show:cue:photopizza.video-03",
          "cv-show:cue:photopizza.video-04:scroll",
          "cv-show:cue:photopizza.video-04",
          "cv-show:cue:photopizza.video-05:scroll",
          "cv-show:cue:photopizza.video-05",
          "cv-show:cue:photopizza.controller:scroll",
          "cv-show:cue:photopizza.controller",
          "cv-show:cue:photopizza.spinner:scroll",
          "cv-show:cue:photopizza.spinner"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-pUbApeZUeJJGg33FDmszyHb8a/aflm3KutN7U+k3mZs="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-eF35+d3j+FTo0vgszljxaVoHaNAdigKW2VR1OTLSbxo=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-+EDxnxCQYgMycL+tZt/tawrRU2cUKu2KF8U0E/60OBY=",
        "entryId": "finale",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-KT1Qme7E+OT6ljitQ8o/UvK5sxUobwlehE9p91SFHs8=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-BcabBttpbInDPu/kwUru5AmIeUyt5woUzwkETudnwtE=",
        "sourceCellIds": [
          "cv-show:narration:finale",
          "cv-show:cue:finale.map",
          "cv-show:cue:finale.history:scroll",
          "cv-show:cue:finale.history",
          "cv-show:cue:finale.scale-route:scroll",
          "cv-show:cue:finale.scale-route",
          "cv-show:cue:finale.workspace:scroll",
          "cv-show:cue:finale.workspace",
          "cv-show:cue:finale.actions:scroll",
          "cv-show:cue:finale.actions",
          "cv-show:cue:finale.contacts:scroll",
          "cv-show:cue:finale.contacts"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-rWU7mMsFV+ubyhx6XlAYWBmbzowyaZKOPA5aJK7GyYw="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-I2xcNQBfH4ShOz0uQxtTvR4lbv3r+UiTypxgQpjD7W8=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-a+D0wFPzhuV2GGGRu2WUSho/HEGy3JVuOhvadcTOg9E=",
        "entryId": "workspace-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-gJZIPt+xJ0K/4GAEhWLbRO9WXjsnyXx1cevZqaUo0eg=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-tiB1+KZ73hSqxn50Gi6Q6AjZLo/hoJ4cvlbAMbIObrk=",
        "sourceCellIds": [
          "cv-show:narration:workspace-details",
          "cv-show:cue:workspace-details.flow-frame",
          "cv-show:cue:workspace-details.flow-route:scroll",
          "cv-show:cue:workspace-details.flow-route",
          "cv-show:cue:workspace-details.artifact:scroll",
          "cv-show:cue:workspace-details.artifact",
          "cv-show:cue:workspace-details.hosts:scroll",
          "cv-show:cue:workspace-details.hosts"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-REl1jXRSVmzu+Up/W2+Iy8Oql822P+uyKHnjx/04xYc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-FYe9HUlZD3hnz0FYDPetYgvVm/iIKbGddMZp+eC/hQM=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-ijoDEBs8mKJqCanMWI43QYCmgUoxPHJcGT+gOEBQlPo=",
        "entryId": "symbiote-ui-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-kS04RDdKdg07cb9096RBA4u9jX5X2u3OYnQiRrJMTU8=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-ocL+PPhzotor+2wU6+91cX2FOOIQWXQ/Lg6CP47T45I=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-ui-details",
          "cv-show:cue:symbiote-ui-details.composition",
          "cv-show:cue:symbiote-ui-details.catalog:scroll",
          "cv-show:cue:symbiote-ui-details.catalog",
          "cv-show:cue:symbiote-ui-details.manifest:scroll",
          "cv-show:cue:symbiote-ui-details.manifest",
          "cv-show:cue:symbiote-ui-details.workspace-route:scroll",
          "cv-show:cue:symbiote-ui-details.workspace-route"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-+sXOW3TTlXWmYPiw1K/eutI7ZocP5T5bLI63lJzQ2wM="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-nIrt+ncXzQdJqIeDe2FlkUbHJkdlf6Il1G6zmbDXdFU=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-n2+JeCPnXURGr218HDki6UaqqXwvA6kVaTAbmuKM6eU=",
        "entryId": "symbiote-engine-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-3in5L1MznaS68XLZnENZA4+0gzxSdMMRrzX6ilG1fcw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-AMyZEHy00ukCVJbTWUrst0khhlktoo4b8k642sVy45U=",
        "sourceCellIds": [
          "cv-show:narration:symbiote-engine-details",
          "cv-show:cue:symbiote-engine-details.layers",
          "cv-show:cue:symbiote-engine-details.execution:scroll",
          "cv-show:cue:symbiote-engine-details.execution",
          "cv-show:cue:symbiote-engine-details.demo:scroll",
          "cv-show:cue:symbiote-engine-details.demo"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-bxYqsAJZlI/C58me3OTZo9oc9r/Vcp3XDw86FGquJzg="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-64ZOk4irzViJuHdOfd5jvaYC1T8QBCLX4x5ulIaPOBU=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-CnRh42tqu1WAwm/lNlFsYjTIGA2oBqnkukhWiv0vwj8=",
        "entryId": "agent-portal-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-RxxgTRTLIOZURY5kNNnSR5By+MkDHoqW6XRm6qbhh0o=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-eNCe6LMf91ZqHn31n15OcgHYYBy0aQP+PPw3SwZlzvY=",
        "sourceCellIds": [
          "cv-show:narration:agent-portal-details",
          "cv-show:cue:agent-portal-details.gallery",
          "cv-show:cue:agent-portal-details.board:scroll",
          "cv-show:cue:agent-portal-details.board",
          "cv-show:cue:agent-portal-details.settings:scroll",
          "cv-show:cue:agent-portal-details.settings",
          "cv-show:cue:agent-portal-details.architecture:scroll",
          "cv-show:cue:agent-portal-details.architecture",
          "cv-show:cue:agent-portal-details.resource-groups:scroll",
          "cv-show:cue:agent-portal-details.resource-groups"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-dMz0mDwAxfs3sFE7unmJoSaIXKoqzWqr3rS3pXeRcWc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-mj1sdU4asyvrKHi23atvTbwT+4tMbbWeJIqHRoOAM3g=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-0cVjN0OAiE3TjRBP9/QfaPDLcupeKIAM3RDhAQdsGV0=",
        "entryId": "video-studio-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-rI3rRURbQn7zPFFnJBZMUiQ+3CJuXVV6XNnVW881vjE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-vs4IF3iSo4tkOTjJWCnjYjLbCkF3zwDLpJrZM3MzFJ4=",
        "sourceCellIds": [
          "cv-show:narration:video-studio-details",
          "cv-show:cue:video-studio-details.flow",
          "cv-show:cue:video-studio-details.route:scroll",
          "cv-show:cue:video-studio-details.route",
          "cv-show:cue:video-studio-details.demo:scroll",
          "cv-show:cue:video-studio-details.demo",
          "cv-show:cue:video-studio-details.media:scroll",
          "cv-show:cue:video-studio-details.media"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-vBNZwX1ws3mRIgcB+0JSteqfhZACPpa8XIrjrsmO1oo="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-yxKFR8EDsrWKGPThU/lDHnzNHHjr4Ee4JadXiZmOOU4=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-7atYy6+mWykrcBntzulqzq0C3l0p/aLCaosBfdV1YzE=",
        "entryId": "maximo-workbench-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-5qF1lmSy3plGDFpIJihteCNH+tanEkYXZrMJwtC9t2E=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-ypjBZRKrPbAmcN/yeg7aJ2n1L6/N7Z5l8NgJdehNz4E=",
        "sourceCellIds": [
          "cv-show:narration:maximo-workbench-details",
          "cv-show:cue:maximo-details.work-order",
          "cv-show:cue:maximo-details.asset:scroll",
          "cv-show:cue:maximo-details.asset",
          "cv-show:cue:maximo-details.actions:scroll",
          "cv-show:cue:maximo-details.actions"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-AjSD8rNQFZ0fDqmwZKdTIcTj9RbWwVT5EtremEBzdDQ="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-3+orbJ05zzo5c+QBN7QZXX79pYnenSLKqPGLpW8D79g=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-b4gUQ59XggsXYaqGVgQvtBmRfEJ0Tjh27IlaY9lKFAE=",
        "entryId": "agent-pool-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-n0TewvZHocwi+qvmNoYWXLv4Vudqti9uoPER+aqFovY=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-F+8mq4X6QpUzNMaj7beb+DPpeCjG7r3Id/74KuVgais=",
        "sourceCellIds": [
          "cv-show:narration:agent-pool-details",
          "cv-show:cue:agent-pool-details.runtime",
          "cv-show:cue:agent-pool-details.work:scroll",
          "cv-show:cue:agent-pool-details.work",
          "cv-show:cue:agent-pool-details.review:scroll",
          "cv-show:cue:agent-pool-details.review",
          "cv-show:cue:agent-pool-details.result:scroll",
          "cv-show:cue:agent-pool-details.result"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-5HORJujJQPWYr4ZST2necaaQvac5HaHtn9gviQtJToA="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-3ptsQRNt1+O8UQ3ffTsKthdqJ/c/VDAyPvi7P1HfZrQ=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-EDCEYIWpVUiaSugQSBt3vnZABjBPRgVhRnf4j/nyMZg=",
        "entryId": "project-graph-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-bWh3qwmWRLO5jk/xEXTZWTBsnALxjIzNrhBYGgQcNVo=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-lDGzFtBnppSvyLGrSfyd84peKskC0N/12iG2x86yHEQ=",
        "sourceCellIds": [
          "cv-show:narration:project-graph-details",
          "cv-show:cue:project-graph-details.root",
          "cv-show:cue:project-graph-details.skeleton:scroll",
          "cv-show:cue:project-graph-details.skeleton",
          "cv-show:cue:project-graph-details.fact:scroll",
          "cv-show:cue:project-graph-details.fact",
          "cv-show:cue:project-graph-details.focus:scroll",
          "cv-show:cue:project-graph-details.focus"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-U5672TR7hX8fvDKzDRF2GIfuxd0VL8mrR0O9gab/ZU8="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-tHZLi72iiJq8LYSZaYp166bAqSN3c+7r4fsBe2D6Go0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-u5iKpR9S8Bc9IsXDn9WliPDL4v5pqG9S0swxBuVPGyY=",
        "entryId": "lifecycle-platform-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-vynsgXU65aTecIC/6cO11r95l+ytjnoURH98tKCwJvw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-+25no3KlXBzWrWZUPhG9us+iGyj40P6MDHCmI/Pb3QI=",
        "sourceCellIds": [
          "cv-show:narration:lifecycle-platform-details",
          "cv-show:cue:lifecycle-details.product",
          "cv-show:cue:lifecycle-details.runtime:scroll",
          "cv-show:cue:lifecycle-details.runtime",
          "cv-show:cue:lifecycle-details.delivery:scroll",
          "cv-show:cue:lifecycle-details.delivery",
          "cv-show:cue:lifecycle-details.route:scroll",
          "cv-show:cue:lifecycle-details.route",
          "cv-show:cue:lifecycle-details.twin:scroll",
          "cv-show:cue:lifecycle-details.twin"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-DX9SzMhIQY2Nh7AtaK8YDnQWrv+Apk0X5SvcK5rG33g="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-bs9al8Yfz4Sk1zJWFb94/AZ5b6sNVAAbIW2KJ8SGB+Y=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-DAj3fkBKPP1S5OOC7pDZKd6SighcRgmgESu62EwGakw=",
        "entryId": "mobile-smm-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-S0jTfSf2h61QiZbg8iKty+GV3zktGlj+5WckO0L41RE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-uNbHfsKyRsyupm9Q7sWKgTC2krCOsrR0IC/VmL6Lzko=",
        "sourceCellIds": [
          "cv-show:narration:mobile-smm-details",
          "cv-show:cue:mobile-smm-details.gallery",
          "cv-show:cue:mobile-smm-details.schedule:scroll",
          "cv-show:cue:mobile-smm-details.schedule",
          "cv-show:cue:mobile-smm-details.queue:scroll",
          "cv-show:cue:mobile-smm-details.queue",
          "cv-show:cue:mobile-smm-details.ui-change:scroll",
          "cv-show:cue:mobile-smm-details.ui-change",
          "cv-show:cue:mobile-smm-details.approval:scroll",
          "cv-show:cue:mobile-smm-details.approval",
          "cv-show:cue:mobile-smm-details.draft:scroll",
          "cv-show:cue:mobile-smm-details.draft"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-oU24ypo+CjabJYt10vI3YJwIvpopDOV4mHYtEgG/Ptc="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-lUj7LLwMd/cwLYSQmpv48AehBOk11DKKj3r2r+1uYxk=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-WoZmbRaOwhabl8dKPahs78diyLYx20uGIPzxKBvn5Vw=",
        "entryId": "f360-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-ChnFxmvGkDi/zFD1o+5pa9Iw36bIYoXCgqfZhmS0nx8=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-0ZEUAlsmhBEdOIPKTqo8Gj4UgZPb+GSKxeyzBtgSJUs=",
        "sourceCellIds": [
          "cv-show:narration:f360-details",
          "cv-show:cue:f360-details.path",
          "cv-show:cue:f360-details.result-one:scroll",
          "cv-show:cue:f360-details.result-one",
          "cv-show:cue:f360-details.period:scroll",
          "cv-show:cue:f360-details.period"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-Ssr/l/Xbdj0SWF+n4at2pap8gnDOuEJhlyDJfPZ91UU="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-eAXsohY/DfhdKozbW+ecJcTAX6bKtAa7h8QrWPCSC/c=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-OO5nY/6Mm9oXPzEwlxIeFsy2vFmblD5d6MZpmbmUGCM=",
        "entryId": "autobox-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-kLLPcBNazi2niiNhBzSHNESjKxNoKYqssvx8jt7Xabw=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-HJUTxlPPjwUToVnot1ybzSNNNfXEx9b1q+Uib6hT5To=",
        "sourceCellIds": [
          "cv-show:narration:autobox-details",
          "cv-show:cue:autobox-details.working-system",
          "cv-show:cue:autobox-details.working-route:scroll",
          "cv-show:cue:autobox-details.working-route",
          "cv-show:cue:autobox-details.video:scroll",
          "cv-show:cue:autobox-details.video",
          "cv-show:cue:autobox-details.bronze:scroll",
          "cv-show:cue:autobox-details.bronze"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-Z3c40a70B0ebplb5Oo68oDkwMWT3LuWlCmPna0uBDec="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-G+mkBFeZ1GKPghStsuA0LTi/XmB0KW8WwNMHfxYzHr0=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-U4eOw7tNpJn5bdZzTJHGYuUjH7oXGw5ZiKA8Uv9vado=",
        "entryId": "complexscan-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-mDVVIV7wgIlRYoNfwv88WR8lcnQOrlIROJ7F9w6wRBc=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-0tw1gfiGtDTJv3zgI6fMUZfnVvbjfACPUVkYgT45ehE=",
        "sourceCellIds": [
          "cv-show:narration:complexscan-details",
          "cv-show:cue:complexscan-details.platform",
          "cv-show:cue:complexscan-details.light:scroll",
          "cv-show:cue:complexscan-details.light",
          "cv-show:cue:complexscan-details.gallery:scroll",
          "cv-show:cue:complexscan-details.gallery",
          "cv-show:cue:complexscan-details.autobox:scroll",
          "cv-show:cue:complexscan-details.autobox"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-aDpsJmig3FcH94X2glmNKwQzJ7FOsGVBUbt4teI58E4="
      },
      {
        "anchorContractHash": "cv-show-anchor-contract-v1:sha256-eDG/Y2IVclDhoYI/XedK1t21tnBi2J+qsE81cBMozuM=",
        "attentionContractHash": "cv-show-attention-contract-v1:sha256-jJ3YvXIwXdJtWN9ri/CzeqG78/vXOgJClz1YkBM/i5k=",
        "entryId": "photopizza-details",
        "entryProjectionHash": "cv-show-entry-projection-v1:sha256-SPiBZESacRJ96c9C9N/mXHThPzB0Mr3OKBjCU456qUE=",
        "narrationInputHash": "cv-show-narration-input-v1:sha256-dKaNQ7CChtdYXLH0LB28/d5PWjEvla2krTUvGy0KASk=",
        "sourceCellIds": [
          "cv-show:narration:photopizza-details",
          "cv-show:cue:photopizza-details.origin",
          "cv-show:cue:photopizza-details.attribution:scroll",
          "cv-show:cue:photopizza-details.attribution",
          "cv-show:cue:photopizza-details.media:scroll",
          "cv-show:cue:photopizza-details.media",
          "cv-show:cue:photopizza-details.documentation:scroll",
          "cv-show:cue:photopizza-details.documentation"
        ],
        "synthesisInputHash": "cv-show-synthesis-input-v1:sha256-SgEaflEyjb9U4ssSelo7BAchd9vgWDHLBCQfw9TEk/0="
      }
    ],
    "hash": "cv-show-audio-provenance-v1:sha256-3yMf5FefYxTcHsnSSFZsDjps6lbOg5PQH+OmMMkdYMg=",
    "schemaVersion": "cv-show-audio-provenance-v1",
    "synthesisPolicyHash": "cv-show-synthesis-policy-v1:sha256-tmPYbXui+VSD22zqx0k1SGrZoagN9dmfs14QMmm/g2k=",
    "voiceIdentityHash": "cv-show-voice-identity-v1:sha256-fr9DLXnwdaC3f50U49dDoU05D2Vrmau5l5gLhxCIF4Q="
  },
  "artifactTreeHash": "cv-show-audio-artifact-tree-v1:fae87df0d7d165f0cebe598cf9a3fd93a41a05be3a3bb319d7f77300ea87ab47",
  "entryReleaseIds": [
    "cv-show-audio-entry-release-v1:29440aedd3a4764df9c8b905f93719757c2e864fc2b52e2b3a4c491751bbf783",
    "cv-show-audio-entry-release-v1:a5c4f576d90384b7a57cf39329c422d4965030beadc6472c7bdb2c883a652eac",
    "cv-show-audio-entry-release-v1:a6e2b3058287d42ea0055f1905df5da7308ea56a2fee2321a05ca51062268dd4",
    "cv-show-audio-entry-release-v1:f36504faf99d61fcce52b0a7690d631a2f751ea8fc9e44f8b38cdd001d1a3cf3",
    "cv-show-audio-entry-release-v1:0601cc1d50a9279e493f53ac7e8605888100ef9f5015d81663595f91beb6ab93",
    "cv-show-audio-entry-release-v1:7edeeab3b801c9ff2f488597385622e6f3cdc07709a86dc6ecaf1d00a732718e",
    "cv-show-audio-entry-release-v1:ad7c2758bf4e361ef2954182ed0c13fca161e30bd8e91a080d880d49003df1a4",
    "cv-show-audio-entry-release-v1:51242e5e65079fb75612bd7759c89c58762ec6f1eba8be5ded0eae6ec9a83fc5",
    "cv-show-audio-entry-release-v1:23b500870b752a9f137942b4f28b3402f2c74df0682507b5334bf04ac9df117a",
    "cv-show-audio-entry-release-v1:f32281c027def3385df8c8dd168703ea407edf5dbc0ecead790c8710c1b9dbf4",
    "cv-show-audio-entry-release-v1:85f51b484c4cff804713bb3ea26ffdc14644bfedaa4e6606cb448ef4316c0925",
    "cv-show-audio-entry-release-v1:1e6e467704bef25f18a0ddf825563b7c027067c6d17c30fb3a0a869e1c7974ad",
    "cv-show-audio-entry-release-v1:6a81f3b4a0a93084c7460e536af01a4a084a3315224b56a8d312e53e1eeb9be4",
    "cv-show-audio-entry-release-v1:70f7176fc0112af3b473a08112f5f786ad8f343f0a21fe567a78f208db0dbadd",
    "cv-show-audio-entry-release-v1:efbf0eab40eefc3e753c1f1fe50ff4a26bd0f9b72bf40dbc5abdcea6049c908d",
    "cv-show-audio-entry-release-v1:351a48a983553f6a39e86fd9c62b7048f314b591212de4a520cbce1a1b9b3587",
    "cv-show-audio-entry-release-v1:a05e373204f323aabb0e191ce8499e4fe51efcaab53039a5f8c2e6ba6bec283e",
    "cv-show-audio-entry-release-v1:c09b870f70c574ee7291830caa52d045db6752dfd6623b0b0803047e0e5d0f01",
    "cv-show-audio-entry-release-v1:a8938ca5bc7405281076d593a2d77e31fa9923751ce2e809199d19dc2ca87cbb",
    "cv-show-audio-entry-release-v1:e3295ff7ecdd97d8b44c6cbde1115df11a65e34f1c801d75504444635ac3230a",
    "cv-show-audio-entry-release-v1:12d4c947b2af607a72f2521a8586e4829a316efb82b1deacba9436410f743a0d",
    "cv-show-audio-entry-release-v1:f19eb61ef3bc1d5ffe3bc4f6008e384533d4172dfadd27f600498c17ef42b7f4",
    "cv-show-audio-entry-release-v1:a7c9e7fe602f3b45cab2175839016bf604a9bf957d604424ceb310521638dd50",
    "cv-show-audio-entry-release-v1:cd3dc002337fbadede16759ca927ba0e4a6d15fbca6d5db6163b949132f8dcf3",
    "cv-show-audio-entry-release-v1:3a01a3fa3dfcb344c33852ae189c912ed223d1a25c04f06653ef61621863548f",
    "cv-show-audio-entry-release-v1:d116520bc97def88577cd33e5e350e70cffdf43525e149c8942715d9a2951aec",
    "cv-show-audio-entry-release-v1:82774b1c798791031febc7d3b0b506a17d9e1136600575f1d14838d2b6369bfc",
    "cv-show-audio-entry-release-v1:61adbd2c4061fc155914664f03361c12e38fcb5bf967e181ab80a33f5543886b",
    "cv-show-audio-entry-release-v1:37f3cdba382aa4db413eed693a697903fc3d34f2a6d01c1983dd0266263dee69",
    "cv-show-audio-entry-release-v1:18ce9adf6d9b6b57985a940b0de3316f1de51729cbc14258f390059853ec1f4d"
  ],
  "manifests": {
    "alignment": {
      "model": "large-v3-turbo",
      "path": "alignment/large-v3-turbo/66f9f319ba19bde1/manifest.json",
      "sha256": "f8a9edeb8f4fa95d2756bda2dce1bc9c5aefde3c6caba69d24a0d94af68e0ed0",
      "size": 1485411
    },
    "audio": {
      "path": "manifest.json",
      "sha256": "8d42435c4d58bf41c2621e2be8b02537d1d00acf1f3f7576b98c96a1b2de3d12",
      "size": 52786
    },
    "directory": "fae87df0d7d165f0cebe598cf9a3fd93a41a05be3a3bb319d7f77300ea87ab47",
    "locale": "ru",
    "voice": "barzana-2"
  },
  "mediaCollectionIdentity": {
    "collectionId": "cv-show:34c3d40c1c53cd320362aff9888c1727c977b9b3c7dcfb0d3cc73683bcf29af9",
    "identity": "cv-show-authoring-media-collection-v1:sha256-DVMCUQEURoRgWCVjQvvTXIoJ5Ug23NmzD+SPwU/olJQ=",
    "manifestHash": "cv-show-media-manifest-v1:sha256-wMKHv4lHmBBDGEIy33dPWRe9gSKT6fl0BQk8sTmw5nA=",
    "schemaVersion": "workspace-presentation-media-collection-v1"
  },
  "planId": "cv-show-audio-release-plan-v1:6277378a58624e3909481dc3eb588d5d403ec3f5235402e14e3b475c6d9430e8",
  "predecessorReleaseId": "cv-show-audio-release-v1:a688bbbf6bc814090a8770d983da62c3fff95aa566930185f366e28a2a17865b",
  "profiles": {
    "alignerContractHash": "cv-show-aligner-contract-v1:sha256-WJXMA0f9i4DwyS1CYrZ3FSAznMtAbhDA/lcaYjQVtNY=",
    "asrProfileHash": "cv-show-asr-profile-v1:sha256-xkDP1BOrbemy4iknmMC7Vj4rwXfu/OsnY5Q7ZPGcfIc=",
    "synthesisPolicyHash": "cv-show-synthesis-policy-v1:sha256-tmPYbXui+VSD22zqx0k1SGrZoagN9dmfs14QMmm/g2k=",
    "voiceIdentityHash": "cv-show-voice-identity-v1:sha256-fr9DLXnwdaC3f50U49dDoU05D2Vrmau5l5gLhxCIF4Q="
  },
  "project": {
    "authoringProjectHash": "workspace-presentation-authoring-project-v1:sha256-4KOmgBJqmH2AIA2doEQk1LSESzC6v8YwxxwhiH300fo=",
    "revision": 47
  },
  "releaseId": "cv-show-audio-release-v1:2608856b8fda0b9d23636b7454f8f5b893efb099bf961c1e0d741a9862a5200e",
  "schemaVersion": "cv-show-audio-release-v1",
  "verificationHash": "cv-show-audio-release-verification-v1:4a1ab5bf285f760849e9fafcaa5c0a8f1dcf84d32bd9b49255cc993838632e52"
}
/* CV_SHOW_AUDIO_RELEASE_INPUT:END */
);

function cvShowMetadata(project) {
  const value = project.script.metadata?.cvShow;
  if (!value?.entries || !value?.directives) {
    throw new TypeError('CV Show presentation project metadata is invalid');
  }
  return value;
}

function directiveMetadataForTurn(project, entryId) {
  const cvShow = cvShowMetadata(project);
  const directives = cvShow.directives;
  const sourceOrder = cvShow.slice?.sourceCellIds;
  const cells = sourceOrder
    ? sourceOrder.map((cellId) => project.cells.find(({ id }) => id === cellId)).filter(Boolean)
    : project.cells;
  return cells
    .filter((cell) => (
      cell.kind === 'cue' && cell.turnId === entryId && !cell.id.endsWith(':scroll')
    ))
    .map((cell) => [cell.id, directives[cell.id] || { refinements: {} }]);
}

function directiveId(cellId) {
  return cellId.replace(/^cv-show:cue:/u, '');
}

function directiveType(cell, refinements) {
  if (cell.cue.kind === 'focus') return 'frame';
  if (cell.cue.kind === 'annotation') return 'marker';
  if (cell.cue.interaction?.type === 'navigate') return 'navigate';
  if (cell.cue.interaction?.type === 'select') return 'native-selection';
  if (Array.isArray(refinements.actions)) return 'chat-action';
  if (Object.hasOwn(refinements, 'mode') && Object.hasOwn(refinements, 'action')) return 'media';
  return 'activate';
}

function projectSourceDirective(project, cellId) {
  const cell = project.cells.find(({ id }) => id === cellId);
  const value = cvShowMetadata(project).directives[cellId];
  if (!cell || !value) throw new TypeError(`Unknown CV Show directive cell: ${cellId}`);
  const refinements = structuredClone(value.refinements || {});
  if (Object.hasOwn(refinements, 'fromMilliseconds')) {
    refinements.startMs = refinements.fromMilliseconds;
    delete refinements.fromMilliseconds;
  }
  if (Object.hasOwn(refinements, 'toMilliseconds')) {
    refinements.endMs = refinements.toMilliseconds;
    delete refinements.toMilliseconds;
  }
  return freezeDeep({
    id: directiveId(cell.id),
    type: directiveType(cell, refinements),
    ...(cell.cue.targetId ? { target: cell.cue.targetId } : {}),
    policy: value.policy,
    ...refinements,
    timing: cell.timing.at.anchor === 'turn-start'
      ? { phase: 'setup' }
      : {
          phase: 'speech',
          anchor: cell.timing.at.anchor,
          quote: cell.timing.at.quote,
          occurrence: cell.timing.at.occurrence,
          edge: cell.timing.at.edge,
          offsetMs: -cell.timing.leadMs,
        },
  });
}

export function projectCvShowAttentionTimelines(projectInput) {
  const project = validatePresentationAuthoringProject(projectInput);
  return freezeDeep(Object.fromEntries(
    Object.keys(cvShowMetadata(project).entries).map((entryId) => {
      const directives = directiveMetadataForTurn(project, entryId);
      const setup = directives.find(([cellId]) => (
        project.cells.find(({ id }) => id === cellId)?.timing.at.anchor === 'turn-start'
      ));
      const speech = Object.fromEntries(directives
        .filter(([cellId]) => (
          project.cells.find(({ id }) => id === cellId)?.timing.at.anchor === 'speech'
        ))
        .map(([cellId]) => {
          const cell = project.cells.find(({ id }) => id === cellId);
          return [directiveId(cellId), { quote: cell.timing.at.quote, leadMs: cell.timing.leadMs }];
        }));
      return [entryId, { setup: setup ? directiveId(setup[0]) : '', speech }];
    }),
  ));
}

export function projectCvShowStory(projectInput) {
  const project = validatePresentationAuthoringProject(projectInput);
  const timeline = createPresentationAuthoringTimelineProjection(project);
  const cvShow = cvShowMetadata(project);
  const entries = timeline.turns.map((turn) => {
    const value = cvShow.entries[turn.id];
    if (!value) throw new TypeError(`Unknown CV Show entry: ${turn.id}`);
    const parent = turn.replyTo || (cvShow.slice?.turnId === turn.id ? cvShow.slice.parent : null);
    return freezeDeep({
      id: turn.id,
      ...(parent ? { sceneId: parent } : {}),
      ...(value.period ? { period: value.period } : {}),
      ...(value.projectId ? { projectId: value.projectId } : {}),
      directives: directiveMetadataForTurn(project, turn.id)
        .map(([cellId]) => projectSourceDirective(project, cellId)),
      ...(value.branchId ? { branchId: value.branchId } : {}),
      ...(value.return ? { return: structuredClone(value.return) } : {}),
      ...(value.title ? { title: value.title } : {}),
      subtitle: value.subtitle,
      speech: turn.text,
      chat: structuredClone(value.chat),
    });
  });
  const scenes = entries.filter((entry) => !entry.sceneId);
  const branches = Object.fromEntries(entries
    .filter((entry) => entry.sceneId)
    .map((entry) => [entry.id, entry]));
  return freezeDeep({
    version: cvShow.storyVersion,
    contractRevision: cvShow.contractRevision,
    conversationRevision: cvShow.conversationRevision,
    narrationLocale: cvShow.narrationLocale,
    runtimePolicy: structuredClone(cvShow.runtimePolicy),
    short: scenes.map(({ id }) => id),
    scenes,
    branches,
  });
}

export function projectCvShowDirective(projectCell, projectInput) {
  const project = validatePresentationAuthoringProject(projectInput);
  const cellId = projectCell.id.endsWith(':scroll')
    ? projectCell.id.slice(0, -':scroll'.length)
    : projectCell.id;
  return projectSourceDirective(project, cellId);
}

export const CV_SHOW_PRESENTATION_PROJECT = createPresentationAuthoringProject(
  CV_SHOW_AUTHORING_PROJECT_INPUT,
);
export const CV_SHOW_MEDIA_BINDINGS = freezeDeep(Object.fromEntries(Object.entries(
  cvShowMetadata(CV_SHOW_PRESENTATION_PROJECT).entries,
).map(([entryId, value]) => [entryId, structuredClone(value.media)])));
export const CV_SHOW_PRESENTATION_TIMELINE = createPresentationAuthoringTimelineProjection(
  CV_SHOW_PRESENTATION_PROJECT,
);
export const CV_SHOW_PRESENTATION_PROJECT_HASHES = createPresentationAuthoringProjectHashes(
  CV_SHOW_PRESENTATION_PROJECT,
);
export const CV_SHOW_STORY = projectCvShowStory(CV_SHOW_PRESENTATION_PROJECT);
export const CV_SHOW_ATTENTION_TIMELINES = projectCvShowAttentionTimelines(
  CV_SHOW_PRESENTATION_PROJECT,
);
