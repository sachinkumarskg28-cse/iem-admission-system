const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      unique: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentType: {
      type: String,
      enum: ['APPLICATION_FEE', 'SEAT_ACCEPTANCE_FEE', 'SEMESTER_FEE'],
      default: 'APPLICATION_FEE',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'NET_BANKING', 'CREDIT_CARD', 'DEBIT_CARD', 'MOCK_SANDBOX'],
      default: 'MOCK_SANDBOX',
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentGatewayResponse: {
      type: Object,
      default: {},
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-IEM-${Date.now()}`;
  }
  if (!this.receiptNumber) {
    this.receiptNumber = `RCP-IEM-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
