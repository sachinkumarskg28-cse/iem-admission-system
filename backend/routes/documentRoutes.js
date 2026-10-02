const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/upload', authorize('student'), upload.single('file'), uploadDocument);
router.get('/my', authorize('student'), getMyDocuments);
router.delete('/:id', authorize('student'), deleteDocument);

module.exports = router;
