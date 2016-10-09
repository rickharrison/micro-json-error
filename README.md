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

### API

```
jsonError(fn, { httpStatusCode = null, onError = null });
```

- `httpStatusCode` - Overrides the `statusCode` from the error for the http response status code. Useful if you always want to return a 200, and show the original `statusCode` in the JSON body.
- `onError` - Callback function that will be passed the `error`. Useful for logging.
