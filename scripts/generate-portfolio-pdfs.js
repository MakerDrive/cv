import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import PDFDocument from 'pdfkit';

import { loadProjectEntries } from '../src/static-pages/data/projects.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../src/static-pages/data/portfolioTranslations.js';
import { PROJECT_TRANSLATIONS } from '../src/static-pages/data/projectTranslations.js';
import { socialLinks } from '../src/static-pages/data/socialLinks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDownloadsDir = path.join(rootDir, 'dist', 'downloads');
const avatarPath = path.join(rootDir, 'src', 'static-pages', 'avatar', 'avatar.png');

const PDF_DOWNLOADS = Object.freeze({
  en: 'vladimir-matiasevich-cv-en.pdf',
  ru: 'vladimir-matiasevich-cv-ru.pdf',
  es: 'vladimir-matiasevich-cv-es.pdf',
});

const PROFILE_AGE = 41;

const PROJECT_GROUPS = Object.freeze([
  {
    key: 'projectGroup.agenticAi.label',
    slugs: [
      'agent-portal',
      'symbiote-workspace',
      'symbiote-engine',
      'project-graph-mcp',
      'agent-pool-mcp',
      'mcp-agent-portal',
      'browser-x-mcp',
      'context-x-mcp',
      'terminal-x-mcp',
    ],
  },
  {
    key: 'projectGroup.productUi.label',
    slugs: [
      'symbiote-video-studio',
      'megavisor',
      'lifecycle-messaging-platform',
      'symbiote-ui',
      'photopizza-remote',
      'photosnail-public',
    ],
  },
  {
    key: 'projectGroup.archive.label',
    slugs: [
      'symbiote-node',
    ],
  },
  {
    key: 'projectGroup.hardware.label',
    slugs: [
      'autobox-v1',
      'complexscan',
      'boothbot',
      'photopizza',
    ],
  },
]);

const PROJECT_LINK_SUMMARY_KEYS = Object.freeze({
  'Public source repository': 'project.linkSummary.publicSourceRepository',
  'Published npm package': 'project.linkSummary.publishedNpmPackage',
  'YouTube channel with photogrammetry and capture workflow demos': 'project.linkSummary.youtubePhotogrammetry',
  'YouTube channel with product updates and demos': 'project.linkSummary.youtubeProductUpdates',
});

