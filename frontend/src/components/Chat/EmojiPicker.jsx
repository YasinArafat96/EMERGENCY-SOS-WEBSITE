import React, { useState } from 'react';

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    label: '😊',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗',
      '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝',
      '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
      '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥',
      '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    ],
  },
  {
    id: 'gestures',
    label: '👋',
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌',
      '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘',
      '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️',
      '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾',
    ],
  },
  {
    id: 'hearts',
    label: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '♥️', '😻', '💑', '💏', '👩‍❤️‍👨',
    ],
  },
  {
    id: 'objects',
    label: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '🔥',
      '⭐', '🌟', '✨', '💫', '🌈', '☀️', '🌙', '⚡',
      '💯', '✅', '❌', '⚠️', '🚨', '📱', '💻', '📞',
      '📷', '🎵', '🎶', '🔔', '💡', '🔑', '🛡️', '🚑',
    ],
  },
  {
    id: 'animals',
    label: '🐶',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
      '🐧', '🐦', '🦅', '🦆', '🦋', '🐛', '🐝', '🐞',
    ],
  },
  {
    id: 'food',
    label: '🍕',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
      '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🎂',
      '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷',
    ],
  },
];

const EmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');

  const currentCategory = EMOJI_CATEGORIES.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="absolute bottom-full left-0 mb-2 w-72 bg-sos-gray border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex border-b border-white/10 overflow-x-auto">
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-2 text-lg transition-colors ${
              activeCategory === cat.id
                ? 'bg-white/10 border-b-2 border-sos-red'
                : 'hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-0.5 p-2 max-h-48 overflow-y-auto">
        {currentCategory?.emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="text-xl p-1.5 rounded hover:bg-white/10 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="border-t border-white/10 px-3 py-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">Tap to insert</span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EmojiPicker;
