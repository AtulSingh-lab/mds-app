const cloudinary = require('../config/cloudinary');
const processDocumentWithGemini = require('../utils/geminiHelper');
const Document = require('../models/Document');
const User = require('../models/User');
const QASession = require('../models/QASession');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Upload and process a new document using Gemini AI
const uploadDocument = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check and reset monthly quota if needed
    user.checkAndResetQuota();
    await user.save();

    if (user.quota.remaining <= 0) {
      return res.status(403).json({ message: 'Monthly document limit reached. Upgrade to Pro.' });
    }

    const { targetLanguage, docType, rawText } = req.body;
    let fileUrl = 'local-upload-no-url-yet';
    let originalTextSaved = rawText || 'File uploaded directly to Gemini AI';

    if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      fileUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'mds_uploads' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    // Process with Gemini
    const aiResult = await processDocumentWithGemini(rawText, req.file, targetLanguage, docType);

    const document = await Document.create({
      userId: req.user._id,
      originalText: originalTextSaved,
      simplifiedText: aiResult.simplifiedText,
      inputLanguage: aiResult.detectedLanguage,
      outputLanguage: targetLanguage,
      fileUrl: fileUrl,
      docType: docType,
      flaggedClauses: aiResult.flaggedClauses
    });

    // Decrement user quota
    user.quota.remaining -= 1;
    await user.save();

    res.status(201).json(document);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's document history with pagination and search
const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = { userId: req.user._id };
    
    if (search) {
      query.$or = [
        { docType: { $regex: search, $options: 'i' } },
        { simplifiedText: { $regex: search, $options: 'i' } }
      ];
    }
    
    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await Document.countDocuments(query);
    
    res.status(200).json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat history for a specific document
const getChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    // Verify document belongs to user
    const document = await Document.findOne({ _id: id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const session = await QASession.findOne({ documentId: id, userId: req.user._id });
    res.status(200).json({ messages: session ? session.messages : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Post a chat message and get AI response (Gemini)
const postChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // Verify document exists and belongs to user
    const document = await Document.findOne({ _id: id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Find or create QA session
    let session = await QASession.findOne({ documentId: id, userId: req.user._id });
    if (!session) {
      session = await QASession.create({
        documentId: id,
        userId: req.user._id,
        messages: []
      });
    }
    
    // Add user message
    session.messages.push({ role: 'user', content: message });
    
    // Call Gemini for AI response
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }); // Use appropriate model
    const prompt = `
      You are an AI assistant helping a user understand a document.
      Document Context:
      """${document.simplifiedText}"""
      
      User Question: "${message}"
      
      Answer the question based ONLY on the provided document context in the user's preferred language (${document.outputLanguage}). Be concise and helpful.
    `;
    
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    // Add AI response
    session.messages.push({ role: 'ai', content: aiResponse });
    await session.save();
    
    res.status(200).json({ messages: session.messages });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a document and its associated QA session
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findOne({ _id: id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    // Delete document
    await document.deleteOne();
    // Delete associated QASession
    await QASession.deleteOne({ documentId: id, userId: req.user._id });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getHistory,
  getChatHistory,
  postChat,
  deleteDocument
};