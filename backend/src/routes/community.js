const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPost,
  getPosts,
  likePost,
  addComment,
} = require('../controllers/communityController');

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.post('/:postId/like', protect, likePost);
router.post('/:postId/comments', protect, addComment);

module.exports = router;