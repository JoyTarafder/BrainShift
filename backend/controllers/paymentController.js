import Order from '../models/Order.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { SSLCOMMERZ_CONFIG } from '../config/sslcommerz.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const BACKEND_URL = `http://localhost:${process.env.PORT || 5000}`;

// @desc    Submit manual bKash/Nagad/Rocket TrxID and Sender Number (Pending Admin Approval)
// @route   POST /api/payment/verify
export const verifyPayment = async (req, res) => {
  try {
    const { courseId, paymentMethod, senderNumber, transactionId } = req.body;
    const student = req.user;

    if (!courseId || !senderNumber || !transactionId) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, senderNumber, and transactionId' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const cleanTrxId = transactionId.trim().toUpperCase();
    const cleanSenderNumber = senderNumber.trim();
    const studentIdStr = (student.id || student._id).toString();
    const courseIdStr = course._id.toString();

    const order = await Order.findOneAndUpdate(
      {
        $or: [
          { studentId: student.id || student._id, courseId },
          { studentId: studentIdStr, courseId: courseIdStr },
        ],
      },
      {
        $set: {
          studentId: student.id || student._id,
          courseId,
          amount: course.price,
          status: 'pending',
          paymentMethod: paymentMethod || 'bKash',
          senderNumber: cleanSenderNumber,
          transactionId: cleanTrxId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`✅ Direct MongoDB $set Express Order Saved: ID=${order._id}, TrxID=${cleanTrxId}, Sender=${cleanSenderNumber}`);

    res.status(200).json({
      success: true,
      status: 'pending',
      message: 'TrxID submitted successfully! Awaiting admin verification.',
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error verifying payment' });
  }
};

// @desc    Initiate SSLCommerz payment for a course
// @route   POST /api/payment/init
export const initiatePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const student = req.user;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Please provide courseId' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: student.id,
      courseId,
    });

    if (existingEnrollment) {
      return res.status(200).json({
        success: true,
        alreadyEnrolled: true,
        message: 'You are already enrolled in this course',
      });
    }

    // Generate unique transaction ID
    const transactionId = `TN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create pending Order in database
    const order = await Order.create({
      studentId: student.id,
      courseId,
      amount: course.price,
      status: 'pending',
      paymentMethod: 'sslcommerz',
      transactionId,
    });

    // Construct SSLCommerz payload
    const sslData = {
      store_id: SSLCOMMERZ_CONFIG.store_id,
      store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
      total_amount: course.price,
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${BACKEND_URL}/api/payment/success`,
      fail_url: `${BACKEND_URL}/api/payment/fail`,
      cancel_url: `${BACKEND_URL}/api/payment/cancel`,
      ipn_url: `${BACKEND_URL}/api/payment/ipn`,
      cus_name: student.name || 'Student',
      cus_email: student.email || 'student@tutornova.com',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1200',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      shipping_method: 'NO',
      product_name: course.title,
      product_category: 'Education',
      product_profile: 'non-physical-goods',
    };

    // Try posting to SSLCommerz API
    try {
      const response = await fetch(SSLCOMMERZ_CONFIG.init_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(sslData).toString(),
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.GatewayPageURL) {
        return res.status(200).json({
          success: true,
          gatewayUrl: data.GatewayPageURL,
          transactionId,
        });
      }
    } catch (sslErr) {
      console.warn('SSLCommerz Sandbox API offline/unreachable, falling back to local SSLCommerz simulator:', sslErr);
    }

    // Fallback: Sandbox payment simulator URL for local development/testing
    const simulatorUrl = `${BACKEND_URL}/api/payment/simulate-checkout?tran_id=${transactionId}`;

    res.status(200).json({
      success: true,
      gatewayUrl: simulatorUrl,
      transactionId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error initiating payment',
    });
  }
};

