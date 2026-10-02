const express = require('express');
const router = express.Router();
const {
  initializePayment,
  confirmMockPayment,
  getReceipt,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/initialize', authorize('student'), initializePayment);
router.post('/confirm', authorize('student'), confirmMockPayment);
router.get('/receipt/:receiptNumber', getReceipt);

module.exports = router;
