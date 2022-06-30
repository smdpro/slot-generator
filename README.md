# slot-generator
Generating time slots between a time range 

[![npm version](https://badge.fury.io/js/slot-generator.svg)](https://badge.fury.io/js/slot-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### 🛠 Tutorials



### Install

```bash
npm install slot-generator --save
```
or

```bash
yarn add slot-generator
```


---
#### Basic Usage

```javascript
const generator = require('slot-generator');

let parm = {
      start: '2022-03-12T05:30:00.000Z',
      end: '2022-03-18T07:30:00.000Z',
      step: 1,
      period: 'h',
      daysInWeek: [6, 1, 3],
      gap: 0,
    };
let slots= generator(parm);
console.log(slots);

// output  [
//       '2022-03-12T05:30:00.000Z',
//       '2022-03-12T06:30:00.000Z',
//       '2022-03-14T05:30:00.000Z',
//       '2022-03-14T06:30:00.000Z',
//       '2022-03-16T05:30:00.000Z',
//       '2022-03-16T06:30:00.000Z',
// ];

```

---


### Object Param


| Key                   |   Type    |     Value      |      Default      | 
| :------------------------ | :-------------: | :-------------: | :-------------: | 
| start                   |      string/Date/moment      |      '2022-03-12T05:30:00.000Z'      |       moment()      |
| end                   |      string/Date/moment      |      '2022-03-18T07:30:00.000Z'      |       moment()      | 
| step               |        number        |         5        |        5        |   |       |          |        |
| period          |        string        |       'm'/'h'/'d'          |       'm'          |                 |       |          |        |
| daysInWeek             |        Array[number]        |          [6,1,3]        |        [1,2,3,4,5,6,7]       
| gap |        number        |        0        |         0        |       

## Contributing

Contributions are welcome. Please submit PRs or just file an Issue if you see something broken or in need of improving.