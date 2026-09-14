import assert from 'node:assert/strict';
import test from 'node:test';

import {
  computeSpeechMetrics,
  evaluateMachineReview,
  normalizeSpeechTokens,
} from '../../scripts/cv-show-audio-machine-review.js';

test('machine review metrics accept exact normalized matches', () => {
  const authored = 'Привет, я Владимир. В две тысячи двадцать шестом году мой фокус это программные платформы.';
  const observed = 'Привет, я Владимир. В 2026 году мой фокус это программные платформы.';
  const { metrics, critical } = computeSpeechMetrics({ authoredText: authored, observedText: observed });
  assert.equal(metrics.wer, 0);
  assert.equal(metrics.cer, 0);
  assert.equal(metrics.coverage, 1);
  assert.deepEqual(critical, []);
  assert.equal(evaluateMachineReview(metrics, critical), true);
});

test('machine review rejects a negation loss', () => {
  const authored = 'Исполнитель не должен продолжать нажимать вслепую.';
  const observed = 'Исполнитель должен продолжать нажимать вслепую.';
  const { metrics, critical } = computeSpeechMetrics({ authoredText: authored, observedText: observed });
  assert.ok(critical.some((item) => item.includes('negation')));
  assert.equal(evaluateMachineReview(metrics, critical), false);
});

test('machine review rejects a different number', () => {
  const authored = 'С две тысячи семнадцатого по две тысячи двадцать второй год.';
  const observed = 'С две тысячи семнадцатого по две тысячи двадцать третий год.';
  const { metrics, critical } = computeSpeechMetrics({ authoredText: authored, observedText: observed });
  assert.ok(critical.length > 0);
  assert.equal(evaluateMachineReview(metrics, critical), false);
});

test('machine review tolerates known brand spellings', () => {
  const authored = 'Мой эксперимент с ай би эм Maximo в Symbiote Workspace.';
  const observed = 'Мой эксперимент с IBM Максимо в симбиот воркспейс.';
  const { metrics, critical } = computeSpeechMetrics({ authoredText: authored, observedText: observed });
  assert.equal(metrics.wer, 0);
  assert.deepEqual(critical, []);
  assert.equal(evaluateMachineReview(metrics, critical), true);
});

test('machine review rejects trimmed content', () => {
  const authored = 'Один блок управления мог работать с платформами разных размеров и моторизированной панорамной головкой.';
  const observed = 'Один блок управления мог работать с платформами.';
  const { metrics, critical } = computeSpeechMetrics({ authoredText: authored, observedText: observed });
  assert.ok(metrics.coverage < 0.98);
  assert.equal(evaluateMachineReview(metrics, critical), false);
});

test('normalization folds phrases, number runs, and letter aliases', () => {
  assert.deepEqual(
    normalizeSpeechTokens('Авто Бокс! эм си пи: две тысячи двадцать шестом; триста шестьдесят градусов.'),
    ['autobox', 'mcp', 'num:2026', 'num:360', 'градусов'],
  );
  assert.deepEqual(
    normalizeSpeechTokens('икс ар пример'),
    ['xr', 'пример'],
  );
});
