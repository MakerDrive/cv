import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import PDFDocument from 'pdfkit';

import {
  PORTFOLIO_PDF_EXPERTISE_ROUTES,
  PORTFOLIO_PDF_IMPACT_ROUTES,
  PORTFOLIO_PDF_PRODUCT_ROUTES,
} from '../src/static-pages/data/portfolioRelations.js';
import { PORTFOLIO_LOCALE_MESSAGES } from '../src/static-pages/data/portfolioTranslations.js';
import { socialLinks } from '../src/static-pages/data/socialLinks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDownloadsDir = path.join(rootDir, 'dist', 'downloads');
const avatarPath = path.join(rootDir, 'src', 'static-pages', 'avatar', 'avatar.png');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const siteUrl = new URL(packageJson.homepage || 'https://MakerDrive.github.io/cv/');
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname = `${siteUrl.pathname}/`;

const PDF_DOWNLOADS = Object.freeze({
  en: 'vladimir-matiasevich-cv-en.pdf',
  ru: 'vladimir-matiasevich-cv-ru.pdf',
  es: 'vladimir-matiasevich-cv-es.pdf',
});

const PDF_PROFILE_IDS = new Set(['social/github', 'social/linkedin', 'social/youtube']);
const PDF_TELEGRAM_URL = 'https://t.me/text2code';
const PDF_RND_PRO_URL = 'https://rnd-pro.com/';
const SOURCE_SANS_DIR = path.join(rootDir, 'node_modules', 'source-sans', 'TTF');

