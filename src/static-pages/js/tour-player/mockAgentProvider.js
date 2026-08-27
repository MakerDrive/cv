import { createScriptedAgentProvider } from 'symbiote-ui/chat/show-chat';

export const CV_SHOW_CONTACT_ACTIONS = Object.freeze({
  'contact-linkedin': 'https://www.linkedin.com/in/v-matiasevich/',
  'contact-telegram': 'https://t.me/text2code',
});

const COPY = Object.freeze({
  en: Object.freeze({
    contact: 'You can contact Vladimir on LinkedIn or Telegram. I will open a contact only after you choose it.',
    projects: 'I can open the projects section. The Show will keep its own playback state.',
    help: 'The Short Show plays automatically. “More details” cards are optional and remain available in the chat history.',
    unknown: 'The full AI agent is not connected in this demo yet. I can help with projects, the Show, or Vladimir’s contact details.',
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    openProjects: 'Open projects',
    showHelp: 'How the Show works',
    contactChoice: 'Contact Vladimir',
  }),
  ru: Object.freeze({
    contact: 'Связаться с Владимиром можно в LinkedIn или Telegram. Контакт откроется только после вашего выбора.',
    projects: 'Я могу открыть раздел проектов. Show сохранит собственное состояние воспроизведения.',
    help: 'Short Show идёт автоматически. Карточки «Подробнее» необязательны и остаются доступными в истории чата.',
    unknown: 'Полный AI-агент в этой демоверсии пока не подключён. Я могу помочь с проектами, Show или контактами Владимира.',
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    openProjects: 'Открыть проекты',
    showHelp: 'Как работает Show',
    contactChoice: 'Связаться с Владимиром',
  }),
  es: Object.freeze({
    contact: 'Puedes contactar con Vladimir por LinkedIn o Telegram. El contacto solo se abrirá cuando lo elijas.',
    projects: 'Puedo abrir la sección de proyectos. El Show conservará su propio estado de reproducción.',
    help: 'El Short Show avanza automáticamente. Las tarjetas «Más detalles» son opcionales y siguen disponibles en el historial.',
    unknown: 'El agente de IA completo aún no está conectado en esta demo. Puedo ayudar con proyectos, el Show o los contactos de Vladimir.',
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    openProjects: 'Abrir proyectos',
    showHelp: 'Cómo funciona el Show',
    contactChoice: 'Contactar con Vladimir',
  }),
});

function primaryLocale(value) {
  const locale = String(value || '').trim().toLowerCase().split(/[-_]/u)[0];
  return Object.hasOwn(COPY, locale) ? locale : 'en';
}

function message(id, text, actions = [], payload = null) {
  /** @type {any[]} */
  const parts = [{ type: 'text', text }];
  if (actions.length) {
    parts.push({
      type: 'actions',
      id,
      payload,
      actions: actions.map((action, index) => ({
        ...action,
        variant: index === 0 ? 'primary' : 'ghost',
      })),
    });
  }
  return { id: `${id}.reply`, role: 'agent', parts };
}

function isMessage(request) {
  return request?.type === 'message';
}

function isAction(request, ...ids) {
  return request?.type === 'action' && ids.includes(request.actionId);
}

export function createCvShowMockAgentProvider({ locale = 'en' } = {}) {
  const copy = COPY[primaryLocale(locale)];
  const contactResponse = () => message('mock.contact', copy.contact, [
    { id: 'contact-linkedin', label: copy.linkedin, icon: 'open_in_new' },
    { id: 'contact-telegram', label: copy.telegram, icon: 'open_in_new' },
  ], { intent: 'contact' });
  const projectsResponse = () => message('mock.projects', copy.projects, [
    { id: 'projects', label: copy.openProjects, icon: 'folder_open' },
  ], { intent: 'projects' });
  const helpResponse = () => message('mock.help', copy.help);
  const fallback = (request) => {
    if (!isMessage(request)) return null;
    return message('mock.unknown', copy.unknown, [
      { id: 'agent-projects', label: copy.openProjects, icon: 'folder_open' },
      { id: 'agent-help', label: copy.showHelp, icon: 'help' },
      { id: 'agent-contact', label: copy.contactChoice, icon: 'person' },
    ], { intent: 'available-choices' });
  };

  return createScriptedAgentProvider({
    routes: [
      {
        when: (request) => isAction(request, 'agent-contact'),
        response: contactResponse,
      },
      {
        when: (request) => isAction(request, 'agent-projects'),
        response: projectsResponse,
      },
      {
        when: (request) => isAction(request, 'agent-help'),
        response: helpResponse,
      },
    ],
    fallback,
  });
}

export function resolveTrustedCvContactAction(actionId, trustedActionId) {
  if (actionId !== trustedActionId) return '';
  return CV_SHOW_CONTACT_ACTIONS[actionId] || '';
}
