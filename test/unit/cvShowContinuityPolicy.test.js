import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CV_SHOW_FAILURE_SEMANTICS,
  CV_SHOW_RECOVERY,
  cvShowCellLayerId,
  resolveCvShowFailureSemantics,
  resolveFailureRecovery,
} from '../../src/static-pages/js/tour-player/failurePolicy.js';
import {
  completeDegradedInteractionSettlement,
} from '../../src/static-pages/js/tour-player/showAdapter.js';
import { CV_SHOW_PRESENTATION_PROJECT } from '../../src/static-pages/data/cvShowPresentationProject.js';

function cellRole(cell) {
  return String(cell.cue?.interaction?.type || cell.cue?.kind || cell.kind || '');
}

function cellKind(cell) {
  if (cell.kind === 'audio-clip') return 'audio';
  return cell.cue?.kind || cell.kind;
}

test('every authored cell of all 30 entries resolves to a semantic failure class', () => {
  const unknown = [];
  const counted = { soft: 0, gate: 0, critical: 0, unknown: 0 };
  for (const cell of CV_SHOW_PRESENTATION_PROJECT.cells) {
    const semantics = resolveCvShowFailureSemantics({
      kind: cellKind(cell),
      layerId: cvShowCellLayerId(cell),
      operationRole: cellRole(cell),
    });
    counted[semantics] += 1;
    if (semantics === CV_SHOW_FAILURE_SEMANTICS.UNKNOWN) unknown.push(cell.id);
  }
  assert.deepEqual(unknown, [], 'unknown classification for authored cells');
  assert.equal(counted.soft > 0, true);
  assert.equal(counted.gate > 0, true);
  assert.equal(counted.critical, CV_SHOW_PRESENTATION_PROJECT.cells.filter(
    ({ kind }) => kind === 'audio-clip' || kind === 'narration',
  ).length);
});

test('no authored soft cell can pause-report narration once it started', () => {
  const violations = [];
  for (const cell of CV_SHOW_PRESENTATION_PROJECT.cells) {
    const input = {
      kind: cellKind(cell),
      layerId: cvShowCellLayerId(cell),
      operationRole: cellRole(cell),
      narrationStarted: true,
    };
    if (resolveCvShowFailureSemantics(input) !== CV_SHOW_FAILURE_SEMANTICS.SOFT) continue;
    const recovery = resolveFailureRecovery(input);
    if (![CV_SHOW_RECOVERY.DEGRADE, CV_SHOW_RECOVERY.SKIP].includes(recovery)) {
      violations.push(`${cell.id}:${recovery}`);
    }
  }
  assert.deepEqual(violations, []);
});

test('audio and narration cells never degrade or skip', () => {
  for (const cell of CV_SHOW_PRESENTATION_PROJECT.cells) {
    if (cell.kind !== 'audio-clip' && cell.kind !== 'narration') continue;
    const recovery = resolveFailureRecovery({
      kind: cellKind(cell),
      layerId: cvShowCellLayerId(cell),
      narrationStarted: true,
    });
    assert.equal(recovery, CV_SHOW_RECOVERY.PAUSE_REPORT, cell.id);
  }
});

test('navigate cells stay gate-classified', () => {
  const navigates = CV_SHOW_PRESENTATION_PROJECT.cells.filter(
    ({ cue }) => cue?.interaction?.type === 'navigate',
  );
  assert.ok(navigates.length > 0);
  for (const cell of navigates) {
    assert.equal(
      resolveCvShowFailureSemantics({
        kind: cellKind(cell),
        layerId: cvShowCellLayerId(cell),
        operationRole: cellRole(cell),
      }),
      CV_SHOW_FAILURE_SEMANTICS.GATE,
      cell.id,
    );
  }
});

test('degraded interaction settlement reports exactly the missing settled receipt', () => {
  const receipts = [];
  const operation = {
    kind: 'interaction',
    projectCell: {
      id: 'cv-show:cue:workspace.portable-config:scroll',
      cue: { kind: 'interaction', interaction: { type: 'scroll' }, targetId: 'x' },
    },
    signal: { aborted: false },
    reportedReceipts: [{ status: 'acted' }],
    reportReceipt(receipt) {
      receipts.push(receipt);
      return receipt;
    },
  };
  assert.equal(completeDegradedInteractionSettlement(operation, {
    outcome: 'PRESENTATION_EFFECT_OPERATION_FAILED',
    fallback: 'none-skipped',
  }), true);
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].status, 'settled');
  assert.equal(receipts[0].providerReceipt.degraded, true);
  assert.equal(receipts[0].providerReceipt.outcome, 'PRESENTATION_EFFECT_OPERATION_FAILED');

  // Already settled or aborted operations are left untouched.
  const settled = { ...operation, reportedReceipts: [{ status: 'acted' }, { status: 'settled' }] };
  const aborted = { ...operation, signal: { aborted: true } };
  assert.equal(completeDegradedInteractionSettlement(settled), false);
  assert.equal(completeDegradedInteractionSettlement(aborted), false);
  assert.equal(receipts.length, 1);
});
