const generate = require('./index');
const moment = require('moment');

describe('test one', () => {
  it('Should generate 6 slot', () => {
    let data = {
      startDateTime: '2022-03-12T05:30:00.000Z',
      endDateTime: '2022-03-12T07:30:00.000Z',
      step: 20,
      period: 'm',
      days: [6],
      gap: 0,
    };
    let result = [
      '2022-03-12T05:30:00.000Z',
      '2022-03-12T05:50:00.000Z',
      '2022-03-12T06:10:00.000Z',
      '2022-03-12T06:30:00.000Z',
      '2022-03-12T06:50:00.000Z',
      '2022-03-12T07:10:00.000Z',
    ];
    let res = generate(data);
    expect(res.length).toBe(result.length);
    for (let i = 0; i < res.length; i++)
      expect(moment(res[i]).toDate()).toEqual(moment(result[i]).toDate());
  });

  it('Should generate 6 slot', () => {
    let data = {
      startDateTime: '2022-03-11T05:30:00.000Z',
      endDateTime: '2022-03-11T08:30:00.000Z',
      step: 20,
      period: 'm',
      days: [5],
      gap: 10,
    };
    let result = [
      '2022-03-11T05:30:00.000Z',
      '2022-03-11T06:00:00.000Z',
      '2022-03-11T06:30:00.000Z',
      '2022-03-11T07:00:00.000Z',
      '2022-03-11T07:30:00.000Z',
      '2022-03-11T08:00:00.000Z',
    ];
    let res = generate(data);
    expect(res.length).toBe(result.length);
    for (let i = 0; i < res.length; i++)
      expect(moment(res[i]).toDate()).toEqual(moment(result[i]).toDate());
  });

  it('Should generate one hour slots', () => {
    let data = {
      startDateTime: '2022-03-12T05:30:00.000Z',
      endDateTime: '2022-03-18T07:30:00.000Z',
      step: 1,
      period: 'h',
      days: [6, 1, 3],
      gap: 0,
    };
    let result = [
      '2022-03-12T05:30:00.000Z',
      '2022-03-12T06:30:00.000Z',
      '2022-03-14T05:30:00.000Z',
      '2022-03-14T06:30:00.000Z',
      '2022-03-16T05:30:00.000Z',
      '2022-03-16T06:30:00.000Z',
    ];
    let res = generate(data);
    expect(res.length).toBe(result.length);
    for (let i = 0; i < res.length; i++)
      expect(moment(res[i]).toDate()).toEqual(moment(result[i]).toDate());
  });
});
