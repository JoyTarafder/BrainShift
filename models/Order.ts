import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  studentId: mongoose.Types.ObjectId | string;
  courseId: mongoose.Types.ObjectId | string;
  batchId?: mongoose.Types.ObjectId | string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  senderNumber?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
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

// Delete model from cache to force Mongoose schema re-compilation with new fields in dev HMR
if (mongoose.models && mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
