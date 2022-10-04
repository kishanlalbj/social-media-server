const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const verifyJWT = require('./middlewares/verifyJWT');

const authRouter = require('./auth/');
const postRouter = require('./routes/posts');
const profileRouter = require('./routes/profile');
const userRouter = require('./routes/user');

const createHttpError = require('http-errors');

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 4000;

const app = express();
require('./db');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/posts', verifyJWT, postRouter);
app.use('/api/profile', profileRouter);
app.use('/api/users', verifyJWT, userRouter);

app.use('*', (req, res, next) => {
  next(createHttpError.NotFound());
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log('Server Running on pot ', PORT);
});
