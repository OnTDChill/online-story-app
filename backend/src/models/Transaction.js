const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'purchase', 'sale'], required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  currency: { type: String, enum: ['diamonds', 'rubies', 'cash'], required: true },
  relatedStory: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  relatedChapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
}, { timestamps: true });

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);