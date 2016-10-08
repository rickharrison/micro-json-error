'use strict';

const test = require('ava');
const micro = require('micro');
const { createError, send } = micro;
const request = require('request-promise');

const jsonError = require('../');

const listen = function (fn) {
  const server = micro(jsonError(fn));

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
