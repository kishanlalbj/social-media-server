const router = require('express').Router();
const createHttpError = require('http-errors');
const Post = require('../models/Post');
const User = require('../models/User');

router.get('/', async (req, res, next) => {
  try {
    const { following } = await User.findById(req.payload.id)
      .select({ following: 1 })
      .lean();

    const posts = await Post.find({
      $or: [
        { postedBy: req.payload.id },
        { postedBy: { $in: [...following] } },
      ],
    })
      .populate('postedBy')
      .populate('comment.user')
      .sort({ createdAt: -1 })
      .exec();

    res.send(posts);
  } catch (error) {
    next(error);
  }
});

router.get('/user/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const posts = await Post.find({ postedBy: id })
      .populate('postedBy')
      .populate('comment.user')
      .sort({ createdAt: -1 });

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
      postedBy: req.payload.id,
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
    if (post.postedBy._id.toString() !== req.payload.id)
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

    if (stringIdSet.includes(req.payload.id)) {
      newPost = await Post.findByIdAndUpdate(
        id,
        {
          $pull: { likes: req.payload.id },
        },
        { new: 1 }
      ).populate('likes');

      return res.send(newPost);
    }

    newPost = await Post.findByIdAndUpdate(
      id,
      {
        $push: { likes: req.payload.id },
      },
      { new: 1 }
    );
    res.send(newPost);
  } catch (error) {
    next(error);
  }
});

router.post('/comment/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const { user } = req.payload;

    const post = await Post.findById(id).lean();

    if (!post) throw createHttpError.NotFound('Post not found');

    const updatePost = await Post.findByIdAndUpdate(
      id,
      {
        $push: { comment: { user, text } },
      },
      { new: 1 }
    );

    res.send(updatePost);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
