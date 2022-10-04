/* eslint-disable no-undef */
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
  try {
    const header = req.headers['authorization'];
    if (!header) throw createHttpError.Unauthorized('You must login');
    const token = header.split(' ')[1];

    if (!token) throw createHttpError.Unauthorized('You must login');

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        if (err.name === 'JsonWebTokenError')
          return next(createHttpError.Unauthorized());

        return next(createHttpError.Unauthorized(err.message));
      }

      req.payload = payload;
      next();
    });
  } catch (error) {
    next(error);
  }
}

module.exports = verifyJWT;
