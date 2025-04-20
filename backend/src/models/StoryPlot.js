const mongoose = require('mongoose');

const storyPlotSchema = new mongoose.Schema({
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  plotPoints: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true },
    status: { type: String, enum: ['planned', 'in-progress', 'completed'], default: 'planned' }
  }],
  mainCharacters: [{
    name: { type: String, required: true },
    description: { type: String },
    role: { type: String }
  }],
  settings: [{
    name: { type: String, required: true },
    description: { type: String }
  }],
  themes: [{ type: String }],
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StoryPlot', storyPlotSchema);