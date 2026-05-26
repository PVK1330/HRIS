import { useState } from 'react';

export default function BillingSettings() {
  const [billingInfo] = useState({
    plan: 'Professional',
    status: 'active',
    amount: 99.99,
    currency: 'USD',
    billingCycle: 'Monthly',
    nextBillingDate: '2026-06-26',
    paymentMethod: '****1234',
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 font-medium">Current Plan</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{billingInfo.plan}</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 font-medium">Billing Cycle</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{billingInfo.billingCycle}</p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 font-medium">Amount</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {billingInfo.currency} {billingInfo.amount.toFixed(2)}
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600 font-medium">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
              <span className="font-bold text-slate-900 capitalize">{billingInfo.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Next Billing Date</h4>
        <p className="text-slate-600">{new Date(billingInfo.nextBillingDate).toLocaleDateString()}</p>
      </div>

      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Payment Method</h4>
        <p className="text-slate-600">{billingInfo.paymentMethod}</p>
      </div>

      <div className="flex gap-3 pt-4">
        <button className="px-4 py-2 bg-teal-700 text-white rounded-lg font-medium hover:bg-teal-800 transition-colors">
          Update Payment Method
        </button>
        <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
          Change Plan
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> For billing inquiries or invoice management, please contact our support team.
        </p>
      </div>
    </div>
  );
}
