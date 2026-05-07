const pdfLibrary = require('pdf-parse');
// Bulletproof check: If it's an object, grab the default or pdfParse property.
const parsePdf = typeof pdfLibrary === 'function' ? pdfLibrary : (pdfLibrary.default || pdfLibrary.pdfParse);

const extractText = async (fileBuffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await parsePdf(fileBuffer);
      return data.text;
    } else if (mimetype.startsWith('image/')) {
      throw new Error('Image upload is temporarily disabled until Google Cloud is configured.');
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Extraction Error Details:', error);
    throw new Error('Failed to extract text from file');
  }
};

module.exports = extractText;