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
 * HTML of the profile dashboard: metric cells, the availability status with the host's local time,
 * and the working-hours ruler. Labels come from the caller (already localized).
 * @param {{ metrics: Array<{ value: string, label: string }>, status: string, hostCity: string,
 *   ruler: ReturnType<typeof computeWorkingRuler>, labels: { rulerTitle: string, overlap: string, hostTime: string } }} data
 */
export function renderProfileDashboard({ metrics, status, hostCity, ruler, labels }) {
  const cells = metrics.map((metric) => `<div class="profile-metric"><span class="profile-metric-value">${escapeHtml(metric.value)}</span><span class="profile-metric-label">${escapeHtml(metric.label)}</span></div>`).join('');
  const track = ruler.hours.map((item) => `<span class="profile-ruler-cell"${item.working ? ' data-working' : ''}${item.now ? ' data-now' : ''}></span>`).join('');
  return `<div class="profile-dashboard">
<div class="profile-metrics">${cells}</div>
<div class="profile-status"><span class="profile-status-dot" aria-hidden="true"></span><span class="profile-status-text">${escapeHtml(status)}</span><span class="profile-status-time">${escapeHtml(hostCity)} · <span data-host-time>${escapeHtml(ruler.hostTime)}</span></span></div>
<div class="profile-ruler" role="img" aria-label="${escapeHtml(`${labels.rulerTitle}: ${ruler.overlap} ${labels.overlap}`)}">
<div class="profile-ruler-head"><span>${escapeHtml(labels.rulerTitle)}</span><span>${ruler.overlap} ${escapeHtml(labels.overlap)}</span></div>
<div class="profile-ruler-track">${track}</div>
<div class="profile-ruler-scale"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
</div>
</div>`;
}
