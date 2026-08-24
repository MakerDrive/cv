const intent = (provenanceId, action, target, policy = 'required') => Object.freeze({
  provenanceId,
  action,
  ...(target ? { target } : {}),
  policy,
});

const beat = (id, intents) => Object.freeze({ id, intents: Object.freeze(intents) });

export const TOUR_BEATS = Object.freeze([
  beat('identity', [
    intent('identity-header', 'highlight-surface', 'portfolio/header', 'optional'),
  ]),
  beat('problem', [
    intent('problem-rnd', 'select-entry', 'skills/rnd-engineering'),
  ]),
  beat('agent-portal', [
    intent('agent-portal-select', 'select-entry', 'projects/agent-portal'),
  ]),
  beat('symbiote', [
    intent('symbiote-select', 'select-entry', 'projects/symbiote-workspace'),
  ]),
  beat('museum-capture', [
    intent('museum-capture-select', 'select-entry', 'projects/autobox-v1'),
  ]),
  beat('method', [
    intent('method-rnd', 'highlight-entry', 'skills/rnd-engineering'),
  ]),
  beat('pulse', [
    intent('pulse-select', 'select-entry', 'pulse/index'),
  ]),
  beat('offer', [
    intent('offer-profile', 'select-entry', 'profile/photo'),
  ]),
]);

export const TOUR_MODES = Object.freeze({
  short: Object.freeze([
    'identity',
    'problem',
    'agent-portal',
    'museum-capture',
    'offer',
  ]),
  full: Object.freeze(TOUR_BEATS.map((tourBeat) => tourBeat.id)),
});
