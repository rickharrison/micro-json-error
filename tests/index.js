'use strict';

const test = require('ava');
const micro = require('micro');
const { createError, send } = micro;
const request = require('request-promise');

const jsonError = require('../');

const listen = function (fn, options) {
  const server = micro(jsonError(fn, options));

  return new Promise(function (resolve, reject) {
    server.listen(function (err) {
      if (err) {
        return reject(err);
      }

      const { port } = server.address();

      return resolve(`http://localhost:${port}`);
    });
  });
};

test('throws when not passed a callback', (t) => {
  t.throws(() => {
    jsonError();
  });

  t.throws(() => {
    jsonError('foobar');
  });
});

test('should pass through requests', async (t) => {
  const fn = async (req, res) => {
    send(res, 201, {
      foo: 'bar'
    });
  };

  const url = await listen(fn);
  const response = await request(url, {
    json: true,
    resolveWithFullResponse: true
  });

  t.is(response.statusCode, 201);
  t.deepEqual(response.body, {
    foo: 'bar'
  });
});

test('should pass through async requests', async (t) => {
  const fn = async (req, res) => {
    await new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, 100);
    });

    send(res, 201, {
      foo: 'bar'
    });
  };

  const url = await listen(fn);
  const response = await request(url, {
    json: true,
    resolveWithFullResponse: true
  });

  t.is(response.statusCode, 201);
  t.deepEqual(response.body, {
    foo: 'bar'
  });
});

test('should display errors as json', async (t) => {
  const fn = async () => {
    throw createError(400, 'Invalid data');
  };

  const url = await listen(fn);
  const response = await request(url, {
    json: true,
    resolveWithFullResponse: true,
    simple: false
  });

  t.is(response.statusCode, 400);
  t.deepEqual(response.body, {
    statusCode: 400,
    message: 'Invalid data'
  });
});

test('should display unknown errors as 500', async (t) => {
  const fn = () => {
    throw new Error('foo bar error');
  };

  const url = await listen(fn);
  const response = await request(url, {
    json: true,
    resolveWithFullResponse: true,
    simple: false
  });

  t.is(response.statusCode, 500);
  t.deepEqual(response.body, {
    statusCode: 500,
    message: 'foo bar error'
  });
});

test('should display unknown messages as 500', async (t) => {
  const fn = () => {
    /* eslint no-throw-literal: 0 */

    throw 'foobar';
  };

  const url = await listen(fn);
  const response = await request(url, {
    json: true,
    resolveWithFullResponse: true,
    simple: false
  });

  t.is(response.statusCode, 500);
  t.deepEqual(response.body, {
    statusCode: 500,
    message: 'Internal Server Error'
  });
});

test('should use httpStatusCode override', async (t) => {
  const fn = () => {
    throw createError(404, 'Resource not found');
  };

  const url = await listen(fn, { httpStatusCode: 201 });
  const response = await request(url, {
    json: true,
    resolveWithFullResponse: true,
    simple: false
  });

  t.is(response.statusCode, 201);
  t.deepEqual(response.body, {
    statusCode: 404,
    message: 'Resource not found'
  });
});

test('should call the error callback', async (t) => {
  t.plan(4);

  const fn = () => {
    throw createError(405, 'Method not allowed');
  };

  const onError = ({ statusCode, message }) => {
    t.is(statusCode, 405);
    t.is(message, 'Method not allowed');
  };

  const url = await listen(fn, { httpStatusCode: 201, onError });
  const response = await request(url, {
    json: true,
    resolveWithFullResponse: true,
    simple: false
  });

  t.is(response.statusCode, 201);
  t.deepEqual(response.body, {
    statusCode: 405,
    message: 'Method not allowed'
  });
});
