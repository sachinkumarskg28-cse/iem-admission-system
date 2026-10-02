const express = require('express');
const router = express.Router();
const {
  getApplications,
  verifyDocument,
  updateApplicationStatus,
  generateApplicantReport,
} = require('../controllers/officerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('officer', 'admin'));

router.get('/applications', getApplications);
router.put('/documents/:id/verify', verifyDocument);
router.put('/applications/:id/status', updateApplicationStatus);
router.get('/reports', generateApplicantReport);

module.exports = router;
