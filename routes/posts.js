const router = require('express').Router();
const createHttpError = require('http-errors');
const Post = require('../models/Post');
const User = require('../models/User');

router.get('/', async (req, res, next) => {
  try {
    const { following } = await User.findById(req.payload.user)
      .select({ following: 1 })
      .lean();

    const posts = await Post.find({
      $or: [
        { postedBy: req.payload.user },
        { postedBy: { $in: [...following] } },
      ],
    })
      .populate('postedBy')
      .exec();

    res.send(posts);
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const posts = await Post.find({ postedBy: id }).populate('postedBy');

    res.send(posts);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) throw createHttpError.BadRequest('Must have text');

    const post = new Post({
      text,
      postedBy: req.payload.user,
    });

    const saved = await (await post.save()).populate('postedBy');
    res.send(saved);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) throw createHttpError.BadGateway('Expecting a ID');

    let post = await Post.findById(id).populate('postedBy');
    if (post.postedBy._id.toString() !== req.payload.user)
      throw createHttpError.Forbidden('You can only delete your posts');

    if (!post) throw createHttpError.NotFound(`Post with id ${id} not found`);

    const result = await Post.deleteOne({ _id: id }).exec();
    if (!result.acknowledged) throw createHttpError.InternalServerError();
    res.send({ id });
  } catch (error) {
    next(error);
  }
});

router.post('/like/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).lean();

    let newPost;

    if (!post) throw createHttpError.NotFound();
    const stringIdSet = post.likes.map((id) => id.toString());

    if (stringIdSet.includes(req.payload.user)) {
      newPost = await Post.findByIdAndUpdate(
        id,
        {
          $pull: { likes: req.payload.user },
        },
        { new: 1 }
      ).populate('likes');

      return res.send(newPost);
    }

    newPost = await Post.findByIdAndUpdate(
      id,
      {
        $push: { likes: req.payload.user },
      },
      { new: 1 }
    ).populate('likes');
    res.send(newPost);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
