import React, { useState } from 'react';
import { FaTimes, FaTag, FaMapMarkerAlt, FaExclamationTriangle, FaImage } from 'react-icons/fa';
import { communityAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const CreatePost = ({ isOpen, onClose, onPostCreated }) => {
  const [postData, setPostData] = useState({
    content: '',
    tags: [],
    location: '',
    isEmergency: false,
  });
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const availableTags = [
    'Blood', 'Disaster', 'Lost Child', 'Accident', 'Safety', 'General', 
    'Medical', 'Fire', 'Flood', 'Earthquake', 'Crime', 'Missing Person'
  ];

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setPostData(prev => ({
      ...prev,
      tags: selectedTags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postData.content.trim()) {
      toast.error('Please write something');
      return;
    }

    setLoading(true);
    try {
      const response = await communityAPI.createPost({
        ...postData,
        tags: selectedTags,
      });
      toast.success('Post published successfully! 📢');
      setPostData({ content: '', tags: [], location: '', isEmergency: false });
      setSelectedTags([]);
      if (onPostCreated) onPostCreated();
      onClose();
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-sos-gray rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Create New Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              What's happening?
            </label>
            <textarea
              value={postData.content}
              onChange={(e) => setPostData({ ...postData, content: e.target.value })}
              placeholder="Share updates, requests, or information with the community..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors min-h-[120px]"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <FaTag className="inline mr-2" />
              Tags (select multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-sos-red text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Location (Optional)
            </label>
            <input
              type="text"
              value={postData.location}
              onChange={(e) => setPostData({ ...postData, location: e.target.value })}
              placeholder="e.g., Dhaka, Bangladesh"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
            />
          </div>

          {/* Emergency Flag */}
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <input
              type="checkbox"
              id="isEmergency"
              checked={postData.isEmergency}
              onChange={(e) => setPostData({ ...postData, isEmergency: e.target.checked })}
              className="w-5 h-5 text-sos-red rounded border-white/20 bg-white/10 focus:ring-sos-red focus:ring-2"
            />
            <label htmlFor="isEmergency" className="text-gray-300 flex items-center space-x-2">
              <FaExclamationTriangle className="text-yellow-500" />
              <span>Mark as Emergency (This will alert nearby users)</span>
            </label>
          </div>

          {/* Image Upload (Placeholder) */}
          <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center">
            <FaImage className="text-3xl text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Add images or attachments</p>
            <p className="text-gray-500 text-xs">Click to upload (Coming soon)</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sos-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;