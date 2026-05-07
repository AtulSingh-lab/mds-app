const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalText: { type: String, required: true },
  simplifiedText: { type: String, required: true },
  inputLanguage: { type: String, required: true },
  outputLanguage: { type: String, required: true },
  fileUrl: { type: String }, // Cloudinary URL, optional if pasted raw text
  docType: { 
    type: String, 
    enum:['legal', 'medical', 'government', 'general'],
    required: true
  },
  flaggedClauses:[{
    originalClause: String,
    simplifiedExplanation: String,
    riskLevel: String // e.g., 'high', 'medium'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);