import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaFilter, FaHeart, FaComment, FaUserCircle, FaTag } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const CommunityBillboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    tags: [],
    location: '',
    isEmergency: false
  });
  const [filterTag, setFilterTag] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const tags = ['Blood', 'Disaster', 'Lost Child', 'Accident', 'Safety', 'General'];

  useEffect(() => {
    fetchPosts();
  }, [filterTag]);

  const fetchPosts = async () => {
    try {
      const url = filterTag 
        ? `${process.env.REACT_APP_API_URL}/community?tag=${filterTag.toLowerCase()}`
        : `${process.env.REACT_APP_API_URL}/community`;
      const { data } = await axios.get(url);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

const createPost = async () => {
    if (!newPost.content.trim()) {
      toast.error('Please write something');
      return;
    }

    try {
      // Map display tags to model enum values
      const tagMap = {
        'blood': 'blood',
        'disaster': 'disaster',
        'lost child': 'lost-child',
        'accident': 'accident',
        'safety': 'safety',
        'general': 'general',
      };
      const mappedTags = newPost.tags.map(t => tagMap[t.toLowerCase()] || t.toLowerCase());

      await axios.post(`${process.env.REACT_APP_API_URL}/community`, {
        ...newPost,
        tags: mappedTags
      });
      toast.success('Post created successfully!');
      setNewPost({ content: '', tags: [], location: '', isEmergency: false });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const likePost = async (postId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/community/${postId}/like`);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const toggleTag = (tag) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-purple-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Community Billboard</h1>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FaFilter />
                <span>Filter</span>
              </button>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-sos-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>Create Post</span>
              </button>
            </div>
          </div>

          {/* Filter */}
          {showFilter && (
            <div className="bg-white/5 rounded-xl p-4 mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setFilterTag('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterTag === '' ? 'bg-sos-red text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filterTag === tag ? 'bg-sos-red text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-start space-x-3">
                  <FaUserCircle className="text-4xl text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium">{post.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">ID: {post.userId?.userId}</p>
                      <p className="text-xs text-gray-500">• {new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-gray-300 mt-2">{post.content}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags?.map((tag) => (
                        <span key={tag} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 mt-3">
                      <button
                        onClick={() => likePost(post._id)}
                        className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaHeart />
                        <span className="text-sm">{post.likes?.length || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-500 transition-colors">
                        <FaComment />
                        <span className="text-sm">{post.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <p className="text-gray-400 text-center py-8">No posts yet. Be the first to share!</p>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-sos-gray rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create New Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's happening in your community?"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors min-h-[120px]"
              />

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tags (select multiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        newPost.tags.includes(tag)
                          ? 'bg-sos-red text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={newPost.location}
                  onChange={(e) => setNewPost({ ...newPost, location: e.target.value })}
                  placeholder="e.g., Dhaka, Bangladesh"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newPost.isEmergency}
                  onChange={(e) => setNewPost({ ...newPost, isEmergency: e.target.checked })}
                  className="w-4 h-4 text-sos-red"
                />
                <label className="text-gray-300 text-sm">Mark as Emergency</label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={createPost}
                  className="flex-1 bg-sos-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Publish Post
                </button>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityBillboard;