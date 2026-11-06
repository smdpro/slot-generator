const generate = require('./index');

function assertEqual(actual, expected, msg) {
  const pass = actual === expected;
  console.log(`${pass ? '✓' : '✗'} ${msg}: ${pass ? '' : `expected ${expected}, got ${actual}`}`);
  return pass;
}

function assertDeepEqual(actual, expected, msg) {
  const pass = actual.length === expected.length && 
    actual.every((d, i) => d.toISOString() === expected[i]);
  console.log(`${pass ? '✓' : '✗'} ${msg}: ${pass ? '' : `expected ${expected.length}, got ${actual.length}`}`);
  if (!pass) {
    console.log('  Expected:', expected);
    console.log('  Actual:', actual.map(d => d.toISOString()));
  }
  return pass;
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    if (fn()) passed++;
    else failed++;
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
    failed++;
  }
}

// --- Original test cases (regression) ---
test('Test 1: Basic minute slots (Saturday, 20min)', () => {
  const res = generate({
    start: '2022-03-12T05:30:00.000Z',
    end: '2022-03-12T07:30:00.000Z',
    step: 20,
    period: 'm',
    daysInWeek: [6],
    gap: 0,
  });
  return assertDeepEqual(res, [
    '2022-03-12T05:30:00.000Z',
    '2022-03-12T05:50:00.000Z',
    '2022-03-12T06:10:00.000Z',
    '2022-03-12T06:30:00.000Z',
    '2022-03-12T06:50:00.000Z',
    '2022-03-12T07:10:00.000Z',
  ], 'Test 1');
});

test('Test 2: Minute slots with gap (Friday, 20min + 10min gap)', () => {
  const res = generate({
    start: '2022-03-11T05:30:00.000Z',
    end: '2022-03-11T08:30:00.000Z',
    step: 20,
    period: 'm',
    daysInWeek: [5],
    gap: 10,
  });
  return assertDeepEqual(res, [
    '2022-03-11T05:30:00.000Z',
    '2022-03-11T06:00:00.000Z',
    '2022-03-11T06:30:00.000Z',
    '2022-03-11T07:00:00.000Z',
    '2022-03-11T07:30:00.000Z',
    '2022-03-11T08:00:00.000Z',
  ], 'Test 2');
});

test('Test 3: Hour slots across days (Sat, Mon, Wed)', () => {
  const res = generate({
    start: '2022-03-12T05:30:00.000Z',
    end: '2022-03-18T07:30:00.000Z',
    step: 1,
    period: 'h',
    daysInWeek: [6, 1, 3],
    gap: 0,
  });
  return assertDeepEqual(res, [
    '2022-03-12T05:30:00.000Z',
    '2022-03-12T06:30:00.000Z',
    '2022-03-14T05:30:00.000Z',
    '2022-03-14T06:30:00.000Z',
    '2022-03-16T05:30:00.000Z',
    '2022-03-16T06:30:00.000Z',
  ], 'Test 3');
});

test('Test 4: Single day minute slots (Wednesday)', () => {
  const res = generate({
    start: '2022-06-29T18:30:00.000Z',
    end: '2022-06-29T20:30:00.000Z',
    step: 20,
    period: 'm',
    daysInWeek: [3, 4],
    gap: 0,
  });
  return assertDeepEqual(res, [
    '2022-06-29T18:30:00.000Z',
    '2022-06-29T18:50:00.000Z',
    '2022-06-29T19:10:00.000Z',
    '2022-06-29T19:30:00.000Z',
    '2022-06-29T19:50:00.000Z',
    '2022-06-29T20:10:00.000Z',
  ], 'Test 4');
});

test('Test 5: Multi-week recurring (Wed, Sat, Mon)', () => {
  const res = generate({
    start: '2022-06-29T05:30:00.000Z',
    end: '2022-07-06T06:30:00.000Z',
    step: 20,
    period: 'm',
    daysInWeek: [6, 1, 3],
    gap: 0,
  });
  return assertDeepEqual(res, [
    '2022-06-29T05:30:00.000Z',
    '2022-06-29T05:50:00.000Z',
    '2022-06-29T06:10:00.000Z',
    '2022-07-02T05:30:00.000Z',
    '2022-07-02T05:50:00.000Z',
    '2022-07-02T06:10:00.000Z',
    '2022-07-04T05:30:00.000Z',
    '2022-07-04T05:50:00.000Z',
    '2022-07-04T06:10:00.000Z',
    '2022-07-06T05:30:00.000Z',
    '2022-07-06T05:50:00.000Z',
    '2022-07-06T06:10:00.000Z',
  ], 'Test 5');
});

// --- New edge case tests ---

test('Edge: Cross-midnight (22:00-06:00)', () => {
  const res = generate({
    start: '2022-03-12T22:00:00.000Z',
    end: '2022-03-13T06:00:00.000Z',
    step: 1,
    period: 'h',
    daysInWeek: [6, 7],
    gap: 0,
  });
  // Should generate: 22:00, 23:00, 00:00, 01:00, 02:00, 03:00, 04:00, 05:00 (8 slots)
  return assertEqual(res.length, 8, 'Edge: Cross-midnight count');
});

