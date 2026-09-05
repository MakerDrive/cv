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

const GENERIC_DESCRIPTOR_BY_NAME = new Map(
  listPresentationAuthoringToolDescriptors().map((descriptor) => [descriptor.name, descriptor]),
);
const CELL_ADD_PAYLOAD_SCHEMA = clone(
  GENERIC_DESCRIPTOR_BY_NAME.get('presentation_authoring_cell_add').inputSchema.properties.payload,
);
const CUE_CELL_SCHEMA = clone(
  (CELL_ADD_PAYLOAD_SCHEMA.properties.cell.oneOf || [])
    .find((variant) => variant.properties?.kind?.enum?.[0] === 'cue'),
);
if (!CUE_CELL_SCHEMA) {
  throw new TypeError('CV Show cue batch requires the canonical provider cue cell schema');
}
const CELL_ADD_CUE_PAYLOAD_SCHEMA = {
  type: 'object',
  properties: {
    cell: CUE_CELL_SCHEMA,
    ...(CELL_ADD_PAYLOAD_SCHEMA.properties.index === undefined
      ? {}
      : { index: CELL_ADD_PAYLOAD_SCHEMA.properties.index }),
  },
  required: [...(CELL_ADD_PAYLOAD_SCHEMA.required || [])],
  additionalProperties: false,
};
const CELL_REMOVE_PAYLOAD_SCHEMA = clone(
  GENERIC_DESCRIPTOR_BY_NAME.get('presentation_authoring_cell_remove').inputSchema.properties.payload,
);
const CELL_DEPENDENCIES_PAYLOAD_SCHEMA = clone(
  GENERIC_DESCRIPTOR_BY_NAME.get('presentation_authoring_cell_set_dependencies').inputSchema.properties.payload,
);
const DIRECTIVE_REFINEMENTS_PAYLOAD_SCHEMA = {
  type: 'object',
  properties: {
    cellId: { type: 'string', minLength: 1 },
    refinements: {
      type: 'object',
      description: 'CV Show directive refinement map. Any portable JSON record is accepted: nested objects, arrays, strings, finite numbers, booleans, and null. Known runtime-consumed fields include safePath (activation path), mode, action, actions (media or chat actions), frames, finalFrame, frameHoldMs (frame sequences), quote, occurrence (selection anchors), and persistent (chat actions). Unknown extra fields are preserved verbatim; do not invent validation restrictions.',
    },
  },
  required: ['cellId', 'refinements'],
  additionalProperties: false,
};

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
            items: {
              type: 'object',
              properties: {
                schemaVersion: { type: 'string', minLength: 1 },
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
                type: { enum: [...ALLOWED_COMMAND_TYPES] },
                payload: {
                  oneOf: [
                    CELL_ADD_CUE_PAYLOAD_SCHEMA,
                    CELL_REMOVE_PAYLOAD_SCHEMA,
                    CELL_DEPENDENCIES_PAYLOAD_SCHEMA,
                    DIRECTIVE_REFINEMENTS_PAYLOAD_SCHEMA,
                  ],
                },
              },
              required: ['schemaVersion', 'id', 'base', 'type', 'payload'],
              additionalProperties: false,
              allOf: [
                {
                  if: { properties: { type: { const: 'cell.add' } }, required: ['type'] },
                  then: {
                    properties: {
                      payload: CELL_ADD_CUE_PAYLOAD_SCHEMA,
                    },
                  },
                },
                {
                  if: { properties: { type: { const: 'cell.remove' } }, required: ['type'] },
                  then: {
                    properties: {
                      payload: CELL_REMOVE_PAYLOAD_SCHEMA,
                    },
                  },
                },
                {
                  if: { properties: { type: { const: 'cell.set-dependencies' } }, required: ['type'] },
                  then: {
                    properties: {
                      payload: CELL_DEPENDENCIES_PAYLOAD_SCHEMA,
                    },
                  },
                },
                {
                  if: { properties: { type: { const: 'cv-show.directive.set-refinements' } }, required: ['type'] },
                  then: {
                    properties: {
                      payload: DIRECTIVE_REFINEMENTS_PAYLOAD_SCHEMA,
                    },
                  },
                },
              ],
            },
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
