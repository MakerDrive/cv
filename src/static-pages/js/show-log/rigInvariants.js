/**
 * Invariants of the presenter robot during a selection, checked on a recorded
 * trace of the show log (`rig.*` records plus `probe.dom` samples taken by the
 * probe). The checker is pure: the same trace always gives the same verdict,
 * so a bug seen once can be pinned down by its recorded coordinates and timings.
 *
 * Rules:
 *  - arm-flap          the same arm is retracted and thrown again within FLAP_MS
 *  - claw-leaves-frame the claw stays outside the selection frame while it is shown
 *                      (the frame trails the claw while it grows: CLAW_OUT_MS of grace)
 *  - arm-short         the arm stays far shorter than the claw distance
 *  - body-in-frame     the body centre stays inside the selection frame. Sitting in the
 *                      middle for a while and then flying away reads as natural, so
 *                      only a stay longer than BODY_IN_FRAME_MS counts
 */

export const RIG_INVARIANTS = Object.freeze({
  FLAP_MS: 400,
  FRAME_MIN_PX: 60,
  CLAW_MARGIN_PX: 48,
  SHORT_RATIO: 0.5,
  SHORT_MIN_DISTANCE_PX: 160,
  SHORT_FOR_MS: 600,
  BODY_IN_FRAME_MS: 1200,
  CLAW_OUT_MS: 300,
});

const inside = (point, rect, margin = 0) => point.x >= rect.left - margin && point.x <= rect.right + margin
  && point.y >= rect.top - margin && point.y <= rect.bottom + margin;

/**
 * @param {Array<{ at: number, source: string, type: string, data: any }>} entries
 * @returns {Array<{ rule: string, at: number, detail: Record<string, unknown> }>}
 */
export function checkRigTrace(entries, limits = RIG_INVARIANTS) {
  const violations = [];
  const report = (rule, at, detail) => {
    const last = violations[violations.length - 1];
    // One violation per uninterrupted stretch of the same rule.
    if (last && last.rule === rule && at - last.at < 600) { last.until = at; return; }
    violations.push({ rule, at, detail });
  };

  let retiredAt = null;
  let retiredArm = null;
  let clawOutSince = null;
  let rigState = null;
  let shortSince = null;
  let bodyInSince = null;
  for (const entry of entries) {
    const { source, type, data = {} } = entry;
    if (source === 'rig' && type === 'retire-arm') { retiredAt = entry.at; retiredArm = data.arm; }
    if (source === 'rig' && type === 'start-event') {
      if (retiredAt !== null && data.arm === retiredArm && entry.at - retiredAt < limits.FLAP_MS) {
        report('arm-flap', entry.at, { retiredAt, startedAt: entry.at, arm: data.arm });
      }
      retiredAt = null;
    }
    if (source === 'rig' && type === 'state') rigState = data;
    if (source !== 'probe' || type !== 'dom') continue;

    const frame = data.marquee;
    const shown = Boolean(frame && frame.shown && frame.width >= limits.FRAME_MIN_PX);
    if (!shown || !rigState) { shortSince = null; bodyInSince = null; clawOutSince = null; continue; }
    const rect = { left: frame.left, top: frame.top, right: frame.left + frame.width, bottom: frame.top + frame.height };

    if (rigState.claw && !inside(rigState.claw, rect, limits.CLAW_MARGIN_PX)) {
      if (clawOutSince === null) clawOutSince = entry.at;
      if (entry.at - clawOutSince >= limits.CLAW_OUT_MS) {
        report('claw-leaves-frame', entry.at, { claw: rigState.claw, frame: rect });
      }
    } else clawOutSince = null;
    if (rigState.x !== undefined && inside({ x: rigState.x, y: rigState.y }, rect)) {
      if (bodyInSince === null) bodyInSince = entry.at;
      if (entry.at - bodyInSince >= limits.BODY_IN_FRAME_MS) {
        report('body-in-frame', entry.at, { body: { x: rigState.x, y: rigState.y }, frame: rect });
      }
    } else bodyInSince = null;
    const distance = rigState.clawDist;
    const reach = Number(data.hoseReach);
    if (distance > limits.SHORT_MIN_DISTANCE_PX && Number.isFinite(reach)
      && reach < distance * limits.SHORT_RATIO && rigState.active !== null) {
      if (shortSince === null) shortSince = entry.at;
      if (entry.at - shortSince >= limits.SHORT_FOR_MS) report('arm-short', entry.at, { reach, distance });
    } else shortSince = null;
  }
  return violations;
}
