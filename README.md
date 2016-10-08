# micro-json-error

Wraps your [micro](https://github.com/zeit/micro) service function to catch errors and display them as JSON.

### Installation

```
npm install micro-json-error --save
```

### Usage

```javascript
const { createError } = require('micro');
const jsonError = require('micro-json-error');

module.exports = jsonError(async function (req, res) {
  throw createError(400, 'Invalid data');
});
```
