const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const socketServer = require('./socket');
require('dotenv').config();
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
app.use(cors());

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
  console.log('Server Running on pot ', PORT);
});
