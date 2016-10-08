'use strict';

const { send } = require('micro');

function sendError (request, response, { statusCode = 500, message = 'Internal Server Error', stack }) {
  send(response, statusCode, {
    statusCode,
    message
  });
}

module.exports = function (handleRequest) {
  if (!handleRequest || typeof handleRequest !== 'function') {
    throw new Error('Please supply a callback to micro-json-error.');
  }

  return async function (request, response) {
    try {
      await handleRequest(request, response);
    } catch (error) {
      sendError(request, response, error);
    }
  };
};
