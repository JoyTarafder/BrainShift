import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'bKash' },
    senderNumber: { type: String, default: '' },
    transactionId: { type: String, default: '' },
  },
  { timestamps: true, strict: false }
);

if (mongoose.models && mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order = mongoose.model('Order', OrderSchema);

export default Order;
