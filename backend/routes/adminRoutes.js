const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllStudents,
  toggleUserStatus,
  getAllOfficers,
  createOfficer,
  getAdmissionCycles,
  createOrUpdateCycle,
  getAuditLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/students', getAllStudents);
router.put('/students/:userId/toggle-status', toggleUserStatus);
router.get('/officers', getAllOfficers);
router.post('/officers', createOfficer);
router.get('/admission-cycles', getAdmissionCycles);
router.post('/admission-cycles', createOrUpdateCycle);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
