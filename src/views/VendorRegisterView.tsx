import React, { useState } from 'react';
import {
  Building2,
  Mail,
  User,
  Phone,
  Lock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OtpModal } from '../components/OtpModal';
import { IkoroduArea, Vendor } from '../types';

export const VendorRegisterView: React.FC = () => {
  const { addVendorRegistration, categories, setActiveTab, setRole } = useApp();

  const [step, setStep] = useState<number>(1);
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Fashion & Apparel');
  const [subcategory, setSubcategory] = useState('Aso-Ebi & Fabrics');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState<IkoroduArea>('Sabo');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState(3);

  // Owner Info
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [password, setPassword] = useState('');

  // Media
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=300');
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200');
  const [cacDocName, setCacDocName] = useState<string>('');

  const [submittedVendor, setSubmittedVendor] = useState<Vendor | null>(null);

  const ikoroduAreas: IkoroduArea[] = [
    'Sabo',
    'Garage',
    'Agric',
    'Ebute',
    'Ayetoro',
    'Igbogbo',
    'Imota',
    'Ijede',
    'Ipakodo',
  ];

  const handleStep1EmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setOtpModalOpen(true);
  };

  const handleOtpVerified = () => {
    setEmailVerified(true);
    setOtpModalOpen(false);
    setStep(2);
  };

  const handleSubmitRegistration = () => {
    const newVendor = addVendorRegistration({
      businessName,
      category,
      subcategory,
      description,
      address,
      area,
      whatsapp: whatsapp || '2348000000000',
      phone: phone || '+234 800 000 0000',
      website,
      instagram,
      yearsInBusiness,
      ownerName: ownerName || 'Business Owner',
      ownerEmail: email,
      ownerPhone: ownerPhone || phone,
      logoUrl,
      coverImageUrl,
      cacCertificateUrl: cacDocName ? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5' : undefined,
    });

    setSubmittedVendor(newVendor);
    setStep(6); // Success Step!
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl text-center space-y-2">
        <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest">
          SME Onboarding Portal
        </span>
        <h1 className="text-2xl sm:text-4xl font-black font-display">
          Register Your Business on IkoroduSquare
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
          Get a beautiful storefront, receive WhatsApp customer orders directly, and expand your reach across Lagos.
        </p>

        {/* Wizard Step Indicator Bar */}
        <div className="pt-4 flex items-center justify-center gap-2 max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-amber-400' : 'bg-emerald-900'
              }`}
            />
          ))}
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        email={email}
        isOpen={otpModalOpen}
        onVerified={handleOtpVerified}
        onCancel={() => setOtpModalOpen(false)}
      />

      {/* STEP 1: Email Address & Verification */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-emerald-950 font-display">
              Step 1: Enter Business Email
            </h2>
            <p className="text-xs text-gray-600">
              We will immediately send an OTP verification code via Resend Email API.
            </p>
          </div>

          <form onSubmit={handleStep1EmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Business Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@ikorodubakery.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Send OTP Verification Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: Business Information */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-emerald-950 font-display">
                Step 2: Business Information
              </h2>
              <p className="text-xs text-gray-600">Provide details about your storefront and location</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Step 2 of 5
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Business / Storefront Name *</label>
              <input
                type="text"
                placeholder="e.g. Ikorodu Mega Bakery & Sweets"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Area in Ikorodu *</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                >
                  {ikoroduAreas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Physical Address *</label>
              <input
                type="text"
                placeholder="e.g. 14 Sabo Market Road, Opposite Sagamu Garage, Ikorodu"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-emerald-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Business Description</label>
              <textarea
                rows={3}
                placeholder="Describe your products, artisan specialties, and service offerings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Number (For Direct Orders) *</label>
                <input
                  type="text"
                  placeholder="e.g. 2348023345566"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-emerald-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  placeholder="e.g. +234 802 334 5566"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-emerald-950"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-100 font-bold text-xs text-gray-700 rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow"
              >
                Continue to Owner Info →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Owner Information */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-emerald-950 font-display">
                Step 3: Owner / Administrator Information
              </h2>
              <p className="text-xs text-gray-600">Verification details for the primary account holder</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Step 3 of 5
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Owner / Manager Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Chief Mrs. Folake Balogun"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Owner Personal Phone</label>
              <input
                type="text"
                placeholder="e.g. +234 802 334 5566"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Account Password *</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-gray-100 font-bold text-xs text-gray-700 rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow"
              >
                Continue to Media Uploads →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Business Media & Verification Docs */}
      {step === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-emerald-950 font-display">
                Step 4: Business Media & Credentials
              </h2>
              <p className="text-xs text-gray-600">Upload store logo, banner, and optional CAC document</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Step 4 of 5
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Logo Image URL</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Cover Header Image URL</label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
              />
            </div>

            {/* CAC Document upload dropzone */}
            <div className="p-4 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-center space-y-2">
              <Upload className="w-8 h-8 text-emerald-700 mx-auto" />
              <div className="text-xs font-bold text-emerald-950">
                {cacDocName ? `Uploaded: ${cacDocName}` : 'CAC Certificate / Government Registration (Optional)'}
              </div>
              <p className="text-[11px] text-gray-500">
                Uploading CAC registration speeds up your Verified Blue Badge approval.
              </p>
              <button
                type="button"
                onClick={() => setCacDocName('CAC_REGISTRATION_IKORODU_2025.pdf')}
                className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold"
              >
                Simulate CAC Upload
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-gray-100 font-bold text-xs text-gray-700 rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow"
              >
                Review Application →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Summary & Final Submission */}
      {step === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-emerald-950 font-display">
            Step 5: Review & Submit Registration
          </h2>

          <div className="p-4 bg-gray-50 rounded-2xl border text-xs space-y-2">
            <p>
              <strong>Business:</strong> {businessName} ({category})
            </p>
            <p>
              <strong>Location:</strong> {address}, {area}, Ikorodu
            </p>
            <p>
              <strong>WhatsApp:</strong> +{whatsapp}
            </p>
            <p>
              <strong>Owner:</strong> {ownerName} ({email})
            </p>
            <p>
              <strong>CAC Certificate:</strong> {cacDocName ? 'Attached' : 'Not attached'}
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Upon submission, your storefront will enter <strong>Pending Admin Approval</strong> status. You can immediately access your Vendor Dashboard to upload products and select manual FCMB payment options.
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-4 py-2 bg-gray-100 font-bold text-xs text-gray-700 rounded-xl"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmitRegistration}
              className="px-8 py-3 bg-gradient-to-r from-emerald-800 to-teal-800 text-amber-300 font-bold text-xs rounded-xl shadow-lg hover:from-emerald-900 hover:to-teal-900"
            >
              Submit Application
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Submission Success / Pending Notice */}
      {step === 6 && submittedVendor && (
        <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-emerald-700" />
          </div>

          <h2 className="text-2xl font-black text-emerald-950 font-display">
            Application Submitted Successfully!
          </h2>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 max-w-md mx-auto space-y-1">
            <p className="font-bold">Status: Awaiting Admin Approval</p>
            <p className="text-gray-700">
              "Your application for <strong>{submittedVendor.businessName}</strong> is awaiting approval. You can manage your dashboard, edit your profile, and prepare products, but your storefront will not appear publicly until approved by an Admin."
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                setRole('vendor');
                setActiveTab('vendor-portal');
              }}
              className="px-6 py-3 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow"
            >
              Go to Vendor Dashboard
            </button>
            <button
              onClick={() => {
                setRole('admin');
                setActiveTab('admin-portal');
              }}
              className="px-6 py-3 bg-amber-400 text-emerald-950 font-bold text-xs rounded-xl shadow"
            >
              Demo Admin Approval Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
