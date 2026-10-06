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
  getDatabaseCollections,
  getDatabaseRecords,
  createDatabaseRecord,
  updateDatabaseRecord,
  deleteDatabaseRecord,
  exportDatabaseRecords,
  getAccountsSummary,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Financial summary accessible to accounts & admins
router.get('/accounts-summary', authorize('admin', 'super_admin', 'accounts'), getAccountsSummary);

// Admin / Super Admin routes
router.use(authorize('admin', 'super_admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/students', getAllStudents);
router.put('/students/:userId/toggle-status', toggleUserStatus);
router.get('/officers', getAllOfficers);
router.post('/officers', createOfficer);
router.get('/admission-cycles', getAdmissionCycles);
router.post('/admission-cycles', createOrUpdateCycle);
router.get('/audit-logs', getAuditLogs);

// Database Access Panel CRUD & Export
router.get('/database/collections', getDatabaseCollections);
router.get('/database/:collection', getDatabaseRecords);
router.post('/database/:collection', createDatabaseRecord);
router.put('/database/:collection/:id', updateDatabaseRecord);
router.delete('/database/:collection/:id', deleteDatabaseRecord);
router.get('/database/:collection/export', exportDatabaseRecords);

module.exports = router;
