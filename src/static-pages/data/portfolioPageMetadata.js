import { PORTFOLIO_LOCALE_MESSAGES } from './portfolioTranslations.js';

const PAGE_KEYS = {
  'site/index': ['portfolio.page.title', 'profile.summary'],
  'profile/photo': ['portfolio.page.title', 'profile.summary'],
  'projects/index': ['projects.label', 'projects.summary'],
  'pulse/index': ['pulse.label', 'pulse.summary'],
  'skills/index': ['skills.label', 'skills.summary'],
  'skills/agentic-ai': ['skill.agenticAi.label', 'skill.agenticAi.summary'],
  'skills/rnd-engineering': ['skill.rnd.label', 'skill.rnd.summary'],
  'skills/product-ui': ['skill.productUi.label', 'skill.productUi.summary'],
  'skills/digital-presence': ['skill.digitalPresence.label', 'skill.digitalPresence.summary'],
  'skills/hardware-capture': ['skill.hardwareCapture.label', 'skill.hardwareCapture.summary'],
};

export const PORTFOLIO_PAGE_METADATA = Object.freeze(Object.fromEntries(
  Object.entries(PAGE_KEYS).map(([id, [titleKey, summaryKey]]) => {
    let messages = PORTFOLIO_LOCALE_MESSAGES.en;
    let title = messages[titleKey.startsWith('portfolio.') ? titleKey : `portfolio.${titleKey}`];
    let summary = messages[`portfolio.${summaryKey}`];
    if (!title || !summary) {
      throw new Error(`Missing portfolio page metadata for ${id}; check the English translations.`);
    }
    return [id, Object.freeze({ title, summary })];
  }),
));