const FONT_CANDIDATES = Object.freeze({
  regular: [
    process.env.PORTFOLIO_PDF_FONT_REGULAR,
    process.env.PORTFOLIO_PDF_FONT,
    path.join(SOURCE_SANS_DIR, 'SourceSans3-Regular.ttf'),
    path.join(rootDir, 'src', 'static-pages', 'fonts', 'NotoSans-Regular.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  ],
  semibold: [
    process.env.PORTFOLIO_PDF_FONT_SEMIBOLD,
    process.env.PORTFOLIO_PDF_FONT_BOLD,
    path.join(SOURCE_SANS_DIR, 'SourceSans3-Semibold.ttf'),
    path.join(rootDir, 'src', 'static-pages', 'fonts', 'NotoSans-SemiBold.ttf'),
    path.join(rootDir, 'src', 'static-pages', 'fonts', 'NotoSans-Bold.ttf'),
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-SemiBold.ttf',
    '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf',
    '/usr/share/opentype/noto/NotoSansCJK-Bold.ttc',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  ],
  bold: [
    process.env.PORTFOLIO_PDF_FONT_BOLD,
    path.join(SOURCE_SANS_DIR, 'SourceSans3-Bold.ttf'),
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
});

function findFont(candidates) {
  return candidates.find((item) => item && fs.existsSync(item));
}

function getFonts() {
  const regular = findFont(FONT_CANDIDATES.regular);
  const semibold = findFont(FONT_CANDIDATES.semibold);
  const bold = findFont(FONT_CANDIDATES.bold) || regular;
  if (!regular) {
    throw new Error([
      'No Unicode font found for portfolio PDF generation.',
      'Set PORTFOLIO_PDF_FONT_REGULAR to a .ttf/.otf font with Cyrillic support.',
    ].join(' '));
  }
  return { regular, semibold: semibold || bold, bold };
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

function makePortfolioUrl(locale, route = '') {
  const cleanRoute = String(route || '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/index$/, '');
  const url = new URL(cleanRoute ? `${cleanRoute}/` : '', siteUrl);
  url.searchParams.set('lang', locale);
  return url.href;
}

function makeOnlineCvUrl(locale) {
  return makePortfolioUrl(locale);
}

function plainTextMarkdown(value) {
  return String(value || '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '');
}

export function parseInlineMarkdownLinks(value) {
  const source = String(value || '');
  const segments = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let sourceIndex = 0;

  for (const match of source.matchAll(linkPattern)) {
    if (match.index > sourceIndex) {
      segments.push({ text: source.slice(sourceIndex, match.index), href: '' });
    }
    segments.push({ text: match[1], href: match[2].trim() });
    sourceIndex = match.index + match[0].length;
  }

  if (sourceIndex < source.length) {
    segments.push({ text: source.slice(sourceIndex), href: '' });
  }

  return segments.length ? segments : [{ text: source, href: '' }];
}

function extractMarkdownBullets(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => /^[-*]\s+/.test(item))
    .map((item) => plainTextMarkdown(item).trim())
    .filter(Boolean);
}

function getBulletText(item) {
  return typeof item === 'string' ? item : item?.text || '';
}

function splitBulletLead(value) {
  const text = getBulletText(value);
  const separatorIndex = text.indexOf(':');
  if (separatorIndex < 1) return { lead: text, details: '' };
  return {
    lead: text.slice(0, separatorIndex).trim(),
    details: text.slice(separatorIndex + 1).trim(),
  };
}

function linkBulletsToRoutes(value, locale, routes) {
  const bullets = extractMarkdownBullets(value);
  if (bullets.length !== routes.length) {
    throw new Error(`PDF bullet/route mismatch for ${locale}: ${bullets.length} bullets, ${routes.length} routes`);
  }
  return bullets.map((text, index) => ({
    text,
    href: makePortfolioUrl(locale, routes[index]),
  }));
}

function makePdfPath(locale) {
  return path.join(distDownloadsDir, PDF_DOWNLOADS[locale]);
}

function getProductCopy(locale) {
  return [
    { label: t(locale, 'pdf.product.agentToolchain.label'), details: t(locale, 'pdf.product.agentToolchain.details') },
    { label: t(locale, 'pdf.product.symbiote.label'), details: t(locale, 'pdf.product.symbiote.details') },
    { label: t(locale, 'pdf.product.videoStudio.label'), details: t(locale, 'pdf.product.videoStudio.details') },
    { label: t(locale, 'pdf.product.messaging.label'), details: t(locale, 'pdf.product.messaging.details') },
    { label: t(locale, 'pdf.product.hardware.label'), details: t(locale, 'pdf.product.hardware.details') },
    { label: t(locale, 'pdf.product.photopizza.label'), details: t(locale, 'pdf.product.photopizza.details') },
    { label: t(locale, 'pdf.product.objetArt.label'), details: t(locale, 'pdf.product.objetArt.details') },
    { label: t(locale, 'pdf.product.boothbot.label'), details: t(locale, 'pdf.product.boothbot.details') },
  ].map((item, index) => ({
    ...item,
    href: makePortfolioUrl(locale, PORTFOLIO_PDF_PRODUCT_ROUTES[index]),
  }));
}

function getExperienceCopy(locale) {
  return [
    {
      label: t(locale, 'pdf.role.rndPro.label'),
      details: t(locale, 'pdf.role.rndPro.details'),
      href: PDF_RND_PRO_URL,
    },
    {
      label: t(locale, 'pdf.role.f360.label'),
      details: t(locale, 'pdf.role.f360.details'),
      href: makePortfolioUrl(locale, 'projects/f360-studio'),
    },
    {
      label: t(locale, 'pdf.role.megavisor.label'),
      details: t(locale, 'pdf.role.megavisor.details'),
      href: makePortfolioUrl(locale, 'projects/megavisor'),
    },
    {
      label: t(locale, 'pdf.role.ziq.label'),
      details: t(locale, 'pdf.role.ziq.details'),
      href: '',
    },
  ];
}

function createWriter(doc) {
  const page = {
    margin: doc.page.margins.left,
    width: doc.page.width,
    height: doc.page.height,
  };
  const contentWidth = page.width - page.margin * 2;

  function bodyBottom() {
    return doc.page.height - doc.page.margins.bottom;
  }

  function ensureSpace(height) {
    if (doc.y + height <= bodyBottom()) return;
    doc.addPage();
  }

  function pageBreak() {
    doc.addPage();
  }

  function textHeight(text, options = {}) {
    const content = plainTextMarkdown(text);
    const width = options.width || contentWidth;
    doc.font(options.font || (options.bold ? 'bold' : 'regular')).fontSize(options.size || 10.2);
    return doc.heightOfString(content, {
      width,
      lineGap: options.lineGap ?? 2.2,
    });
  }

  function section(title, options = {}) {
    const topGap = options.topGap ?? 8;
    const after = options.after ?? 10;
    const font = options.font || 'bold';
    const size = options.size || 15;
    const color = options.color || COLORS.ink;
    const divider = options.divider ?? true;
    const titleHeight = textHeight(title, { font, size, lineGap: 0 });
    ensureSpace(topGap + titleHeight + after + (options.minContentHeight || 0));
    doc.y += topGap;
    doc.font(font).fontSize(size).fillColor(color).text(title, page.margin, doc.y, {
      width: contentWidth,
      lineGap: 0,
    });
    if (divider) {
      doc.moveTo(page.margin, doc.y + 3)
        .lineTo(page.width - page.margin, doc.y + 3)
        .strokeColor(COLORS.faint)
        .lineWidth(1)
        .stroke();
    }
    doc.y += after;
  }

  function paragraph(text, options = {}) {
    if (!text) return;
    const content = plainTextMarkdown(text);
    const after = options.after ?? 7;
    const height = textHeight(content, options);
    ensureSpace(height + after);
    const font = options.font || (options.bold ? 'bold' : 'regular');
    const size = options.size || 10.2;
    const color = options.color || COLORS.ink;
    const segments = parseInlineMarkdownLinks(text);

    if (segments.some((segment) => segment.href)) {
      const y = doc.y;
      segments.forEach((segment, index) => {
        const textOptions = {
          width: contentWidth,
          lineGap: options.lineGap ?? 2.2,
          continued: index < segments.length - 1,
          link: segment.href || null,
          underline: Boolean(segment.href),
        };
        doc.font(font)
          .fontSize(size)
          .fillColor(segment.href ? COLORS.accent : color);
        if (index === 0) {
          doc.text(segment.text, page.margin, y, textOptions);
        } else {
          doc.text(segment.text, textOptions);
        }
      });
      doc.font(font).fontSize(size).fillColor(color);
    } else {
      doc.font(font)
        .fontSize(size)
        .fillColor(color)
        .text(content, page.margin, doc.y, {
          width: contentWidth,
          lineGap: options.lineGap ?? 2.2,
        });
    }
    doc.y += after;
  }

  function link(label, href, summary = '') {
    const summaryText = summary ? `${href} - ${summary}` : href;
    const summaryHeight = textHeight(summaryText, {
      size: 8.7,
      width: contentWidth - 126,
      lineGap: 1,
    });
    ensureSpace(Math.max(12, summaryHeight) + 5);
    const y = doc.y;
    doc.font('semibold').fontSize(9.5).fillColor(COLORS.accent).text(label, page.margin, y, {
      link: href,
      underline: true,
      width: 120,
      lineBreak: false,
    });
    doc.font('regular').fontSize(8.7).fillColor(COLORS.muted).text(summaryText, page.margin + 126, y + 0.8, {
      width: contentWidth - 126,
      lineGap: 1,
    });
    doc.y = y + Math.max(12, summaryHeight) + 5;
  }

  function measureBullet(text, options = {}) {
    const content = getBulletText(text);
    const href = typeof text === 'object' ? text.href : '';
    const { details } = splitBulletLead(content);
    return textHeight(content, {
      ...options,
      font: href && details ? 'semibold' : 'regular',
      width: contentWidth - 14,
    }) + (options.after ?? 3);
  }

  function bullet(text, options = {}) {
    const content = getBulletText(text);
    if (!content) return;
    const after = options.after ?? 3;
    const href = typeof text === 'object' ? text.href : '';
    const { lead, details } = splitBulletLead(content);
    const height = textHeight(content, {
      ...options,
      font: href && details ? 'semibold' : 'regular',
      width: contentWidth - 14,
    });
    ensureSpace(height + after);
    const y = doc.y;
    doc.font('semibold').fontSize(options.size || 8.6).fillColor(COLORS.accent).text('-', page.margin, y, {
      width: 10,
      lineBreak: false,
    });
    if (href && details) {
      doc.font('semibold').fontSize(options.size || 8.6).fillColor(COLORS.accent).text(lead, page.margin + 14, y, {
        width: contentWidth - 14,
        lineGap: options.lineGap ?? 1.2,
        link: href,
        underline: true,
        continued: true,
      });
      doc.font('regular').fontSize(options.size || 8.6).fillColor(options.color || COLORS.ink).text(`: ${details}`, {
        lineGap: options.lineGap ?? 1.2,
        link: null,
        underline: false,
      });
    } else {
      doc.font('regular').fontSize(options.size || 8.6).fillColor(options.color || COLORS.ink).text(content, page.margin + 14, y, {
        width: contentWidth - 14,
        lineGap: options.lineGap ?? 1.2,
        ...(href ? { link: href, underline: true } : {}),
      });
    }
    doc.y = Math.max(doc.y, y + height) + after;
  }

  function bullets(items, options = {}) {
    for (const item of items) bullet(item, options);
  }

  function measureItemBrief(item, options = {}) {
    const title = item.label;
    const titleHeight = textHeight(title, { font: 'semibold', size: options.titleSize || 11.2, lineGap: 0 });
    const detailsHeight = textHeight(item.details, {
      size: options.size || 9.8,
      lineGap: options.lineGap ?? 1.1,
    });
    return titleHeight + 3 + detailsHeight + (options.after ?? 7);
  }

  function itemBrief(item, options = {}) {
    const title = item.label;
    ensureSpace(measureItemBrief(item, options));
    doc.font('semibold').fontSize(options.titleSize || 11.2).fillColor(COLORS.ink).text(title, page.margin, doc.y, {
      width: contentWidth,
      ...(item.href ? { link: item.href, underline: true } : {}),
      lineGap: 0,
    });
    doc.y += 3;
    paragraph(item.details, {
      size: options.size || 9.8,
      color: COLORS.muted,
      after: options.after ?? 7,
      lineGap: options.lineGap ?? 1.1,
    });
  }

  return {
    page,
    contentWidth,
    ensureSpace,
    pageBreak,
    section,
    paragraph,
    link,
    measureBullet,
    bullet,
    bullets,
    measureItemBrief,
    itemBrief,
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
  doc.font('semibold').fontSize(10.4).fillColor(COLORS.accent).text(t(locale, 'pdf.headerTitle'), textX, doc.y, {
    width: textWidth,
  });
  doc.moveDown(0.25);
  doc.font('regular').fontSize(9.4).fillColor(COLORS.muted).text(`${t(locale, 'profile.locationLabel')}: ${t(locale, 'profile.locationValue')}`, textX, doc.y, {
    width: textWidth,
  });
  doc.font('regular').fontSize(9.4).fillColor(COLORS.muted).text(`${t(locale, 'profile.statusDetails')} ${t(locale, 'pdf.remoteAvailability')}`, textX, doc.y, {
    width: textWidth,
  });
  doc.font('regular').fontSize(9.4).fillColor(COLORS.muted).text(`${t(locale, 'profile.languagesLabel')}: ${t(locale, 'profile.languagesValue')}`, textX, doc.y, {
    width: textWidth,
  });
  doc.font('regular').fontSize(9.4).fillColor(COLORS.muted).text(t(locale, 'profile.experienceSummary'), textX, doc.y, {
    width: textWidth,
  });
  const onlineCvUrl = makeOnlineCvUrl(locale);
  doc.font('regular').fontSize(9.4).fillColor(COLORS.accent).text(`${t(locale, 'profile.onlineCv')}: ${onlineCvUrl}`, textX, doc.y, {
    link: onlineCvUrl,
    underline: true,
    width: textWidth,
  });
  doc.y = Math.max(doc.y, imageY + imageSize + 26);
}

function addFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    const pageNumber = `${index + 1 - range.start} / ${range.count}`;
    const bottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font('regular').fontSize(8).fillColor(COLORS.muted).text(
      pageNumber,
      42,
      doc.page.height - 46,
      { align: 'center', lineBreak: false, width: doc.page.width - 84 }
    );
    doc.page.margins.bottom = bottomMargin;
  }
}

function writeLocalePdf(locale, fonts) {
  fs.mkdirSync(distDownloadsDir, { recursive: true });
  const outputPath = makePdfPath(locale);
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 42,
      right: 42,
      bottom: 68,
      left: 42,
    },
    bufferPages: true,
    info: {
      Title: t(locale, 'page.title'),
      Author: 'Vladimir Matiasevich',
      Subject: 'CV and R&D portfolio',
      Keywords: 'CV, R&D, AI tooling, product platforms, hardware automation',
    },
  });
  doc.registerFont('regular', fonts.regular);
  doc.registerFont('semibold', fonts.semibold);
  doc.registerFont('bold', fonts.bold);

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  const writer = createWriter(doc);

  addHeader(doc, writer, locale);
  const summary = t(locale, 'pdf.summaryDetails');
  writer.section(t(locale, 'pdf.summaryTitle'), {
    minContentHeight: writer.measureBullet(summary, { size: 10.5, lineGap: 1.4 }),
    topGap: 6,
    after: 8,
  });
  writer.paragraph(summary, { size: 10.5, color: COLORS.ink, after: 5, lineGap: 1.4 });

  const expertise = linkBulletsToRoutes(
    t(locale, 'pdf.expertiseDetails'),
    locale,
    PORTFOLIO_PDF_EXPERTISE_ROUTES,
  );
  writer.section(t(locale, 'pdf.expertiseTitle'), {
    minContentHeight: writer.measureBullet(expertise[0], { size: 10, lineGap: 0.8 }),
    topGap: 6,
    after: 8,
  });
  writer.bullets(expertise, {
    size: 10,
    color: COLORS.ink,
    lineGap: 0.8,
    after: 3,
  });

  const impact = linkBulletsToRoutes(
    t(locale, 'pdf.impactDetails'),
    locale,
    PORTFOLIO_PDF_IMPACT_ROUTES,
  );
  writer.section(t(locale, 'pdf.impactTitle'), {
    minContentHeight: writer.measureBullet(impact[0], { size: 10, lineGap: 0.8 }),
    topGap: 6,
    after: 8,
  });
  writer.bullets(impact, {
    size: 10,
    color: COLORS.ink,
    lineGap: 0.8,
    after: 3,
  });

  writer.pageBreak();
  const products = getProductCopy(locale);
  writer.section(t(locale, 'pdf.productsTitle'), {
    minContentHeight: writer.measureItemBrief(products[0], { titleSize: 10.2, size: 9.6, after: 4 }),
    topGap: 0,
    after: 7,
  });
  writer.paragraph(t(locale, 'pdf.productsIntro'), {
    size: 9.2,
    color: COLORS.muted,
    after: 5,
    lineGap: 1,
  });
  const softwareProducts = products.slice(0, 4);
  const mediaHardwareProducts = products.slice(4);
  writer.section(t(locale, 'pdf.softwareProductsTitle'), {
    font: 'semibold',
    size: 10.8,
    color: COLORS.accent,
    divider: false,
    topGap: 1,
    after: 4,
    minContentHeight: writer.measureItemBrief(softwareProducts[0], { titleSize: 10.2, size: 9.6, after: 4 }),
  });
  for (const item of softwareProducts) {
    writer.itemBrief(item, { titleSize: 10.2, size: 9.6, lineGap: 0.8, after: 4 });
  }
  writer.section(t(locale, 'pdf.mediaHardwareProductsTitle'), {
    font: 'semibold',
    size: 10.8,
    color: COLORS.accent,
    divider: false,
    topGap: 2,
    after: 4,
    minContentHeight: writer.measureItemBrief(mediaHardwareProducts[0], { titleSize: 10.2, size: 9.6, after: 4 }),
  });
  for (const item of mediaHardwareProducts) {
    writer.itemBrief(item, { titleSize: 10.2, size: 9.6, lineGap: 0.8, after: 4 });
  }

  const experience = getExperienceCopy(locale);
  writer.section(t(locale, 'pdf.experienceTitle'), {
    minContentHeight: writer.measureItemBrief(experience[0], { titleSize: 10.2, size: 9.6, after: 3 }),
    topGap: 4,
    after: 6,
  });
  for (const item of experience) {
    writer.itemBrief(item, { titleSize: 10.2, size: 9.6, lineGap: 0.8, after: 3 });
  }

  writer.section(t(locale, 'profile.links'), { minContentHeight: 24, topGap: 4, after: 6 });
  for (const item of socialLinks.filter((entry) => PDF_PROFILE_IDS.has(entry.id))) {
    writer.link(item.label, item.href, t(locale, item.summaryKey));
  }
  writer.link('Telegram', PDF_TELEGRAM_URL, t(locale, 'pdf.telegramSummary'));
  writer.link('RND-PRO', PDF_RND_PRO_URL, t(locale, 'pdf.rndProSummary'));

  const pageRange = doc.bufferedPageRange();
  if (pageRange.count !== 2) {
    throw new Error(`Expected exactly 2 PDF pages for ${locale}, generated ${pageRange.count}`);
  }

  addFooter(doc);
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fonts = getFonts();
  const outputs = [];
  for (const locale of ['en', 'ru', 'es']) {
    outputs.push(await writeLocalePdf(locale, fonts));
  }

  for (const output of outputs) {
    process.stdout.write(`PDF generated: ${path.relative(rootDir, output)}\n`);
  }
}
