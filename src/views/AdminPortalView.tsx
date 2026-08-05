import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  CreditCard,
  Eye,
  FileText,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  DollarSign,
  UserCheck,
  Ban,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MANUAL_PAYMENT_INFO } from '../data/mockData';

export const AdminPortalView: React.FC = () => {
  const {
    vendors,
    products,
    promotionRequests,
    approveVendor,
    rejectVendor,
    suspendVendor,
    toggleVerifyVendor,
    toggleFeatureVendor,
    approvePromotionRequest,
    rejectPromotionRequest,
    auditLogs,
    setActiveTab,
    setSelectedVendorId,
  } = useApp();

  const [adminTab, setAdminTab] = useState<'pending-vendors' | 'promotions-queue' | 'all-vendors' | 'audit-logs'>('pending-vendors');

  const pendingVendors = vendors.filter((v) => v.status === 'pending');
  const pendingPromos = promotionRequests.filter((pr) => pr.status === 'pending');
  const approvedPromos = promotionRequests.filter((pr) => pr.status === 'approved');

  const totalRevenueNaira = approvedPromos.reduce((sum, pr) => sum + pr.amountNaira, 0);

  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header & System Stats */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-emerald-950 p-6 sm:p-8 rounded-3xl shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-emerald-950 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider rounded-full">
              Platform Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display">
              IkoroduSquare Control Center
            </h1>
            <p className="text-xs text-emerald-950 font-semibold">
              Approve local vendor storefronts and verify manual FCMB bank transfer receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-amber-300 shadow-sm text-center">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">Manual Revenue</span>
              <strong className="text-lg font-black text-emerald-950 font-mono">
                ₦{totalRevenueNaira.toLocaleString()}
              </strong>
            </div>
            <div className="bg-emerald-950 text-white p-3 rounded-2xl shadow-sm text-center">
              <span className="text-[10px] font-bold text-emerald-300 block uppercase">Action Required</span>
              <strong className="text-lg font-black text-amber-300 font-mono">
                {pendingVendors.length + pendingPromos.length} Pending
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        <button
          onClick={() => setAdminTab('pending-vendors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'pending-vendors'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Vendor Approvals Queue ({pendingVendors.length})</span>
          {pendingVendors.length > 0 && (
            <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {pendingVendors.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('promotions-queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            adminTab === 'promotions-queue'
              ? 'bg-emerald-950 text-amber-300 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Manual FCMB Payment Verification ({pendingPromos.length})</span>
          {pendingPromos.length > 0 && (
            <span className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {pendingPromos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('all-vendors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            adminTab === 'all-vendors' ? 'bg-emerald-950 text-amber-300' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Directory Merchants ({vendors.length})
        </button>

        <button
          onClick={() => setAdminTab('audit-logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            adminTab === 'audit-logs' ? 'bg-emerald-950 text-amber-300' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          System Audit Logs
        </button>
      </div>

      {/* TAB 1: Pending Vendor Approvals Queue */}
      {adminTab === 'pending-vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-emerald-950 font-display">
              Pending Vendor Registrations
            </h3>
            <span className="text-xs text-gray-500">
              Review CAC documents & owner details before publishing to IkoroduSquare.
            </span>
          </div>

          {pendingVendors.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">Queue is Clear!</h4>
              <p className="text-xs text-gray-500">All registered SME vendors have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={vendor.logoUrl}
                        alt={vendor.businessName}
                        className="w-16 h-16 rounded-2xl object-cover border border-gray-200"
                      />
                      <div>
                        <h4 className="text-lg font-black text-emerald-950 font-display">
                          {vendor.businessName}
                        </h4>
                        <p className="text-xs text-emerald-800 font-bold">
                          Category: {vendor.category} • {vendor.area}, Ikorodu
                        </p>
                        <p className="text-xs text-gray-500">
                          Owner: {vendor.ownerName} ({vendor.ownerEmail})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveVendor(vendor.id)}
                        className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-300" />
                        <span>Approve Vendor</span>
                      </button>

                      <button
                        onClick={() => rejectVendor(vendor.id, 'Incomplete details')}
                        className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border text-xs text-gray-700 space-y-1">
                    <p>
                      <strong>Address:</strong> {vendor.address}
                    </p>
                    <p>
                      <strong>Description:</strong> {vendor.description}
                    </p>
                    <p>
                      <strong>WhatsApp:</strong> +{vendor.whatsapp} | <strong>Phone:</strong> {vendor.phone}
                    </p>
                    <p>
                      <strong>CAC Document:</strong>{' '}
                      {vendor.cacCertificateUrl ? (
                        <span className="text-emerald-700 font-bold underline cursor-pointer">
                          View Attached CAC Document
                        </span>
                      ) : (
                        <span className="text-gray-400">Not provided (Optional)</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Manual Bank Transfer Promotion Queue */}
      {adminTab === 'promotions-queue' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>FCMB Bank Account Statement Reconciliation</span>
            </div>
            <p>
              Verify incoming bank transfers sent to <strong>{MANUAL_PAYMENT_INFO.bankName}</strong> ({MANUAL_PAYMENT_INFO.accountName} - <strong className="font-mono text-amber-300">{MANUAL_PAYMENT_INFO.accountNumber}</strong>). Match transaction reference & amount before clicking Approve.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black text-emerald-950 font-display">
              Pending Manual Payment Verification Requests
            </h3>

            {pendingPromos.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-950">No Pending Payments</h4>
                <p className="text-xs text-gray-500">All uploaded bank receipts have been verified.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPromos.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-amber-400 text-emerald-950 font-bold text-xs rounded-full">
                            {req.promoTitle}
                          </span>
                          <span className="font-mono font-black text-lg text-emerald-950">
                            ₦{req.amountNaira.toLocaleString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-emerald-950 mt-1">
                          Merchant: {req.vendorName}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono">
                          Txn Ref: <strong>{req.txnRef}</strong> • Duration: {req.durationWeeks} Weeks
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewProofUrl(req.proofUrl)}
                          className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4 text-emerald-700" />
                          <span>View Receipt</span>
                        </button>

                        <button
                          onClick={() => approvePromotionRequest(req.id, 'FCMB statement matched.')}
                          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          <span>Approve Payment & Activate</span>
                        </button>

                        <button
                          onClick={() => rejectPromotionRequest(req.id, 'Invalid bank transaction ref.')}
                          className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border">
                        <strong>Vendor Note:</strong> {req.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: All Vendors Management */}
      {adminTab === 'all-vendors' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-emerald-950 font-display">
            All Registered Storefronts ({vendors.length})
          </h3>

          <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
                <tr>
                  <th className="p-4">Storefront</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Area</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Badges</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={v.logoUrl} alt={v.businessName} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <strong className="font-bold text-emerald-950 block">{v.businessName}</strong>
                        <span className="text-[10px] text-gray-400">{v.ownerEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{v.category}</td>
                    <td className="p-4 font-bold text-emerald-800">{v.area}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {v.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 space-x-1">
                      {v.isVerified && <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">Verified</span>}
                      {v.isFeatured && <span className="px-2 py-0.5 bg-amber-400 text-emerald-950 text-[10px] font-bold rounded">Featured</span>}
                    </td>
                    <td className="p-4 space-x-1">
                      <button
                        onClick={() => toggleVerifyVendor(v.id)}
                        className="px-2 py-1 bg-emerald-100 text-emerald-950 font-bold text-[10px] rounded hover:bg-emerald-200"
                      >
                        Toggle Verify
                      </button>
                      <button
                        onClick={() => toggleFeatureVendor(v.id)}
                        className="px-2 py-1 bg-amber-100 text-amber-950 font-bold text-[10px] rounded hover:bg-amber-200"
                      >
                        Toggle Feature
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {adminTab === 'audit-logs' && (
        <div className="space-y-4">
          <h3 className="text-base font-black text-emerald-950 font-display">
            System Audit & Security Logs
          </h3>

          <div className="bg-white rounded-3xl border border-gray-150 p-4 space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between text-xs">
                <div>
                  <strong className="font-bold text-emerald-900">{log.action}</strong>
                  <p className="text-gray-600">{log.details}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{log.performedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Preview Modal */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 text-center">
            <h3 className="text-base font-bold text-emerald-950">Payment Proof Screenshot</h3>
            <div className="h-64 rounded-2xl overflow-hidden bg-gray-100 border">
              <img src={previewProofUrl} alt="Bank Receipt Proof" className="w-full h-full object-contain" />
            </div>
            <button
              onClick={() => setPreviewProofUrl(null)}
              className="px-6 py-2 bg-emerald-950 text-white font-bold text-xs rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