test('Edge: Day period (every 2 days, weekdays only)', () => {
  const res = generate({
    start: '2022-03-14T00:00:00.000Z', // Monday
    end: '2022-03-25T00:00:00.000Z',   // Friday
    step: 2,
    period: 'd',
    daysInWeek: [1,2,3,4,5],
    gap: 0,
  });
  // Mon 14, Wed 16, Fri 18, Tue 22, Thu 24 = 5 days
  return assertEqual(res.length, 5, 'Edge: Day period count');
});

test('Edge: Start/end as Date objects', () => {
  const res = generate({
    start: new Date('2022-03-12T05:30:00.000Z'),
    end: new Date('2022-03-12T07:30:00.000Z'),
    step: 60,
    period: 'm',
    daysInWeek: [6],
    gap: 0,
  });
  return assertDeepEqual(res, [
    '2022-03-12T05:30:00.000Z',
    '2022-03-12T06:30:00.000Z',
  ], 'Edge: Date object inputs');
});

test('Edge: Start/end as timestamps', () => {
  const res = generate({
    start: new Date('2022-03-12T05:30:00.000Z').getTime(),
    end: new Date('2022-03-12T07:30:00.000Z').getTime(),
    step: 60,
    period: 'm',
    daysInWeek: [6],
    gap: 0,
  });
  return assertDeepEqual(res, [
    '2022-03-12T05:30:00.000Z',
    '2022-03-12T06:30:00.000Z',
  ], 'Edge: Timestamp inputs');
});

test('Edge: Default options (no args)', () => {
  const res = generate({});
  // Default: now to +1 hour, 5 min step, all days
  return assertEqual(res.length >= 12, true, 'Edge: Default options generates slots');
});

test('Edge: Single day, step larger than window', () => {
  const res = generate({
    start: '2022-03-12T05:30:00.000Z',
    end: '2022-03-12T06:00:00.000Z',
    step: 60,
    period: 'm',
    daysInWeek: [6],
    gap: 0,
  });
  // Only 1 slot fits (05:30)
  return assertEqual(res.length, 1, 'Edge: Step larger than window');
});

test('Edge: Empty daysInWeek', () => {
  const res = generate({
    start: '2022-03-12T05:30:00.000Z',
    end: '2022-03-12T07:30:00.000Z',
    step: 20,
    period: 'm',
    daysInWeek: [],
    gap: 0,
  });
  return assertEqual(res.length, 0, 'Edge: Empty daysInWeek');
});

test('Edge: Hour period converts correctly', () => {
  const res = generate({
    start: '2022-03-12T05:30:00.000Z',
    end: '2022-03-12T08:30:00.000Z',
    step: 1,
    period: 'h',
    daysInWeek: [6],
    gap: 0,
  });
  // 5:30, 6:30, 7:30 = 3 slots
  return assertEqual(res.length, 3, 'Edge: Hour period');
});

test('Edge: Gap with hour period', () => {
  const res = generate({
    start: '2022-03-12T05:30:00.000Z',
    end: '2022-03-12T12:30:00.000Z',
    step: 1,
    period: 'h',
    daysInWeek: [6],
    gap: 30, // 1h30m = 90min
  });
  // 5:30, 7:00, 8:30, 10:00, 11:30 = 5 slots
  return assertEqual(res.length, 5, 'Edge: Gap with hour period');
});

test('Edge: Large date range (1 year, weekdays, 30min)', () => {
  const res = generate({
    start: '2026-01-01T09:00:00.000Z',
    end: '2026-12-31T17:00:00.000Z',
    step: 30,
    period: 'm',
    daysInWeek: [1,2,3,4,5],
    gap: 0,
  });
  // ~260 weekdays * 16 slots/day = ~4160
  return assertEqual(res.length > 4000, true, 'Edge: Large date range');
});

test('Edge: Start after end (should return empty)', () => {
  const res = generate({
    start: '2022-03-12T10:00:00.000Z',
    end: '2022-03-12T09:00:00.000Z',
    step: 30,
    period: 'm',
    daysInWeek: [6],
    gap: 0,
  });
  return assertEqual(res.length, 0, 'Edge: Start after end');
});

test('Edge: Weekend only (days 6,7)', () => {
  const res = generate({
    start: '2022-03-12T09:00:00.000Z', // Saturday
    end: '2022-03-20T17:00:00.000Z',   // Sunday
    step: 60,
    period: 'm',
    daysInWeek: [6, 7],
    gap: 0,
  });
  // Sat 12, Sun 13, Sat 19, Sun 20 = 4 days * 8 slots = 32
  return assertEqual(res.length, 32, 'Edge: Weekend only');
});

test('Edge: Returns Date objects', () => {
  const res = generate({
    start: '2022-03-12T05:30:00.000Z',
    end: '2022-03-12T06:30:00.000Z',
    step: 30,
    period: 'm',
    daysInWeek: [6],
    gap: 0,
  });
  return assertEqual(res[0] instanceof Date, true, 'Edge: Returns Date objects');
});

// --- Summary ---
console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
if (failed > 0) process.exit(1);
