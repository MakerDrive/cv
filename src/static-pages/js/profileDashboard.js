const HOST_OFFSET_MINUTES = -180; // Buenos Aires, GMT-3
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[tag] || tag));
}

const pad = (value) => String(value).padStart(2, '0');

/**
 * The visitor's day against the host's working hours: for each local hour 0..23 whether the host
 * works then, which hour is the current one, and the host's wall-clock time.
 * @param {{ nowMs: number, viewerOffsetMinutes: number, hostOffsetMinutes?: number,
 *   startHour?: number, endHour?: number }} options offsets are minutes east of UTC
 * @returns {{ hours: Array<{ hour: number, working: boolean, now: boolean }>, overlap: number,
 *   hostTime: string, viewerHour: number }}
 */
export function computeWorkingRuler({
  nowMs,
  viewerOffsetMinutes,
  hostOffsetMinutes = HOST_OFFSET_MINUTES,
  startHour = WORK_START_HOUR,
  endHour = WORK_END_HOUR,
}) {
  const shift = hostOffsetMinutes - viewerOffsetMinutes;
  const viewerMinutes = ((Math.floor(nowMs / 60000) + viewerOffsetMinutes) % 1440 + 1440) % 1440;
  const viewerHour = Math.floor(viewerMinutes / 60);
  const hours = Array.from({ length: 24 }, (_, hour) => {
    const hostHour = ((((hour * 60 + shift) / 60) % 24) + 24) % 24;
    return { hour, working: hostHour >= startHour && hostHour < endHour, now: hour === viewerHour };
  });
  const hostMinutes = ((viewerMinutes + shift) % 1440 + 1440) % 1440;
  return {
    hours,
    overlap: hours.filter((item) => item.working).length,
    hostTime: `${pad(Math.floor(hostMinutes / 60))}:${pad(hostMinutes % 60)}`,
    viewerHour,
  };
}

/**
 * What one picked hour of the visitor's day means for the host: both clock times and whether the
 * host is working then.
 * @param {{ hour: number, viewerOffsetMinutes: number, hostOffsetMinutes?: number,
 *   startHour?: number, endHour?: number }} options
 * @returns {{ viewer: string, host: string, working: boolean }}
 */
export function rulerReadout({
  hour,
  viewerOffsetMinutes,
  hostOffsetMinutes = HOST_OFFSET_MINUTES,
  startHour = WORK_START_HOUR,
  endHour = WORK_END_HOUR,
}) {
  const hostMinutes = ((hour * 60 + hostOffsetMinutes - viewerOffsetMinutes) % 1440 + 1440) % 1440;
  const hostHour = Math.floor(hostMinutes / 60);
  return {
    viewer: `${pad(hour)}:00`,
    host: `${pad(hostHour)}:${pad(hostMinutes % 60)}`,
    working: hostHour >= startHour && hostHour < endHour,
  };
}

/**
 * The availability line shown under the name: a dot, the status and the host's local time.
 * @param {{ status: string, hostCity: string, hostTime: string }} data
 */
export function renderProfileStatus({ status, hostCity, hostTime }) {
  return `<div class="profile-status"><span class="profile-status-dot" aria-hidden="true"></span><span class="profile-status-text">${escapeHtml(status)}</span><span class="profile-status-time">${escapeHtml(hostCity)} · <span data-host-time>${escapeHtml(hostTime)}</span></span></div>`;
}

/**
 * HTML of the profile dashboard: metric cells and the working-hours ruler. Labels come from the caller (already localized).
 * @param {{ metrics: Array<{ value: string, label: string }>,
 *   ruler: ReturnType<typeof computeWorkingRuler>, labels: { rulerTitle: string, overlap: string, hostTime: string } }} data
 */
export function renderProfileDashboard({ metrics, ruler, labels }) {
  const cells = metrics.map((metric) => `<div class="profile-metric"><span class="profile-metric-value">${escapeHtml(metric.value)}</span><span class="profile-metric-label">${escapeHtml(metric.label)}</span></div>`).join('');
  const track = ruler.hours.map((item) => `<span class="profile-ruler-cell" data-hour="${item.hour}"${item.working ? ' data-working' : ''}${item.now ? ' data-now' : ''}></span>`).join('');
  return `<div class="profile-dashboard">
<div class="profile-metrics">${cells}</div>
<div class="profile-ruler" data-overlap="${ruler.overlap} ${escapeHtml(labels.overlap)}">
<div class="profile-ruler-head"><span>${escapeHtml(labels.rulerTitle)}</span><span class="profile-ruler-readout" aria-live="polite">${ruler.overlap} ${escapeHtml(labels.overlap)}</span></div>
<div class="profile-ruler-track" role="slider" tabindex="0" aria-label="${escapeHtml(labels.rulerTitle)}" aria-valuemin="0" aria-valuemax="23" aria-valuenow="${ruler.viewerHour}">${track}</div>
<div class="profile-ruler-scale"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
</div>
</div>`;
}
