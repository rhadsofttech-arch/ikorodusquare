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
  Image as ImageIcon,
  Check,
  Globe,
  FileText,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OtpModal } from '../components/OtpModal';
import { IkoroduArea, Vendor, User as CustomerUser } from '../types';

type AccountType = 'vendor' | 'customer';

export const VendorRegisterView: React.FC = () => {
  const { addVendorRegistration, registerCustomer, categories, setActiveTab, setRole, signUpWithSupabase } = useApp();

  // Mode Switch: Vendor or Customer Registration
  const [accountType, setAccountType] = useState<AccountType>('vendor');

  // Registration loading and error states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [regError, setRegError] = useState<string>('');

  // Shared OTP State
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  // ================= VENDOR REGISTRATION STATE =================
  const [vendorStep, setVendorStep] = useState<number>(1);
  const [vEmail, setVEmail] = useState('');
  
  // Step 2: Business Info
  const [vBusinessName, setVBusinessName] = useState('');
  const [vCategory, setVCategory] = useState('Fashion & Apparel');
  const [vSubcategory, setVSubcategory] = useState('Aso-Ebi & Fabrics');
  const [vDescription, setVDescription] = useState('');
  const [vAddress, setVAddress] = useState('');
  const [vLga, setVLga] = useState('Ikorodu');
  const [vArea, setVArea] = useState<IkoroduArea>('Sabo');
  const [vState, setVState] = useState('Lagos State');
  const [vCountry, setVCountry] = useState('Nigeria');
  const [vWhatsapp, setVWhatsapp] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vYearsInBusiness, setVYearsInBusiness] = useState<number>(3);

  // Step 3: Owner Info
  const [vOwnerName, setVOwnerName] = useState('');
  const [vOwnerPhone, setVOwnerPhone] = useState('');
  const [vPassword, setVPassword] = useState('');
  const [vConfirmPassword, setVConfirmPassword] = useState('');
  const [vPasswordError, setVPasswordError] = useState('');

  // Step 4: Business Media & Docs
  const [vLogoUrl, setVLogoUrl] = useState('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=300');
  const [vCoverImageUrl, setVCoverImageUrl] = useState('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200');
  const [vGalleryUrls, setVGalleryUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600',
  ]);
  const [vNewGalleryUrl, setVNewGalleryUrl] = useState('');
  const [vCacDocName, setVCacDocName] = useState<string>('');
  const [vNinDocName, setVNinDocName] = useState<string>('');

  const [submittedVendor, setSubmittedVendor] = useState<Vendor | null>(null);

  // ================= CUSTOMER REGISTRATION STATE =================
  const [customerStep, setCustomerStep] = useState<number>(1);
  const [cEmail, setCEmail] = useState('');
  const [cFirstName, setCFirstName] = useState('');
  const [cLastName, setCLastName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [cConfirmPassword, setCConfirmPassword] = useState('');
  const [cArea, setCArea] = useState<IkoroduArea>('Sabo');
  const [cAcceptTerms, setCAcceptTerms] = useState<boolean>(false);
  const [cPasswordError, setCPasswordError] = useState('');
  const [registeredCustomer, setRegisteredCustomer] = useState<CustomerUser | null>(null);

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
    'Offin',
    'Ota-Ona',
    'Ita-Elewa',
  ];

  // ---------------- VENDOR HANDLERS ----------------
  const handleVendorStep1Email = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vEmail.trim() || !vEmail.includes('@')) return;
    setOtpModalOpen(true);
  };

  const handleVendorOtpVerified = () => {
    setEmailVerified(true);
    setOtpModalOpen(false);
    setVendorStep(2);
  };

  const handleVendorStep2Next = () => {
    if (!vBusinessName.trim() || !vAddress.trim()) {
      alert('Please fill in required fields (Business Name & Address).');
      return;
    }
    setVendorStep(3);
  };

  const handleVendorStep3Next = () => {
    if (!vOwnerName.trim() || !vPassword) {
      alert('Please enter Owner Name and Password.');
      return;
    }
    if (vPassword !== vConfirmPassword) {
      setVPasswordError('Passwords do not match');
      return;
    }
    setVPasswordError('');
    setVendorStep(4);
  };

  const handleAddGalleryUrl = () => {
    if (vNewGalleryUrl.trim()) {
      setVGalleryUrls((prev) => [...prev, vNewGalleryUrl.trim()]);
      setVNewGalleryUrl('');
    }
  };

  const handleVendorSubmitRegistration = async () => {
    setSubmitting(true);
    setRegError('');
    try {
      // 1. Create real Supabase Auth user (automatically creates public.profiles record)
      const authResult = await signUpWithSupabase(vEmail, vPassword, {
        firstName: vOwnerName,
        phone: vPhone || vOwnerPhone,
        role: 'vendor',
        area: vArea,
      });

      const userId = authResult?.user?.id || `v-user-${Date.now()}`;

      // 2. Register vendor in database and app state
      const newVendor = addVendorRegistration({
        id: userId,
        businessName: vBusinessName,
        category: vCategory,
        subcategory: vSubcategory,
        description: vDescription,
        address: vAddress,
        lga: vLga,
        area: vArea,
        state: vState,
        country: vCountry,
        whatsapp: vWhatsapp || '2348156655091',
        phone: vPhone || '+234 815 665 5091',
        yearsInBusiness: vYearsInBusiness,
        ownerName: vOwnerName || 'Business Owner',
        ownerEmail: vEmail,
        ownerPhone: vOwnerPhone || vPhone,
        logoUrl: vLogoUrl,
        coverImageUrl: vCoverImageUrl,
        galleryUrls: vGalleryUrls,
        cacCertificateUrl: vCacDocName ? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5' : undefined,
        ninDocUrl: vNinDocName ? 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5' : undefined,
      });

      setSubmittedVendor(newVendor);
      setVendorStep(6); // Success screen
    } catch (err: any) {
      console.error('Vendor auth registration error:', err);
      setRegError(err.message || 'Failed to create user in Supabase Authentication. Registration cannot proceed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- CUSTOMER HANDLERS ----------------
  const handleCustomerStep1Email = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cEmail.trim() || !cEmail.includes('@')) return;
    setOtpModalOpen(true);
  };

  const handleCustomerOtpVerified = () => {
    setEmailVerified(true);
    setOtpModalOpen(false);
    setCustomerStep(2);
  };

  const handleCustomerSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cFirstName.trim() || !cLastName.trim() || !cPhone.trim()) {
      alert('Please complete all required fields.');
      return;
    }
    if (cPassword !== cConfirmPassword) {
      setCPasswordError('Passwords do not match');
      return;
    }
    if (!cAcceptTerms) {
      alert('You must accept the Terms and Conditions to complete registration.');
      return;
    }

    setCPasswordError('');
    setRegError('');
    setSubmitting(true);

    try {
      // 1. Create real Supabase Auth user (automatically creates public.profiles record)
      const authResult = await signUpWithSupabase(cEmail, cPassword, {
        firstName: cFirstName,
        lastName: cLastName,
        phone: cPhone,
        role: 'customer',
        area: cArea,
      });

      const userId = authResult?.user?.id || `usr-${Date.now()}`;

      // 2. Register customer in state/profiles
      const newCustomer = registerCustomer({
        id: userId,
        firstName: cFirstName,
        lastName: cLastName,
        email: cEmail,
        phone: cPhone,
        area: cArea,
      });

      setRegisteredCustomer(newCustomer);
      setCustomerStep(3); // Success Screen (Auto Logged In)
    } catch (err: any) {
      console.error('Customer auth registration error:', err);
      setRegError(err.message || 'Failed to create user in Supabase Authentication. Registration cannot proceed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Top Banner with Selector Switch */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl text-center space-y-4">
        <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/50">
          IkoroduSquare Portal Account Creation
        </span>
        <h1 className="text-2xl sm:text-4xl font-black font-display">
          Join the Ikorodu Digital Marketplace
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
          {accountType === 'vendor'
            ? 'Get a storefront, receive WhatsApp orders, and grow your local business.'
            : 'Discover local artisan businesses, save products to your wishlist, and send direct enquiries.'}
        </p>

        {/* Segmented Account Type Switcher */}
        <div className="inline-flex items-center bg-emerald-900/80 p-1.5 rounded-2xl border border-emerald-800 shadow-inner max-w-md w-full">
          <button
            type="button"
            onClick={() => {
              setAccountType('vendor');
              setEmailVerified(false);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              accountType === 'vendor'
                ? 'bg-amber-400 text-emerald-950 shadow-md font-black'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Vendor Registration</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAccountType('customer');
              setEmailVerified(false);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              accountType === 'customer'
                ? 'bg-amber-400 text-emerald-950 shadow-md font-black'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Customer Registration</span>
          </button>
        </div>

        {/* Progress bar for Vendor */}
        {accountType === 'vendor' && vendorStep < 6 && (
          <div className="pt-2 flex items-center justify-center gap-2 max-w-md mx-auto">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= vendorStep ? 'bg-amber-400' : 'bg-emerald-900'
                }`}
              />
            ))}
          </div>
        )}

        {/* Progress bar for Customer */}
        {accountType === 'customer' && customerStep < 3 && (
          <div className="pt-2 flex items-center justify-center gap-2 max-w-xs mx-auto">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= customerStep ? 'bg-amber-400' : 'bg-emerald-900'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shared OTP Modal */}
      <OtpModal
        email={accountType === 'vendor' ? vEmail : cEmail}
        isOpen={otpModalOpen}
        onVerified={accountType === 'vendor' ? handleVendorOtpVerified : handleCustomerOtpVerified}
        onCancel={() => setOtpModalOpen(false)}
      />

      {/* ========================================================================= */}
      {/* VENDOR REGISTRATION FLOW                                                 */}
      {/* ========================================================================= */}
      {accountType === 'vendor' && (
        <>
          {/* VENDOR STEP 1: Enter Email & Send OTP */}
          {vendorStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block mb-1">
                  Step 1 of 5
                </span>
                <h2 className="text-xl font-black text-emerald-950 font-display">
                  Step 1: Enter Business Email Address
                </h2>
                <p className="text-xs text-gray-600">
                  Enter your business email address. We'll send you a verification code to continue.
                </p>
              </div>

              <form onSubmit={handleVendorStep1Email} className="space-y-4">
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
                      value={vEmail}
                      onChange={(e) => setVEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Security Verification:</strong> We will send a 6-digit verification code to verify that you own this email address before continuing registration.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* VENDOR STEP 2: Business Information */}
          {vendorStep === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-emerald-950 font-display">
                    Step 2: Business Information
                  </h2>
                  <p className="text-xs text-gray-600">Enter detailed information about your business storefront</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Step 2 of 5
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikorodu Mega Bakery & Sweets"
                    value={vBusinessName}
                    onChange={(e) => setVBusinessName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                    <select
                      value={vCategory}
                      onChange={(e) => setVCategory(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950 cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Subcategory</label>
                    <input
                      type="text"
                      placeholder="e.g. Artisanal Bread, Cakes, Pastries"
                      value={vSubcategory}
                      onChange={(e) => setVSubcategory(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-emerald-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your products, artisan specialties, and service offerings..."
                    value={vDescription}
                    onChange={(e) => setVDescription(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-emerald-950 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Business Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Sabo Market Road, Opposite Sagamu Garage, Ikorodu"
                    value={vAddress}
                    onChange={(e) => setVAddress(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-emerald-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">LGA</label>
                    <input
                      type="text"
                      value={vLga}
                      onChange={(e) => setVLga(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Area in Ikorodu *</label>
                    <select
                      value={vArea}
                      onChange={(e) => setVArea(e.target.value as IkoroduArea)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950 cursor-pointer"
                    >
                      {ikoroduAreas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={vState}
                      onChange={(e) => setVState(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={vCountry}
                      onChange={(e) => setVCountry(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 2348156655091"
                      value={vWhatsapp}
                      onChange={(e) => setVWhatsapp(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. +234 815 665 5091"
                      value={vPhone}
                      onChange={(e) => setVPhone(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-emerald-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Years in Business</label>
                  <input
                    type="number"
                    min={0}
                    value={vYearsInBusiness}
                    onChange={(e) => setVYearsInBusiness(Number(e.target.value))}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setVendorStep(1)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 font-bold text-xs text-gray-700 rounded-xl transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVendorStep2Next}
                    className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
                  >
                    <span>Continue to Owner Info</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VENDOR STEP 3: Owner Information */}
          {vendorStep === 3 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-emerald-950 font-display">
                    Step 3: Owner Information
                  </h2>
                  <p className="text-xs text-gray-600">Verification details for the business account holder</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Step 3 of 5
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Mrs. Folake Balogun"
                    value={vOwnerName}
                    onChange={(e) => setVOwnerName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Owner Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +234 815 665 5091"
                    value={vOwnerPhone}
                    onChange={(e) => setVOwnerPhone(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-emerald-950"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={vPassword}
                      onChange={(e) => setVPassword(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={vConfirmPassword}
                      onChange={(e) => setVConfirmPassword(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {vPasswordError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {vPasswordError}
                  </p>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setVendorStep(2)}
                    className="px-5 py-2.5 bg-gray-100 font-bold text-xs text-gray-700 rounded-xl"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVendorStep3Next}
                    className="px-6 py-3 bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow flex items-center gap-2"
                  >
                    <span>Continue to Business Media</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VENDOR STEP 4: Business Media */}
          {vendorStep === 4 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-emerald-950 font-display">
                    Step 4: Business Media & Verification Docs
                  </h2>
                  <p className="text-xs text-gray-600">Upload store logo, cover image, gallery, and verification files</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Step 4 of 5
                </span>
              </div>

              <div className="space-y-4">
                {/* Logo */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Business Logo Image URL</label>
                  <div className="flex items-center gap-3">
                    <img src={vLogoUrl} alt="Logo Preview" className="w-12 h-12 rounded-xl object-cover border" />
                    <input
                      type="text"
                      value={vLogoUrl}
                      onChange={(e) => setVLogoUrl(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cover Image Header URL</label>
                  <div className="space-y-2">
                    <img src={vCoverImageUrl} alt="Cover Preview" className="w-full h-24 rounded-xl object-cover border" />
                    <input
                      type="text"
                      value={vCoverImageUrl}
                      onChange={(e) => setVCoverImageUrl(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Gallery Images</label>
                  <div className="grid grid-cols-4 gap-2">
                    {vGalleryUrls.map((url, idx) => (
                      <img key={idx} src={url} alt={`Gallery ${idx}`} className="w-full h-16 rounded-lg object-cover border" />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste Image URL to add to gallery..."
                      value={vNewGalleryUrl}
                      onChange={(e) => setVNewGalleryUrl(e.target.value)}
                      className="flex-1 p-2 bg-gray-50 border rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold"
                    >
                      Add Image
                    </button>
                  </div>
                </div>

                {/* Verification Documents (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl text-center space-y-2">
                    <Upload className="w-6 h-6 text-emerald-700 mx-auto" />
                    <div className="text-xs font-bold text-emerald-950">
                      {vCacDocName ? `Uploaded: ${vCacDocName}` : 'CAC Certificate (Optional)'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setVCacDocName('CAC_REG_IKORODU_2025.pdf')}
                      className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                    >
                      Attach CAC Document
                    </button>
                  </div>

                  <div className="p-4 border-2 border-dashed border-teal-300 bg-teal-50/50 rounded-2xl text-center space-y-2">
                    <Upload className="w-6 h-6 text-teal-700 mx-auto" />
                    <div className="text-xs font-bold text-teal-950">
                      {vNinDocName ? `Uploaded: ${vNinDocName}` : 'NIN Document (Optional)'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setVNinDocName('NIN_SLIP_VERIFIED.pdf')}
                      className="px-3 py-1 bg-teal-700 text-white rounded-lg text-[11px] font-bold"
                    >
                      Attach NIN Slip
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setVendorStep(3)}
                    className="px-5 py-2.5 bg-gray-100 font-bold text-xs text-gray-700 rounded-xl"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setVendorStep(5)}
                    className="px-6 py-3 bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow flex items-center gap-2"
                  >
                    <span>Review Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VENDOR STEP 5: Review & Final Submission */}
          {vendorStep === 5 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-emerald-950 font-display">
                  Step 5: Review & Submit Application
                </h2>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Step 5 of 5
                </span>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border text-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <p><strong>Business Name:</strong> {vBusinessName}</p>
                  <p><strong>Category:</strong> {vCategory} / {vSubcategory}</p>
                  <p><strong>Address:</strong> {vAddress}</p>
                  <p><strong>Location:</strong> {vArea}, {vLga}, {vState}</p>
                  <p><strong>WhatsApp:</strong> +{vWhatsapp}</p>
                  <p><strong>Phone:</strong> {vPhone}</p>
                  <p><strong>Owner Name:</strong> {vOwnerName}</p>
                  <p><strong>Owner Email:</strong> {vEmail}</p>
                  <p><strong>CAC Certificate:</strong> {vCacDocName ? 'Attached' : 'Not attached'}</p>
                  <p><strong>NIN Document:</strong> {vNinDocName ? 'Attached' : 'Not attached'}</p>
                </div>
              </div>

              {regError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Registration Failed</p>
                    <p>{regError}</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Upon submission, your application will enter <strong>Pending Admin Approval</strong>. You can immediately access your Vendor Dashboard to upload products and select promotional plans.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setVendorStep(4)}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gray-100 font-bold text-xs text-gray-700 rounded-xl"
                >
                  ← Edit Media
                </button>
                <button
                  type="button"
                  onClick={handleVendorSubmitRegistration}
                  disabled={submitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-amber-300 font-bold text-xs rounded-xl shadow-lg hover:from-emerald-900 hover:to-teal-900 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'Creating Supabase Account...' : 'Submit Application Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* VENDOR STEP 6: Submission Success Screen */}
          {vendorStep === 6 && submittedVendor && (
            <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-10 h-10 text-emerald-700" />
              </div>

              <h2 className="text-2xl font-black text-emerald-950 font-display">
                Vendor Application Submitted Successfully!
              </h2>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 max-w-md mx-auto space-y-1">
                <p className="font-bold text-emerald-900">Status: Awaiting Admin Approval</p>
                <p className="text-gray-700">
                  Your registration for <strong>{submittedVendor.businessName}</strong> was received. You can now manage products and select promotional packages on your Vendor Dashboard.
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => {
                    setActiveTab('vendor-portal');
                  }}
                  className="px-6 py-3 bg-emerald-800 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-900"
                >
                  Go to Vendor Dashboard
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* CUSTOMER REGISTRATION FLOW                                               */}
      {/* ========================================================================= */}
      {accountType === 'customer' && (
        <>
          {/* CUSTOMER STEP 1: Enter Email & OTP Verification */}
          {customerStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg inline-block mb-1">
                  Customer Step 1 of 2
                </span>
                <h2 className="text-xl font-black text-emerald-950 font-display">
                  Step 1: Enter Email Address
                </h2>
                <p className="text-xs text-gray-600">
                  Enter your email address. We'll send you a verification code to continue.
                </p>
              </div>

              <form onSubmit={handleCustomerStep1Email} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. customer@ikorodu.ng"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-emerald-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
                  <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <p>
                    <strong>Security Verification:</strong> We will send a 6-digit verification code to verify that you own this email address before continuing registration.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* CUSTOMER STEP 2: Complete Registration */}
          {customerStep === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-emerald-950 font-display">
                    Step 2: Complete Customer Registration
                  </h2>
                  <p className="text-xs text-gray-600">Enter your profile details to create your customer account</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Step 2 of 2
                </span>
              </div>

              <form onSubmit={handleCustomerSubmitRegistration} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Babatunde"
                      value={cFirstName}
                      onChange={(e) => setCFirstName(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adebayo"
                      value={cLastName}
                      onChange={(e) => setCLastName(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +234 815 665 5091"
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-emerald-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Area in Ikorodu *</label>
                    <select
                      value={cArea}
                      onChange={(e) => setCArea(e.target.value as IkoroduArea)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-950 cursor-pointer"
                    >
                      {ikoroduAreas.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={cPassword}
                      onChange={(e) => setCPassword(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={cConfirmPassword}
                      onChange={(e) => setCConfirmPassword(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {cPasswordError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {cPasswordError}
                  </p>
                )}

                {regError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Registration Failed</p>
                      <p>{regError}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={cAcceptTerms}
                    onChange={(e) => setCAcceptTerms(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="acceptTerms" className="text-xs text-gray-600 cursor-pointer">
                    I accept the <strong className="text-emerald-950">Terms & Conditions</strong> and Privacy Policy of IkoroduSquare.
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCustomerStep(1)}
                    disabled={submitting}
                    className="px-5 py-2.5 bg-gray-100 font-bold text-xs text-gray-700 rounded-xl"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-amber-300 font-bold text-xs rounded-xl shadow-lg hover:from-emerald-900 hover:to-teal-900 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-amber-300" />
                    <span>{submitting ? 'Creating Supabase Account...' : 'Create Account & Auto Log In'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CUSTOMER STEP 3: Auto-Logged In Success */}
          {customerStep === 3 && registeredCustomer && (
            <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-700" />
              </div>

              <h2 className="text-2xl font-black text-emerald-950 font-display">
                Account Created & Logged In!
              </h2>

              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Welcome to IkoroduSquare, <strong className="text-emerald-900">{registeredCustomer.firstName} {registeredCustomer.lastName}</strong>. You are automatically logged in as a Customer.
              </p>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 max-w-md mx-auto space-y-1">
                <p><strong>Email:</strong> {registeredCustomer.email}</p>
                <p><strong>Location:</strong> {registeredCustomer.area}, Ikorodu</p>
                <p><strong>Status:</strong> <span className="text-emerald-700 font-bold">Active & Verified</span></p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="px-6 py-3 bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl shadow hover:bg-emerald-900 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Product Marketplace</span>
                </button>
                <button
                  onClick={() => setActiveTab('customer-portal')}
                  className="px-6 py-3 bg-gray-100 text-emerald-950 font-bold text-xs rounded-xl shadow hover:bg-gray-200"
                >
                  Go to Customer Dashboard
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
