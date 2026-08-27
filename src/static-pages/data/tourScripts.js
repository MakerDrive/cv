export const shortTour = [
  {
    text: "Привет! Меня зовут Владимир, я ведущий R&D инженер.",
    cues: [
      { word: "Привет", action: "highlight", selector: "header" },
      { word: "инженер", action: "clear" }
    ],
    delay: 500
  },
  {
    text: "Я проектирую и создаю контуры автоматизации — объединяю софт, медиа и железо.",
    cues: [
      { word: "проектирую", action: "highlight", selector: "a[href='./?filter=skills%2Frnd-engineering']" }
    ],
    delay: 1000
  },
  {
    text: "В этом портфолио собраны мои ключевые работы за 15 лет. Давайте покажу самое интересное.",
    cues: [
      { word: "портфолио", action: "clear" }
    ],
    delay: 1000
  },
  {
    text: "Вот мой текущий фокус: Agent Portal.",
    cues: [
      { word: "Вот", action: "click", selector: "a[href='./?filter=agentic-ai']" },
      { word: "фокус", action: "highlight", selector: "a[href='./projects/agent-portal/']" }
    ],
    delay: 1000
  },
  {
    text: "А вот совершенно другая область — Hardware.",
    cues: [
      { word: "другая", action: "click", selector: "a[href='./?filter=hardware']" }
    ],
    delay: 1000
  },
  {
    text: "Проекты ComplexScan и AUTOBOX — это коммерческое оборудование для музейной оцифровки и 3D-съемки, которое я проектировал от плат управления до механики.",
    cues: [
      { word: "Проекты", action: "highlight", selector: "a[href='./projects/autobox-v1/']" },
      { word: "которое", action: "clear" }
    ],
    delay: 1000
  },
  {
    text: "Приятного просмотра!",
    cues: [
      { word: "Приятного", action: "click", selector: "a[href='./']" }
    ],
    delay: 500
  }
];

export const fullTour = [
  {
    text: "Привет! Я Владимир Матиясевич, ведущий R&D инженер. Добро пожаловать в моё интерактивное портфолио.",
    cues: [
      { word: "Привет", action: "highlight", selector: "header" },
      { word: "Добро", action: "clear" }
    ],
    delay: 500
  },
  {
    text: "Мой главный подход к работе — это R&D. Я люблю брать задачи с высокой неопределенностью и превращать их в работающие системы.",
    cues: [
      { word: "подход", action: "highlight", selector: "a[href='./?filter=skills%2Frnd-engineering']" },
      { word: "превращать", action: "clear" }
    ],
    delay: 1000
  },
  {
    text: "Мой опыт делится на три большие части. Первая — это разработка инструментов для ИИ и платформенная инженерия.",
    cues: [
      { word: "Первая", action: "click", selector: "a[href='./?filter=agentic-ai']" }
    ],
    delay: 1000
  },
  {
    text: "Давайте откроем Agent Portal.",
    cues: [
      { word: "откроем", action: "click", selector: "a[href='./projects/agent-portal/']" }
    ],
    delay: 1000
  },
  {
    text: "Вместо того, чтобы агенты просто генерировали текст, я создаю для них строгие контракты и инструменты. Система работает на базе MCP-серверов.",
    cues: [
      { word: "строгие", action: "highlight", selector: "side-panel article" }
    ],
    delay: 1000
  },
  {
    text: "Давайте вернемся к списку проектов.",
    cues: [
      { word: "вернемся", action: "click", selector: "side-panel [data-action='close']" }
    ],
    delay: 1000
  },
  {
    text: "Вторая большая часть — это Hardware и Media.",
    cues: [
      { word: "Вторая", action: "click", selector: "a[href='./?filter=hardware']" }
    ],
    delay: 1000
  },
  {
    text: "Здесь есть как опенсорс проект PhotoPizza, так и коммерческие установки ComplexScan.",
    cues: [
      { word: "проект", action: "highlight", selector: "a[href='./projects/photopizza/']" },
      { word: "установки", action: "highlight", selector: "a[href='./projects/autobox-v1/']" } // ID is autobox-v1 for ComplexScan
    ],
    delay: 1000
  },
  {
    text: "Третий важный элемент портфолио — это Пульс.",
    cues: [
      { word: "Третий", action: "click", selector: ".pulse-header-menu-button" },
      { word: "Пульс", action: "click", selector: "a[href='./publications/']" }
    ],
    delay: 1000
  },
  {
    text: "Это хроника моих решений и экспериментов.",
    cues: [
      { word: "Это", action: "highlight", selector: "main section" }
    ],
    delay: 1000
  },
  {
    text: "На этом экскурсия окончена. Вы можете связаться со мной через Telegram или LinkedIn. Спасибо за внимание!",
    cues: [
      { word: "окончена", action: "click", selector: "a[href='./']" }
    ],
    delay: 500
  }
];
