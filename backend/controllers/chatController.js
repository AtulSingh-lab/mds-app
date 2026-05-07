const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');
const QASession = require('../models/QASession');

const chatWithDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { message } = req.body;

    // 1. Fetch document
    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    // 2. Fetch or create QA Session
    let session = await QASession.findOne({ documentId, userId: req.user._id });
    if (!session) {
      session = await QASession.create({ documentId, userId: req.user._id, messages:[] });
    }

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

    // 4. Create prompt with document context
    const prompt = `
      You are an AI assistant helping a user understand a document.
      Document Context:
      """${document.simplifiedText}"""
      
      User Question: "${message}"
      
      Answer the question based ONLY on the provided document context in the user's preferred language (${document.outputLanguage}). Be concise and helpful.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // 5. Save messages to DB
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'ai', content: aiResponse });
    await session.save();

    res.status(200).json({ aiResponse, messages: session.messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const session = await QASession.findOne({ documentId: req.params.documentId, userId: req.user._id });
    res.status(200).json(session ? session.messages :[]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update your module.exports:
module.exports = { chatWithDocument, getChatHistory };