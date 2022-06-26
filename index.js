const moment = require('moment');
const Periods = Object.freeze({
  minute: 'm',
  hour: 'h',
  day: 'd',
});
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = MINUTES_PER_HOUR * 24;
module.exports = (data) => {
  let {
    startDateTime,
    endDateTime,
    step=5,
    period = Periods.minute,
    daysInWeek = [1, 2, 3, 4, 5, 6, 7],
    gap = 0,
  } = data;
  
  const timeSlots = [];

  let start = moment(startDateTime);
  const end = moment(endDateTime);
  const [startHour,startMinute] = start.format('HH:mm').split(':');
  const [endHour,endMinute] = end.format('HH:mm').split(':');
  let pmToAm = false;

  if (period === Periods.minute && gap > 0) step = step + gap;
  if (period === Periods.hour) {
    step = step * MINUTES_PER_HOUR + gap;
    period = Periods.minute;
    if (step >= MINUTES_PER_DAY) {
      let days = step / MINUTES_PER_DAY;
      if (days >= 1) {
        step = Math.ceil(days);
        period = Periods.day;
      }
    }
  }

  if (period === Periods.day) {
    let current = moment(start);
    while (current <= end) {
      if (daysInWeek.includes(current.isoWeekday())) timeSlots.push(current.toDate());
      current.add(step, period);
    }
    return timeSlots;
  }

  while (start < end) {
    let current = moment(start);
    if (!daysInWeek.includes(current.isoWeekday())) {
      start.add(1, 'day');
      continue;
    }
    let edt = moment(start.format('YYYY-MM-DD')).set({
      hour: endHour,
      minute: endMinute,
    });
    
    if (current > edt) {
      edt = moment(start).set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      });
      pmToAm = true;
    }
    while (current < edt) {
      timeSlots.push(current.toDate());
      current.add(step, period);
    }
    if (pmToAm) {
      const endx = moment(current).set({
        hour: endHour,
        minute: endMinute,
      });
      while (current < endx) {
        timeSlots.push(current.toDate());
        current.add(step, period);
      }
      start = moment(current).set({
        hour: startHour,
        minute: startMinute,
      });
    }
    if (!pmToAm) start.add(1, 'day');
    pmToAm = false;
  }

  return timeSlots;
};