// @desc    SSLCommerz / Simulator payment success callback
// @route   POST /api/payment/success or GET /api/payment/success
export const paymentSuccess = async (req, res) => {
  try {
    const tran_id = req.body.tran_id || req.query.tran_id;
    const card_type = req.body.card_type || req.body.card_issuer || 'bKash/Nagad/Card';

    if (!tran_id) {
      return res.redirect(`${CLIENT_URL}/payment/fail?error=MissingTransactionId`);
    }

    const order = await Order.findOne({ transactionId: tran_id });

    if (!order) {
      return res.redirect(`${CLIENT_URL}/payment/fail?error=OrderNotFound`);
    }

    // Update order status to paid
    order.status = 'paid';
    order.paymentMethod = card_type;
    await order.save();

    // Auto-create Enrollment
    await Enrollment.findOneAndUpdate(
      { studentId: order.studentId, courseId: order.courseId },
      {
        studentId: order.studentId,
        courseId: order.courseId,
        orderId: order._id,
        enrolledAt: new Date(),
        progressPercentage: 0,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Payment SUCCESS for transaction ${tran_id}. Enrollment created!`);

    res.redirect(`${CLIENT_URL}/payment/success?tran_id=${tran_id}&courseId=${order.courseId}`);
  } catch (error) {
    console.error('Payment success handler error:', error);
    res.redirect(`${CLIENT_URL}/payment/fail?error=ServerProcessingError`);
  }
};

// @desc    Payment fail callback
// @route   POST /api/payment/fail
export const paymentFail = async (req, res) => {
  try {
    const tran_id = req.body.tran_id || req.query.tran_id;

    if (tran_id) {
      await Order.findOneAndUpdate({ transactionId: tran_id }, { status: 'failed' });
    }

    res.redirect(`${CLIENT_URL}/payment/fail?tran_id=${tran_id || ''}`);
  } catch (error) {
    res.redirect(`${CLIENT_URL}/payment/fail`);
  }
};

// @desc    Payment cancel callback
// @route   POST /api/payment/cancel
export const paymentCancel = async (req, res) => {
  try {
    const tran_id = req.body.tran_id || req.query.tran_id;

    if (tran_id) {
      await Order.findOneAndUpdate({ transactionId: tran_id }, { status: 'failed' });
    }

    res.redirect(`${CLIENT_URL}/payment/fail?tran_id=${tran_id || ''}&reason=cancelled`);
  } catch (error) {
    res.redirect(`${CLIENT_URL}/payment/fail`);
  }
};

// @desc    Simulated SSLCommerz checkout page for local sandbox testing
// @route   GET /api/payment/simulate-checkout
export const simulateCheckout = async (req, res) => {
  const { tran_id } = req.query;

  const order = await Order.findOne({ transactionId: tran_id }).populate('courseId studentId');

  if (!order) {
    return res.status(404).send('Transaction not found');
  }

  const course = order.courseId;
  const student = order.studentId;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>SSLCommerz Sandbox Payment — TutorNova</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-[#0b2545]; min-height: 100vh; align-items: center; justify-content: center; margin: 0; padding: 20px; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 20px; max-width: 480px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .logo { font-size: 24px; font-weight: 800; color: #fbbf24; margin-bottom: 20px; text-align: center; }
        .badge { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 11px; padding: 4px 10px; border-radius: 99px; text-transform: uppercase; font-weight: 700; text-align: center; display: inline-block; }
        .amount { font-size: 32px; font-weight: 900; color: #ffffff; text-align: center; margin: 16px 0; }
        .details { background: #0f172a; border-radius: 12px; padding: 16px; font-size: 13px; margin-bottom: 24px; line-height: 1.6; border: 1px solid #334155; }
        .btn { width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: transform 0.1s; margin-bottom: 10px; }
        .btn-bkash { background: #e2136e; color: white; }
        .btn-nagad { background: #f7931e; color: white; }
        .btn-card { background: #2563eb; color: white; }
        .btn-cancel { background: transparent; color: #94a3b8; border: 1px solid #475569; }
        .btn:hover { opacity: 0.9; transform: translateY(-1px); }
      </style>
    </head>
    <body>
      <div class="card">
        <div style="text-align:center;"><span class="badge">SSLCommerz Sandbox Gateway</span></div>
        <div class="logo">TutorNova Payment</div>
        <div class="amount">৳ ${order.amount.toLocaleString('en-BD')} <span style="font-size:14px;font-weight:400;color:#94a3b8">BDT</span></div>
        
        <div class="details">
          <div><strong>Course:</strong> ${course?.title || 'TutorNova Course'}</div>
          <div><strong>Student:</strong> ${student?.name || 'Student'} (${student?.email})</div>
          <div><strong>Tran ID:</strong> <code>${tran_id}</code></div>
        </div>

        <form action="${BACKEND_URL}/api/payment/success" method="POST">
          <input type="hidden" name="tran_id" value="${tran_id}">
          <input type="hidden" name="card_type" value="bKash Mobile Banking">
          <button type="submit" class="btn btn-bkash">Pay via bKash (Sandbox Success)</button>
        </form>

        <form action="${BACKEND_URL}/api/payment/success" method="POST">
          <input type="hidden" name="tran_id" value="${tran_id}">
          <input type="hidden" name="card_type" value="Nagad Mobile Banking">
          <button type="submit" class="btn btn-nagad">Pay via Nagad (Sandbox Success)</button>
        </form>

        <form action="${BACKEND_URL}/api/payment/success" method="POST">
          <input type="hidden" name="tran_id" value="${tran_id}">
          <input type="hidden" name="card_type" value="Visa / Mastercard">
          <button type="submit" class="btn btn-card">Pay via Debit/Credit Card</button>
        </form>

        <form action="${BACKEND_URL}/api/payment/cancel" method="POST">
          <input type="hidden" name="tran_id" value="${tran_id}">
          <button type="submit" class="btn btn-cancel">Cancel Transaction</button>
        </form>
      </div>
    </body>
    </html>
  `);
};
