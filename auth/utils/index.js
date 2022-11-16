/* eslint-disable no-undef */
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h', audience: String(user._id) },
      (err, token) => {
        if (err) {
          reject(createHttpError.InternalServerError());
        }

        resolve(token);
      }
    );
  });
};

const generateRefreshToken = (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '7d',
      },
      (err, token) => {
        if (err) {
          reject(createHttpError.InternalServerError());
        }

        resolve(token);
      }
    );
  });
};

const sendRefreshToken = (res, token) => {
  res.cookie('rtk', token, {
    httpOnly: true,
  });
};

const verifyRefreshToken = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
      if (err) {
        return reject(createHttpError.Unauthorized('Token Expired'));
      }
      return resolve(payload);
    });
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshToken,
  verifyRefreshToken,
};