const FONT_CANDIDATES = Object.freeze({
  regular: [
    process.env.PORTFOLIO_PDF_FONT_REGULAR,
    process.env.PORTFOLIO_PDF_FONT,
    path.join(rootDir, 'src', 'static-pages', 'fonts', 'NotoSans-Regular.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  ],
  bold: [
    process.env.PORTFOLIO_PDF_FONT_BOLD,
    path.join(rootDir, 'src', 'static-pages', 'fonts', 'NotoSans-Bold.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  ],
});

const COLORS = Object.freeze({
  ink: '#111827',
  muted: '#4b5563',
  faint: '#e5e7eb',
  accent: '#2563eb',
  chip: '#eff6ff',
});

function findFont(candidates) {
  return candidates.find((item) => item && fs.existsSync(item));
}

function getFonts() {
  const regular = findFont(FONT_CANDIDATES.regular);
  const bold = findFont(FONT_CANDIDATES.bold) || regular;
  if (!regular) {
    throw new Error([
      'No Unicode font found for portfolio PDF generation.',
      'Set PORTFOLIO_PDF_FONT_REGULAR to a .ttf/.otf font with Cyrillic support.',
    ].join(' '));
  }
  return { regular, bold };
}

function formatMessage(value, params = {}) {
  return String(value || '').replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (match, key) => {
    return Object.hasOwn(params, key) ? String(params[key]) : match;
  });
}

function t(locale, key, params = {}) {
  return formatMessage(PORTFOLIO_LOCALE_MESSAGES[locale]?.[`portfolio.${key}`]
    || PORTFOLIO_LOCALE_MESSAGES.en[`portfolio.${key}`]
    || key, params);
}

function getProjectSummary(project, locale) {
  return PROJECT_TRANSLATIONS[locale]?.[project.slug]?.summary || project.summary || '';
}

function getProjectDetails(project, locale) {
  return PROJECT_TRANSLATIONS[locale]?.[project.slug]?.details || project.details || '';
}

function getProjectKicker(project, locale) {
  if (project.kicker === 'Selected project') return t(locale, 'project.kicker.selected');
  if (project.kicker === 'Author project') return t(locale, 'project.kicker.author');
  return project.kicker || '';
}

function getProjectLinkLabel(project, locale) {
  if (!project.linkLabel || project.linkLabel === 'View project') return t(locale, 'link.learnMore');
  if (project.linkLabel === 'View repository') return t(locale, 'link.viewRepository');
  return project.linkLabel;
}

function getProjectLinkSummary(summary, locale) {
  return PROJECT_LINK_SUMMARY_KEYS[summary] ? t(locale, PROJECT_LINK_SUMMARY_KEYS[summary]) : summary;
}

function plainTextMarkdown(value) {
  return String(value || '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
}

function splitParagraphs(value) {
  return plainTextMarkdown(value)
    .split(/\n{2,}/)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function makePdfPath(locale) {
  return path.join(distDownloadsDir, PDF_DOWNLOADS[locale]);
}

function createWriter(doc) {
  const page = {
    margin: 42,
    width: doc.page.width,
    height: doc.page.height,
  };
  const contentWidth = page.width - page.margin * 2;

  function ensureSpace(height) {
    if (doc.y + height <= page.height - page.margin - 28) return;
    doc.addPage();
  }

  function section(title) {
    ensureSpace(58);
    doc.moveDown(0.55);
    doc.font('bold').fontSize(15).fillColor(COLORS.ink).text(title, page.margin, doc.y);
    doc.moveTo(page.margin, doc.y + 4)
      .lineTo(page.width - page.margin, doc.y + 4)
      .strokeColor(COLORS.faint)
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.8);
  }

  function paragraph(text, options = {}) {
    if (!text) return;
    ensureSpace(options.space || 46);
    doc.font(options.bold ? 'bold' : 'regular')
      .fontSize(options.size || 9.5)
      .fillColor(options.color || COLORS.ink)
      .text(plainTextMarkdown(text), page.margin, doc.y, {
        width: contentWidth,
        lineGap: options.lineGap ?? 2.2,
      });
    doc.moveDown(options.after ?? 0.55);
  }

  function paragraphs(text, options = {}) {
    for (const item of splitParagraphs(text)) paragraph(item, options);
  }

  function chip(text) {
    const width = contentWidth;
    const height = 20;
    ensureSpace(height + 4);
    const x = page.margin;
    const y = doc.y;
    doc.roundedRect(x, y, width, height, 5).fill(COLORS.chip);
    doc.font('bold').fontSize(8.5).fillColor(COLORS.accent).text(text, x + 9, y + 5, {
      width: width - 18,
      lineBreak: false,
    });
    doc.y = y + height + 4;
  }

  function link(label, href, summary = '') {
    ensureSpace(34);
    const y = doc.y;
    doc.font('bold').fontSize(9).fillColor(COLORS.accent).text(label, page.margin, y, {
      link: href,
      underline: true,
      width: 120,
      lineBreak: false,
    });
    const text = summary ? `${href} - ${summary}` : href;
    doc.font('regular').fontSize(8.2).fillColor(COLORS.muted).text(text, page.margin + 126, y + 0.8, {
      width: contentWidth - 126,
      lineGap: 1,
    });
    doc.moveDown(0.45);
  }

  function project(project, locale) {
    const summary = getProjectSummary(project, locale);
    const details = getProjectDetails(project, locale);
    ensureSpace(90);
    const kicker = getProjectKicker(project, locale);
    doc.font('bold').fontSize(12).fillColor(COLORS.ink).text(project.title, page.margin, doc.y, {
      width: contentWidth,
    });
    if (project.period) {
      doc.font('regular').fontSize(8.4).fillColor(COLORS.muted).text(project.period, page.margin, doc.y + 1, {
        width: contentWidth,
      });
    }
    if (kicker) {
      doc.font('regular').fontSize(8.5).fillColor(COLORS.accent).text(kicker, page.margin, doc.y + 1, {
        width: contentWidth,
      });
    }
    doc.moveDown(0.35);
    paragraph(summary, { size: 9.3, color: COLORS.ink, after: 0.35, space: 32 });
    paragraphs(details, { size: 8.8, color: COLORS.muted, after: 0.38, space: 36 });
    for (const item of project.links || []) link(item.label, item.href, getProjectLinkSummary(item.summary, locale));
    if (project.href) link(getProjectLinkLabel(project, locale), project.href);
    doc.moveDown(0.2);
  }

  return {
    page,
    contentWidth,
    ensureSpace,
    section,
    paragraph,
    paragraphs,
    chip,
    link,
    project,
  };
}

function addHeader(doc, writer, locale) {
  const imageSize = 76;
  const imageX = writer.page.margin;
  const imageY = writer.page.margin;
  const textX = imageX + imageSize + 22;
  const textWidth = writer.page.width - textX - writer.page.margin;

  if (fs.existsSync(avatarPath)) {
    doc.save();
    doc.circle(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2).clip();
    doc.image(avatarPath, imageX, imageY, { width: imageSize, height: imageSize });
    doc.restore();
    doc.circle(imageX + imageSize / 2, imageY + imageSize / 2, imageSize / 2)
      .strokeColor(COLORS.faint)
      .lineWidth(1)
      .stroke();
  }

  doc.font('bold').fontSize(24).fillColor(COLORS.ink).text('Vladimir Matiasevich', textX, imageY + 2, {
    width: textWidth,
  });
  doc.moveDown(0.15);
  doc.font('regular').fontSize(10.2).fillColor(COLORS.accent).text(t(locale, 'page.title'), textX, doc.y, {
    width: textWidth,
  });
  doc.moveDown(0.45);
  doc.font('regular').fontSize(10).fillColor(COLORS.ink).text(t(locale, 'profile.summary'), textX, doc.y, {
    width: textWidth,
    lineGap: 2,
  });
  doc.moveDown(0.25);
  doc.font('regular').fontSize(9.2).fillColor(COLORS.muted).text(t(locale, 'profile.age', { age: PROFILE_AGE }), textX, doc.y, {
    width: textWidth,
  });
  doc.font('regular').fontSize(9.2).fillColor(COLORS.muted).text(t(locale, 'profile.experienceSummary'), textX, doc.y, {
    width: textWidth,
  });
  doc.y = Math.max(doc.y, imageY + imageSize + 26);
}

function addFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    const pageNumber = `${index + 1 - range.start} / ${range.count}`;
    doc.font('regular').fontSize(8).fillColor(COLORS.muted).text(
      pageNumber,
      42,
      doc.page.height - doc.page.margins.bottom - 22,
      { align: 'center', lineBreak: false, width: doc.page.width - 84 }
    );
  }
}

function writeLocalePdf(locale, projects, fonts) {
  fs.mkdirSync(distDownloadsDir, { recursive: true });
  const outputPath = makePdfPath(locale);
  const doc = new PDFDocument({
    size: 'A4',
    margin: 42,
    bufferPages: true,
    info: {
      Title: t(locale, 'page.title'),
      Author: 'Vladimir Matiasevich',
      Subject: 'CV and R&D portfolio',
      Keywords: 'CV, R&D, AI tooling, product platforms, hardware automation',
    },
  });
  doc.registerFont('regular', fonts.regular);
  doc.registerFont('bold', fonts.bold);

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  const writer = createWriter(doc);

  addHeader(doc, writer, locale);
  writer.section(t(locale, 'bio.about'));
  writer.paragraphs(t(locale, 'profile.details'), { size: 10, color: COLORS.ink });
  writer.section(t(locale, 'profile.statusTitle'));
  writer.paragraph(t(locale, 'profile.statusDetails'), { size: 9.2, color: COLORS.ink, after: 0.4 });

  writer.section(t(locale, 'profile.focusTitle'));
  writer.paragraph(t(locale, 'profile.focusDetails'), { size: 9.2, color: COLORS.ink, after: 0.4 });

  writer.section(t(locale, 'profile.workFormatTitle'));
  writer.paragraph(t(locale, 'profile.workFormatDetails'), { size: 9.2, color: COLORS.ink, after: 0.4 });

  writer.section(t(locale, 'profile.achievementsTitle'));
  for (const key of ['rndProducts', 'hardware', 'museumScanning', 'aiTooling']) {
    writer.chip(t(locale, `profile.achievement.${key}.label`));
    writer.paragraph(t(locale, `profile.achievement.${key}.details`), { size: 8.6, color: COLORS.muted, after: 0.35 });
  }

  writer.section(t(locale, 'profile.careerTitle'));
  for (const key of ['megavisor', 'photopizza', 'hardware', 'ai', 'messaging']) {
    writer.chip(t(locale, `profile.career.${key}.label`));
    writer.paragraph(t(locale, `profile.career.${key}.details`), { size: 8.6, color: COLORS.muted, after: 0.35 });
  }

  writer.section(t(locale, 'experience.title'));
  writer.chip(t(locale, 'experience.rnd.label'));
  writer.paragraph(t(locale, 'experience.rnd.details'), { size: 8.8, color: COLORS.muted, after: 0.4 });
  writer.chip(t(locale, 'experience.programming.label'));
  writer.paragraph(t(locale, 'experience.programming.details'), { size: 8.8, color: COLORS.muted, after: 0.4 });

  writer.paragraphs(t(locale, 'bio.details'), { size: 9.2, color: COLORS.muted });

  writer.section(t(locale, 'skills.label'));
  for (const key of ['rnd', 'agenticAi', 'productUi', 'hardwareCapture']) {
    writer.chip(t(locale, `skill.${key}.label`));
    writer.paragraph(t(locale, `skill.${key}.summary`), { size: 8.8, color: COLORS.muted, after: 0.4 });
  }

  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
  writer.section(t(locale, 'projects.label'));
  writer.paragraph(t(locale, 'projects.details'), { size: 9.2, color: COLORS.muted });
  for (const group of PROJECT_GROUPS) {
    writer.section(t(locale, group.key));
    for (const slug of group.slugs) {
      const item = projectBySlug.get(slug);
      if (item) writer.project(item, locale);
    }
  }

  writer.section(t(locale, 'profile.links'));
  for (const item of socialLinks) {
    writer.link(item.label, item.href, t(locale, item.summaryKey));
  }

  addFooter(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

const fonts = getFonts();
const projects = loadProjectEntries();
const outputs = [];
for (const locale of ['en', 'ru', 'es']) {
  outputs.push(await writeLocalePdf(locale, projects, fonts));
}

for (const output of outputs) {
  process.stdout.write(`PDF generated: ${path.relative(rootDir, output)}\n`);
}
