/* eslint-disable no-undef */
const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/social-media')
  .then(() => [console.log('Connection Success')])
  .catch((err) => {
    console.error(err);
  });
require('../models/User');
require('../models/Post');

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

process.on('SIGINT', () => {
  mongoose.connection.emit('disconnected');
  process.exit(0);
});
