const moment = require('moment');


module.exports = (data) => {
  let {
    startDateTime,
    endDateTime,
    step,
    period = 'm',
    days = [1, 2, 3, 4, 5, 6, 7],
    gap = 0,
  } = data;
  const MINUTES_PER_HOUR = 60;
  const MINUTES_PER_DAY = 1440;
  const timeSlots = [];

  let start = moment(startDateTime);
  let end = moment(endDateTime);
  const splitedEndTime = end.format('HH:mm').split(':');
  const splitedStartTime = start.format('HH:mm').split(':');
  let pmToAm = false;

  if (period === 'm' && gap > 0) step = step + gap;
  if (period === 'h') {
    step = step * MINUTES_PER_HOUR + gap;
    period = 'm';
    if (step >= MINUTES_PER_DAY) {
      let x = step / MINUTES_PER_DAY;
      if (x >= 1) {
        x = Math.ceil(x);
        step = x;
        period = 'd';
      }
    }
  }

  if (period === 'd') {
    let current = moment(start);
    while (current <= end) {
      if (days.includes(current.isoWeekday())) timeSlots.push(current.toDate());
      current.add(Number(step), period);
    }
    return timeSlots;
  }

  while (start < end) {
    let edt = moment(start.format('YYYY-MM-DD')).set({
      hour: splitedEndTime[0],
      minute: splitedEndTime[1],
    });
    let current = moment(start);
    if (!days.includes(current.isoWeekday())) {
      start.add(1, 'day');
      continue;
    }
    if (current > edt) {
      edt = sdt.set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      });
      pmToAm = true;
    }
    while (current < edt) {
      timeSlots.push(current.toDate());
      current.add(Number(step), period);
    }
    if (pmToAm) {
      const endx = current.set({
        hour: splitedEndTime[0],
        minute: splitedEndTime[1],
      });
      while (current < endx) {
        timeSlots.push(current.toDate());
        current.add(Number(step), period);
      }
      start = current.set({
        hour: splitedStartTime[0],
        minute: splitedStartTime[1],
      });
    }
    if (!pmToAm) start.add(1, 'day');
    pmToAm = false;
  }

  return timeSlots;
};
