const CommunityPost = require('../models/CommunityPost');

exports.createPost = async (req, res) => {
  try {
    const { content, tags, location, isEmergency = false } = req.body;

    const post = new CommunityPost({
      userId: req.user._id,
      content,
      tags,
      location,
      isEmergency,
    });

    await post.save();

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { tag, limit = 20 } = req.query;

    const filter = {};
    if (tag) {
      filter.tags = tag;
    }

    const posts = await CommunityPost.find(filter)
      .populate('userId', 'name userId')
      .populate('likes', 'name')
      .populate('comments.userId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasLiked = post.likes.includes(req.user._id);
    if (hasLiked) {
      post.likes = post.likes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: hasLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      userId: req.user._id,
      content,
    });

    await post.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};