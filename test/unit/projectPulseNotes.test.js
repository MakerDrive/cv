import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { loadProjectEntries } from '../../src/static-pages/data/projects.js';
import { PROJECT_PULSE_NOTES } from '../../src/static-pages/data/projectPulseNotes.js';
import { PROJECT_TRANSLATIONS } from '../../src/static-pages/data/projectTranslations.js';

const LOCALES = ['en', 'ru', 'es'];

test('project pulse notes cover each project in every locale', () => {
  const slugs = loadProjectEntries().map((project) => project.slug);

  for (const locale of LOCALES) {
    assert.deepEqual(
      Object.keys(PROJECT_PULSE_NOTES[locale]).sort(),
      [...slugs].sort(),
      `${locale} pulse notes must match project entries`
    );

    for (const slug of slugs) {
      assert.ok(PROJECT_PULSE_NOTES[locale][slug].summary?.trim(), `${locale}:${slug}:summary`);
      assert.ok(PROJECT_PULSE_NOTES[locale][slug].details?.trim(), `${locale}:${slug}:details`);
    }
  }
});

test('project pulse notes stay distinct from project case descriptions', () => {
  const projects = loadProjectEntries();

  for (const project of projects) {
    assert.notEqual(
      PROJECT_PULSE_NOTES.en[project.slug].details,
      project.details,
      `en:${project.slug} pulse note must not duplicate project details`
    );

    for (const locale of ['ru', 'es']) {
      assert.notEqual(
        PROJECT_PULSE_NOTES[locale][project.slug].details,
        PROJECT_TRANSLATIONS[locale][project.slug].details,
        `${locale}:${project.slug} pulse note must not duplicate project details`
      );
    }
  }
});

test('portfolio runtime uses dedicated pulse notes for journal entries', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /import \{ PROJECT_PULSE_NOTES \} from '\.\.\/data\/projectPulseNotes\.js';/);
  assert.match(source, /function getProjectPulseSummary\(project\) \{/);
  assert.match(source, /function getProjectPulseDetails\(project\) \{/);
  assert.match(source, /summary: projectPulseSummary,/);
  assert.match(source, /details: projectPulseDetails,/);
});

test('portfolio runtime exposes cross-links between project cases and journal notes', async () => {
  const source = await readFile(new URL('../../src/static-pages/js/index.js', import.meta.url), 'utf8');

  assert.match(source, /const PROJECT_PULSE_RELATIONS = Object\.freeze\(\{/);
  assert.match(source, /'autobox-v1': \['photopizza', 'complexscan', 'megavisor'\]/);
  assert.match(source, /'symbiote-workspace': \['agent-portal', 'symbiote-ui', 'symbiote-engine'\]/);
  assert.match(source, /'symbiote-node': \['symbiote-ui', 'symbiote-engine', 'symbiote-workspace'\]/);
  assert.match(source, /'symbiote-engine': \['symbiote-ui', 'symbiote-workspace'\]/);
  assert.match(source, /'lifecycle-messaging-platform': \['agent-portal', 'symbiote-video-studio', 'symbiote-ui'\]/);
  assert.match(source, /label: `\$\{tPortfolio\('entry\.type\.project'\)\}: \$\{project\.title\}`/);
  assert.match(source, /label: `\$\{tPortfolio\('entry\.type\.note'\)\}: \$\{projectTitleBySlug\.get\(slug\)\}`/);
  assert.doesNotMatch(source, /related: \[project\.title\]/);
});
