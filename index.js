'use strict';

const { send } = require('micro');

function sendError (request, response, error, options) {
  const { statusCode = 500, message = 'Internal Server Error' } = error;
  const { httpStatusCode, onError } = options;

  if (onError) {
    onError(error);
  }

  send(response, httpStatusCode || statusCode, {
    statusCode,
    message
  });
}

module.exports = function (handleRequest, options = {}) {
  if (!handleRequest || typeof handleRequest !== 'function') {
    throw new Error('Please supply a callback to micro-json-error.');
  }

  return async function (request, response) {
    try {
      await handleRequest(request, response);
    } catch (error) {
      sendError(request, response, error, options);
    }
  };
};
