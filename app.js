/* eslint-disable no-undef */
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const cookieParser = require('cookie-parser');
const socketServer = require('./socket');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: `./.env.${process.env.NODE_ENV}`,
  });
}
const verifyJWT = require('./middlewares/verifyJWT');

const authRouter = require('./auth/');
const postRouter = require('./routes/posts');
const profileRouter = require('./routes/profile');
const userRouter = require('./routes/user');
const notifyRouter = require('./routes/notification');

const createHttpError = require('http-errors');
const { Server } = require('socket.io');

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  socketServer(socket);
});

require('./db');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(
  helmet({
    cors: process.env.WEB_URL,
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.WEB_URL,
    credentials: true,
  })
);

app.use('/api/auth', authRouter);
app.use('/api/posts', verifyJWT, postRouter);
app.use('/api/profile', profileRouter);
app.use('/api/users', verifyJWT, userRouter);
app.use('/api/notify', verifyJWT, notifyRouter);

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

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server Running on pot ', PORT);
});
