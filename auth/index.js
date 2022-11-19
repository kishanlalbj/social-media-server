/* eslint-disable no-undef */
const createHttpError = require('http-errors');
const router = require('express').Router();
const User = require('../models/User');
const verifyJWT = require('../middlewares/verifyJWT');
const {
  generateAccessToken,
  generateRefreshToken,
  sendRefreshToken,
  verifyRefreshToken,
} = require('./utils');

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password || !firstName || !lastName)
      throw createHttpError(400).message('Please provide all details');

    const user = await User.findOne({ email });

    if (user) throw createHttpError.Conflict('Email already registered');

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });

    const savedUser = await newUser.save();

    res.send(savedUser);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw createHttpError.BadRequest('All fields are necessary');

    const user = await User.findOne({ email });

    if (!user) {
      throw createHttpError.Conflict(`${email} not found`);
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      throw createHttpError.Unauthorized();
    }

    // jwt.sign(
    //   {
    //     id: user._id,
    //     email: user.email,
    //     name: `${user.firstName} ${user.lastName}`,
    //   },
    //   process.env.JWT_SECRET,
    //   {
    //     expiresIn: '1h',
    //   },
    //   (err, token) => {
    //     if (err) throw createHttpError.InternalServerError();
    //     res.send({ token });
    //   }
    // );

    const token = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    sendRefreshToken(res, refreshToken);

    res.send({ token });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const token = req.cookies.rtk;
    if (!token) {
      throw createHttpError.Unauthorized('No Cookie');
    }

    const user = await verifyRefreshToken(token);

    if (!user) {
      throw createHttpError.Unauthorized('Token Expired');
    }

    const accessToken = await generateAccessToken(user);
    res.send({ token: accessToken });
  } catch (error) {
    next(error);
  }
});

router.get('/me', verifyJWT, async (req, res, next) => {
  try {
    const header = req.headers['authorization'];
    if (!header) throw createHttpError.Unauthorized();

    res.send(req.payload);
  } catch (error) {
    next(error);
  }
});

router.delete('/logout', verifyJWT, async (req, res, next) => {
  try {
    res.clearCookie('rtk');

    res.send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
