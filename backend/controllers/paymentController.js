const dataService = require('../services/dataService');
const { recordAudit } = require('../middleware/auditMiddleware');

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private (Student)
exports.initializePayment = async (req, res, next) => {
  try {
    const { applicationId, paymentMethod } = req.body;
    const userId = req.user._id || req.user.id;

    const application = await dataService.getApplicationById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.isFeePaid) {
      return res.status(400).json({ success: false, message: 'Application fee has already been paid.' });
    }

    const amount = 2000;
    const orderId = `ORD-IEM-${Date.now()}`;
    const transactionId = `TXN-IEM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await dataService.createPayment({
      transactionId,
      orderId,
      user: userId,
      student: application.student?._id || application.student,
      application: application._id,
      amount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'UPI',
      status: 'PENDING',
    });

    res.status(200).json({
      success: true,
      order: {
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        courseName: application.course?.name || 'Academic Degree Program',
        applicantName: req.user.name,
        merchantName: 'Institute of Engineering & Management (IEM) Admissions',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm mock payment
// @route   POST /api/payments/confirm
// @access  Private (Student)
exports.confirmMockPayment = async (req, res, next) => {
  try {
    const { transactionId, simulateStatus = 'SUCCESS' } = req.body;
    const userId = req.user._id || req.user.id;

    const payment = await dataService.getPaymentByTxnId(transactionId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (simulateStatus === 'SUCCESS') {
      payment.status = 'SUCCESS';
      payment.paidAt = new Date();

      await dataService.updateApplication(payment.application, {
        isFeePaid: true,
        timelineEntry: {
          status: 'FEE_PAID',
          actorName: req.user.name,
          role: 'student',
          comment: `Application fee of INR ${payment.amount} paid successfully (Receipt: ${payment.receiptNumber}).`,
          timestamp: new Date(),
        },
      });

      await dataService.createNotification({
        recipient: userId,
        title: 'Application Fee Payment Successful',
        message: `Your payment of INR ${payment.amount} is confirmed. Receipt No: ${payment.receiptNumber}.`,
        type: 'SUCCESS',
      });

      await recordAudit(req, {
        action: 'PAYMENT_SUCCESS',
        module: 'PAYMENT',
        details: { transactionId: payment.transactionId, amount: payment.amount, receipt: payment.receiptNumber },
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified and confirmed successfully.',
        payment,
      });
    } else {
      payment.status = 'FAILED';
      return res.status(400).json({
        success: false,
        message: 'Payment was declined or cancelled.',
        payment,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get receipt
// @route   GET /api/payments/receipt/:receiptNumber
// @access  Private
exports.getReceipt = async (req, res, next) => {
  try {
    const payment = await dataService.getPaymentByReceipt(req.params.receiptNumber);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    res.status(200).json({
      success: true,
      receipt: payment,
    });
  } catch (error) {
    next(error);
  }
};
