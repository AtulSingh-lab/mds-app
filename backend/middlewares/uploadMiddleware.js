const multer = require('multer');

// Store file in memory to easily pass to Gemini/OCR without saving to disk first
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs and Images are allowed'), false);
    }
  }
});

module.exports = upload;