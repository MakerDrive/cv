import {
  createPresentationAuthoringProjectHashes,
  createPresentationAuthoringTimelineProjection,
  createPresentationAuthoringToolPack,
  listPresentationAuthoringToolDescriptors,
} from 'symbiote-workspace/browser';
import { applyCvShowMasterProjectCommands } from './presentationProjectAdapter.js';

const CUE_BATCH_TOOL_NAME = 'presentation_authoring_cv_show_cue_batch';
const ENTRY_SUBTITLE_TOOL_NAME = 'presentation_authoring_cv_show_entry_set_subtitle';
const ALLOWED_COMMAND_TYPES = new Set([
  'cell.add',
  'cell.remove',
  'cell.set-dependencies',
  'cv-show.directive.set-refinements',
]);

function clone(value) {
  return structuredClone(value);
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function fail(reason, details = {}) {
  throw Object.assign(
    new TypeError(`CV Show cue batch is invalid: ${reason}`),
    { code: 'CV_SHOW_AUTHORING_COMMAND_INVALID', details: freezeDeep(clone(details)) },
  );
}

function isPlainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return [Object.prototype, null].includes(Object.getPrototypeOf(value));
}

function exactKeys(value, expected) {
  if (!isPlainRecord(value)) return false;
  const keys = Object.keys(value).sort();
  const accepted = [...expected].sort();
  return keys.length === accepted.length
    && keys.every((key, index) => key === accepted[index]);
}

function sameBase(left, right) {
  return left?.revision === right?.revision
    && left?.authoringProjectHash === right?.authoringProjectHash;
}

function cellForCommand(project, command) {
  if (command.type === 'cell.add') return command.payload?.cell;
  const cellId = command.payload?.cellId;
  return typeof cellId === 'string'
    ? project.cells.find(({ id }) => id === cellId)
    : null;
}

function normalizeCueBatchInput(input, project) {
  if (!exactKeys(input, ['id', 'base', 'payload'])) fail('input shape');
  if (typeof input.id !== 'string' || !input.id.trim()) fail('id');
  if (!exactKeys(input.base, ['revision', 'authoringProjectHash'])) fail('base');
  if (!sameBase(input.base, { revision: project.revision, authoringProjectHash: project.hash })) {
    fail('stale base', {
      expected: { revision: project.revision, authoringProjectHash: project.hash },
      received: input.base,
    });
  }
  if (!exactKeys(input.payload, ['commands'])) fail('payload');
  const commands = input.payload.commands;
  if (!Array.isArray(commands) || commands.length === 0) fail('commands');
  for (const command of commands) {
    if (!isPlainRecord(command) || !ALLOWED_COMMAND_TYPES.has(command.type)) {
      fail('unsupported command', { commandType: command?.type });
    }
    if (!sameBase(command.base, input.base)) {
      fail('command base', { commandId: command.id });
    }
    const cell = cellForCommand(project, command);
    if (command.type === 'cv-show.directive.set-refinements') continue;
    if (!cell || cell.kind !== 'cue') {
      fail('cue-only command', { commandId: command.id, cellId: command.payload?.cellId });
    }
  }
  return { id: input.id, base: clone(input.base), commands: clone(commands) };
}

const CUE_BATCH_DESCRIPTOR = freezeDeep({
  name: CUE_BATCH_TOOL_NAME,
  description: 'Apply one atomic CV Show cue-only command batch, including directive refinements.',
  mutates: true,
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      base: {
        type: 'object',
        properties: {
          revision: { type: 'integer', minimum: 0 },
          authoringProjectHash: { type: 'string', minLength: 1 },
        },
        required: ['revision', 'authoringProjectHash'],
        additionalProperties: false,
      },
      payload: {
        type: 'object',
        properties: {
          commands: {
            type: 'array',
            minItems: 1,
            items: { type: 'object' },
          },
        },
        required: ['commands'],
        additionalProperties: false,
      },
    },
    required: ['id', 'base', 'payload'],
    additionalProperties: false,
  },
});

const ENTRY_SUBTITLE_DESCRIPTOR = freezeDeep({
  name: ENTRY_SUBTITLE_TOOL_NAME,
  description: 'Set one normal CV Show subtitle independently from its pronunciation-oriented narration.',
  mutates: true,
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', minLength: 1 },
      base: {
        type: 'object',
        properties: {
          revision: { type: 'integer', minimum: 0 },
          authoringProjectHash: { type: 'string', minLength: 1 },
        },
        required: ['revision', 'authoringProjectHash'],
        additionalProperties: false,
      },
      payload: {
        type: 'object',
        properties: {
          entryId: { type: 'string', minLength: 1 },
          subtitle: { type: 'string', minLength: 1 },
        },
        required: ['entryId', 'subtitle'],
        additionalProperties: false,
      },
    },
    required: ['id', 'base', 'payload'],
    additionalProperties: false,
  },
});

export function listCvShowAuthoringToolDescriptors() {
  return Object.freeze([
    ...listPresentationAuthoringToolDescriptors(),
    CUE_BATCH_DESCRIPTOR,
    ENTRY_SUBTITLE_DESCRIPTOR,
  ].map(freezeDeep));
}

/**
 * @param {{ authority?: any, regeneration?: any }} [options]
 */
export function createCvShowAuthoringToolPack(options = {}) {
  const { authority, regeneration } = options;
  const generic = createPresentationAuthoringToolPack({ authority, regeneration });
  const tools = listCvShowAuthoringToolDescriptors();

  /**
   * @param {string} name
   * @param {Record<string, any>} [input]
   * @param {{ signal?: AbortSignal }} [options]
   */
  async function invoke(name, input = {}, options = {}) {
    const { signal } = options;
    if (![CUE_BATCH_TOOL_NAME, ENTRY_SUBTITLE_TOOL_NAME].includes(name)) {
      return generic.invoke(name, input, { signal });
    }
    signal?.throwIfAborted?.();
    const current = authority.read();
    const normalized = name === CUE_BATCH_TOOL_NAME
      ? normalizeCueBatchInput(input, current.project)
      : (() => {
          if (!exactKeys(input, ['id', 'base', 'payload'])) fail('input shape');
          if (typeof input.id !== 'string' || !input.id.trim()) fail('id');
          if (!exactKeys(input.base, ['revision', 'authoringProjectHash'])) fail('base');
          if (!sameBase(input.base, {
            revision: current.project.revision,
            authoringProjectHash: current.project.hash,
          })) fail('stale base');
          if (
            !exactKeys(input.payload, ['entryId', 'subtitle'])
            || typeof input.payload.entryId !== 'string'
            || typeof input.payload.subtitle !== 'string'
            || !input.payload.subtitle.trim()
          ) fail('payload');
          return {
            id: input.id,
            base: clone(input.base),
            commands: [{
              schemaVersion: 'workspace-presentation-authoring-command-v1',
              id: input.id,
              base: clone(input.base),
              type: 'cv-show.entry.set-subtitle',
              payload: clone(input.payload),
            }],
          };
        })();
    let result;
    await authority.transact({ base: normalized.base }, (snapshot) => {
      const project = applyCvShowMasterProjectCommands(snapshot.project, normalized.commands);
      result = {
        project,
        hashes: createPresentationAuthoringProjectHashes(project),
        timeline: createPresentationAuthoringTimelineProjection(project),
        mediaDisposition: {
          status: 'preserved',
          mediaCollection: clone(snapshot.mediaCollection),
        },
      };
      return { project, mediaCollection: snapshot.mediaCollection };
    });
    signal?.throwIfAborted?.();
    return freezeDeep(clone(result));
  }

  return Object.freeze({ tools, invoke });
}
