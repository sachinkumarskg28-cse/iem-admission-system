const express = require('express');
const router = express.Router();
const {
  createOrUpdateDraft,
  submitApplication,
  getMyApplications,
  getApplicationById,
  downloadApplicationPDF,
  trackStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public tracking
router.get('/track/:applicationNumber', trackStatus);

// Authenticated application endpoints
router.use(protect);

router.post('/draft', authorize('student'), createOrUpdateDraft);
router.post('/:id/submit', authorize('student'), submitApplication);
router.get('/my', authorize('student'), getMyApplications);
router.get('/:id', getApplicationById);
router.get('/:id/download-pdf', downloadApplicationPDF);

module.exports = router;
