'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  User,
  BookOpen,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface OrderItem {
  _id: string;
  studentId?: {
    _id: string;
    name: string;
    email: string;
  };
  courseId?: {
    _id: string;
    title: string;
    price: number;
    subject: string;
  };
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  senderNumber?: string;
  transactionId: string;
  createdAt?: string;
}

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedTrx, setCopiedTrx] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchApi('/admin/payments');
      if (data && data.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data?.message || 'Failed to load payments');
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: 'paid' | 'failed' | 'pending') => {
    setUpdatingId(orderId);
    try {
      const data = await fetchApi('/admin/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to update status');
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert(err?.message || 'Error updating payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrx(text);
    setTimeout(() => setCopiedTrx(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? 'Recently'
      : d.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const studentName = order.studentId?.name || '';
    const studentEmail = order.studentId?.email || '';
    const courseTitle = order.courseId?.title || '';
    const trx = order.transactionId || (order as any).trxId || '';
    const sender = order.senderNumber || (order as any).senderMobile || '';
    const method = order.paymentMethod || '';

    const matchesSearch =
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.includes(searchTerm) ||
      method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const paidCount = orders.filter((o) => o.status === 'paid').length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-300">
              Financial Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0b2545]">
            Payment & Order Transactions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Monitor bKash, Nagad, and Rocket payments, verify TrxIDs, and manage student course enrollments.
          </p>
        </div>

        <button
          onClick={loadPayments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0b2545]">
            ৳ {totalRevenue.toLocaleString('en-BD')}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Verified Paid Volume</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0b2545]">{orders.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Submitted TrxIDs</p>
        </div>

        {/* Paid / Verified */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Paid</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{paidCount}</div>
          <p className="text-[11px] text-slate-500 font-medium">Enrolled Students</p>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Action</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</div>
          <p className="text-[11px] text-slate-500 font-medium">Requires Admin Check</p>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TrxID, student name, mobile, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0b2545]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-full md:w-auto overflow-x-auto">
          {(['all', 'paid', 'pending', 'failed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-white text-[#0b2545] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? 'All Orders' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p>Loading payment transactions from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto" />
            <p>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No payment transactions found</p>
            <p className="text-xs text-slate-400">
              When students submit bKash, Nagad, or Rocket payments, they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono font-bold tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">TrxID & Mobile</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const method = order.paymentMethod || 'bKash';
                  const isPaid = order.status === 'paid';
                  const isPending = order.status === 'pending';
                  const trxIdDisplay = order.transactionId || (order as any).trxId || (order as any).tran_id || 'PENDING_TRX';
                  const senderDisplay = order.senderNumber || (order as any).senderMobile || (order as any).mobile || 'Not Provided';

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0b2545] text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {order.studentId?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {order.studentId?.name || 'Unknown Student'}
                            </div>
                            <div className="text-slate-500 text-[11px]">
                              {order.studentId?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-4 px-4 font-medium text-slate-800 max-w-[180px]">
                        <div className="truncate font-semibold">{order.courseId?.title || 'Course Listing'}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{order.courseId?.subject || 'CS'}</div>
                      </td>

                      {/* Payment Method Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-xs ${
                            method === 'bKash'
                              ? 'bg-[#e2136e]'
                              : method === 'Nagad'
                              ? 'bg-[#f7931e]'
                              : method === 'Rocket'
                              ? 'bg-[#8c3494]'
                              : 'bg-indigo-600'
                          }`}
                        >
                          {method}
                        </span>
                      </td>

                      {/* TrxID & Mobile */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono font-bold text-[#0b2545]">
                            <span className="bg-slate-100 text-[#0b2545] px-2.5 py-1 rounded-lg border border-slate-200 font-extrabold text-xs tracking-wider">
                              {trxIdDisplay}
                            </span>
                            {trxIdDisplay && trxIdDisplay !== 'PENDING_TRX' && (
                              <button
                                onClick={() => copyToClipboard(trxIdDisplay)}
                                className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Copy TrxID"
                              >
                                {copiedTrx === trxIdDisplay ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                          <div className="text-[11px] font-mono flex items-center gap-1 text-slate-700">
                            <span className="text-slate-400 font-medium">Sender:</span>
                            <strong className="text-indigo-900 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {senderDisplay}
                            </strong>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        ৳ {order.amount?.toLocaleString('en-BD')} BDT
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : isPending ? (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid && (
                            <button
                              disabled={updatingId === order._id}
                              onClick={() => handleUpdateStatus(order._id, 'paid')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{updatingId === order._id ? 'Verifying...' : 'Approve & Enroll'}</span>
                            </button>
                          )}

                          {isPaid && (
                            <button
                              disabled={updatingId === order._id}
                              onClick={() => handleUpdateStatus(order._id, 'pending')}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              Mark Pending
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
