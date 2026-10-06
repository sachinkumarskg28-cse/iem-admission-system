const express = require('express');
const router = express.Router();
const {
  submitContactInquiry,
  getFaqs,
  createTicket,
  getTickets,
  updateTicket,
  getInquiries,
} = require('../controllers/helpdeskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.post('/contact', submitContactInquiry);
router.get('/faqs', getFaqs);

// Protected routes (tickets)
router.use(protect);
router.post('/tickets', authorize('student', 'admin', 'super_admin', 'officer'), createTicket);
router.get('/tickets', getTickets);
router.put('/tickets/:id', updateTicket);
router.get('/inquiries', authorize('admin', 'super_admin', 'officer'), getInquiries);

module.exports = router;
