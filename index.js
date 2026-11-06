const Periods = Object.freeze({
  minute: 'm',
  hour: 'h',
  day: 'd',
});

/**
 * Generates recurring time slots between start and end.
 * @param {Object} opts
 * @param {Date|string|number} opts.start - Start date (default: now)
 * @param {Date|string|number} opts.end - End date (default: +1 hour)
 * @param {number} opts.step - Interval step (default: 5)
 * @param {'m'|'h'|'d'} opts.period - Unit: minute/hour/day (default: 'm')
 * @param {number[]} opts.daysInWeek - ISO weekdays 1-7 (default: all)
 * @param {number} opts.gap - Extra minutes added to step (default: 0)
 * @returns {Date[]}
 */
module.exports = ({ start = new Date(), end = new Date(Date.now() + 36e5), step = 5, period = 'm', daysInWeek = [1,2,3,4,5,6,7], gap = 0 } = {}) => {
  const slots = [];
  const daySet = new Set(daysInWeek);

  // Normalize to minute step
  let stepMin = step;
  if (period === 'h') stepMin = step * 60 + gap;
  else if (period === 'd') stepMin = step * 1440;
  else stepMin += gap;

  const msPerStep = stepMin * 60_000;

  const s = new Date(start).getTime();
  const e = new Date(end).getTime();

  // Extract daily window from start/end dates
  const startDate = new Date(s);
  const endDate = new Date(e);
  const startH = startDate.getHours();
  const startM = startDate.getMinutes();
  const endH = endDate.getHours();
  const endM = endDate.getMinutes();
  const crossMidnight = (endH < startH) || (endH === startH && endM <= startM);

  // Day-granularity: simple loop
  if (period === 'd') {
    for (let t = s; t <= e; t += msPerStep) {
      const d = new Date(t);
      if (daySet.has(d.getDay() || 7)) slots.push(d);
    }
    return slots;
  }

  // Minute/hour granularity: iterate days, then slots within window
  const dayStart = new Date(startDate);
  dayStart.setHours(0, 0, 0, 0);

  for (let day = dayStart.getTime(); day <= e; day += 86_400_000) {
    const dow = new Date(day).getDay() || 7; // ISO weekday
    if (!daySet.has(dow)) continue;

    const windowStart = day + startH * 3_600_000 + startM * 60_000;
    let windowEnd = day + endH * 3_600_000 + endM * 60_000;
    if (crossMidnight) windowEnd += 86_400_000; // next day

    const slotStart = Math.max(windowStart, s);
    const slotEnd = Math.min(windowEnd, e);

    for (let t = slotStart; t < slotEnd; t += msPerStep) {
      slots.push(new Date(t));
    }
  }
  return slots;
};
