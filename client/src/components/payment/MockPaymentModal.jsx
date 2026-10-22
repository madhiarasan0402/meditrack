import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { paymentService } from '../../services/paymentService';

export const MockPaymentModal = ({
  isOpen,
  onClose,
  bookingDetails, // { referenceType: 'Appointment'|'TestBooking', referenceId, title, amount }
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState('mock_card');
  const [simulateResult, setSimulateResult] = useState('SUCCESS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  if (!bookingDetails) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await paymentService.processMockCheckout({
        referenceType: bookingDetails.referenceType,
        referenceId: bookingDetails.referenceId,
        paymentMethod,
        simulateResult
      });

      if (res.success) {
        setSuccessReceipt(res.data.payment);
        if (onPaymentSuccess) {
          onPaymentSuccess(res.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setSuccessReceipt(null);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="MediTrack Secure Mock Checkout"
      maxWidth="max-w-lg"
    >
      {successReceipt ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Payment Confirmed!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Your healthcare booking has been verified and the journey timeline advanced.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left font-mono text-xs space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-bold text-slate-900">{successReceipt.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt No:</span>
              <span>{successReceipt.gatewayResponse?.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-emerald-600">₹{successReceipt.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auth Code:</span>
              <span>{successReceipt.gatewayResponse?.authCode}</span>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition"
          >
            Done & View Updated Journey
          </button>
        </div>
      ) : (
        <form onSubmit={handlePay} className="space-y-5">
          {/* Order Summary */}
          <div className="bg-primary-50/60 border border-primary-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-700 font-semibold uppercase tracking-wider">Service Booking</p>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{bookingDetails.title}</h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Amount Payable</span>
              <p className="text-xl font-extrabold text-primary-700">₹{bookingDetails.amount}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Simulated Payment Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('mock_card')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition text-xs font-semibold ${
                  paymentMethod === 'mock_card'
                    ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Card (Debit/Credit)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mock_upi')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition text-xs font-semibold ${
                  paymentMethod === 'mock_upi'
                    ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mock_netbanking')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition text-xs font-semibold ${
                  paymentMethod === 'mock_netbanking'
                    ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* Payment Fields (Demo mock) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            {paymentMethod === 'mock_card' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Simulated Card Number</label>
                  <input
                    type="text"
                    disabled
                    value="4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242"
                    className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Expiry</label>
                    <input type="text" disabled value="12/28" className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">CVV</label>
                    <input type="text" disabled value="888" className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-600" />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'mock_upi' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Simulated Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  disabled
                  value="patient.demo@okhdfcbank"
                  className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-600"
                />
              </div>
            )}

            {paymentMethod === 'mock_netbanking' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bank Gateway</label>
                <select disabled className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-600">
                  <option>State Bank of India (SBI Simulation)</option>
                  <option>HDFC Bank (Sandbox)</option>
                  <option>ICICI Bank (Demo)</option>
                </select>
              </div>
            )}
          </div>

          {/* Academic Simulation Mode Switch */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <span className="block text-xs font-bold text-amber-900 mb-1.5">
              Evaluation Demonstration Mode
            </span>
            <div className="flex items-center space-x-4 text-xs">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="simulateResult"
                  value="SUCCESS"
                  checked={simulateResult === 'SUCCESS'}
                  onChange={() => setSimulateResult('SUCCESS')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-emerald-800">Simulate Success (Confirm Booking)</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="simulateResult"
                  value="FAIL"
                  checked={simulateResult === 'FAIL'}
                  onChange={() => setSimulateResult('FAIL')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="font-semibold text-rose-800">Simulate Decline</span>
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MERN-isolated simulated sandbox. No real monetary transactions.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-primary-600/20 transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Contacting Bank Gateway...</span>
              </>
            ) : (
              <span>Authorise Payment of ₹{bookingDetails.amount}</span>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
};
