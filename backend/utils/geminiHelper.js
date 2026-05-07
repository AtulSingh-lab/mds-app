const { GoogleGenerativeAI } = require('@google/generative-ai');

const processDocumentWithGemini = async (text, file, targetLanguage, docType) => {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing!");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Using gemini-1.5-pro as it has excellent native PDF support
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' }); 

  const promptText = `
    You are an expert multilingual document simplifier.
    Analyze the provided ${docType} document.
    
    Tasks:
    1. Detect the original language.
    2. Simplify the complex text into plain, easy-to-understand language.
    3. Translate the simplified text into ${targetLanguage}.
    4. Flag any risky, important, or confusing clauses.
    
    Return the result STRICTLY as a JSON object with NO markdown formatting and NO backticks.
    Use exactly this structure:
    {
      "detectedLanguage": "string",
      "simplifiedText": "string",
      "flaggedClauses":[
        {
          "originalClause": "string",
          "simplifiedExplanation": "string",
          "riskLevel": "high"
        }
      ]
    }
  `;

  let parts = [promptText];

  // Pass the raw file directly to Gemini! No pdf-parse needed!
  if (file && file.buffer) {
    parts.push({
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype
      }
    });
  } else if (text) {
    parts.push(`\nDocument Text:\n"""${text.substring(0, 30000)}"""`);
  } else {
    throw new Error("No document content provided.");
  }

  try {
    const result = await model.generateContent(parts);
    let responseText = result.response.text();
    
    // Clean up JSON
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) responseText = responseText.substring(startIdx, endIdx + 1);

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini AI Error Details:', error);
    throw new Error('Failed to process document with AI.');
  }
};

module.exports = processDocumentWithGemini;