const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); // Fixed path
const upload = require('../middlewares/uploadMiddleware'); // Fixed path (check if file name is uploadMiddleware.js)

router.post('/upload', ensureAuthenticated, upload.single('file'), documentController.uploadDocument);
router.get('/history', ensureAuthenticated, documentController.getHistory);
router.get('/:id/chat', ensureAuthenticated, documentController.getChatHistory);
router.post('/:id/chat', ensureAuthenticated, documentController.postChat);
router.delete('/:id', ensureAuthenticated, documentController.deleteDocument);

module.exports = router;