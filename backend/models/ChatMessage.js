const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
    ref: 'User',
    required: true 
  },
  content: { type: String, required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  createdAt: { type: Date, default: Date.now },
  isAI: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who deleted this message
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
