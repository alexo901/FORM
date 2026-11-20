"use client";

import { useEffect, useState } from "react";

type FormState = {
  loginId: string;
  fullName: string;
  email: string;
  mobile: string;
  amount: string;
  bankName: string;
  transferOption: string;
};

const initial: FormState = {
  loginId: "", fullName: "", email: "", mobile: "",
  amount: "", bankName: "", transferOption: "",
};

const steps = ["Reference", "Your details", "Refund details", "Status"];

function StepBar({ step }: { step: number }) {
  return (
    <div className="stepbar" aria-label={`Step ${step + 1} of 4`}>
      {steps.map((name, i) => (
        <div className={`step ${i < step ? "done" : ""} ${i === step ? "active" : ""}`} key={name}>
          <span className="step-dot">{i < step ? "✓" : `0${i + 1}`}</span>
          <span className="step-name">{name}</span>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string;
}) {
  return <label className="field">
    <span className="field-label">{label}</span>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required />
    {hint && <span className="field-hint">{hint}</span>}
  </label>;
}

export default function HomePage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initial);
  const [busy, setBusy] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  const update = (key: keyof FormState, value: string) =>
    setData(prev => ({ ...prev, [key]: value }));

  const next = () => {
    setError("");
    if (step === 0 && !data.loginId.trim()) return setError("Enter your reference ID to continue.");
    if (step === 1) {
      if (!data.fullName.trim() || !data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !data.mobile.trim())
        return setError("Please complete your name, a valid email and mobile number.");
    }
    if (step === 2) {
      if (!data.amount.trim() || !Number.isFinite(Number(data.amount.replace(/,/g, ""))) || Number(data.amount.replace(/,/g, "")) <= 0 || !data.bankName.trim() || !data.transferOption)
        return setError("Please enter a valid amount and complete the refund method details.");
      void submit();
      return;
    }
    setStep(s => s + 1);
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: data.loginId,
          fullName: data.fullName,
          address: "",
          email: data.email,
          mobile: data.mobile,
          dateOfBirth: "",
          amount: data.amount,
          bankName: data.bankName,
          transferOption: data.transferOption,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.id) throw new Error("We couldn't submit your request. Please try again.");
      setSubmissionId(json.id);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "A network error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (step !== 3 || !submissionId || status !== "pending") return;
    let active = true;
    const check = async () => {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`, { cache: "no-store" });
        const json = await res.json();
        if (active && json.success && json.data?.status) setStatus(json.data.status);
      } catch { /* retry on the next interval */ }
    };
    void check();
    const timer = window.setInterval(check, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [step, submissionId, status]);

  return (
    <main className="portal-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="/" aria-label="Refund desk home">
          <span className="brand-mark">r<span>.</span></span>
          <span>refund<span className="brand-light">desk</span></span>
        </a>
        <div className="secure-tag"><span className="secure-dot" /> REQUEST PORTAL</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">CUSTOMER SUPPORT · REFUNDS</p>
          <h1>A clearer way<br />to <em>move forward.</em></h1>
          <p className="hero-description">Submit a cancellation or refund request in a few simple steps. We’ll keep you informed as it’s reviewed.</p>
          <div className="trust-note"><span className="trust-icon">↗</span><span><strong>Transparent by design</strong><br />Track your request without sharing passwords, one-time codes or card details.</span></div>
        </div>

        <section className="form-card" aria-label="Refund and cancellation request">
          <div className="card-topline"><span>REFUND / CANCELLATION</span><span>FORM 01 — 04</span></div>
          <StepBar step={step} />

          {step === 0 && <div className="form-stage" key="reference">
            <p className="stage-kicker">LET’S GET STARTED</p>
            <h2>Find your request.</h2>
            <p className="stage-copy">Enter the reference or customer ID associated with your original transaction.</p>
            <Field label="Reference ID" value={data.loginId} onChange={v => update("loginId", v)} placeholder="e.g. REF-2048-AB" hint="Use your customer or order reference—not a password." />
          </div>}

          {step === 1 && <div className="form-stage" key="details">
            <p className="stage-kicker">A LITTLE ABOUT YOU</p>
            <h2>Your contact details.</h2>
            <p className="stage-copy">We’ll use these details only to identify your request and contact you about its progress.</p>
            <Field label="Full name" value={data.fullName} onChange={v => update("fullName", v)} placeholder="Your full name" />
            <Field label="Email address" type="email" value={data.email} onChange={v => update("email", v)} placeholder="you@example.com" />
            <Field label="Mobile number" type="tel" value={data.mobile} onChange={v => update("mobile", v)} placeholder="+1 555 010 2040" />
          </div>}

          {step === 2 && <div className="form-stage" key="refund">
            <p className="stage-kicker">REQUEST INFORMATION</p>
            <h2>Refund details.</h2>
            <p className="stage-copy">Tell us the amount and your preferred refund route. Never enter account numbers or sign-in credentials.</p>
            <Field label="Requested amount (USD)" value={data.amount} onChange={v => update("amount", v)} placeholder="0.00" hint="Enter the amount you are requesting—not your account balance." />
            <Field label="Bank or payment provider name" value={data.bankName} onChange={v => update("bankName", v)} placeholder="Name only" />
            <div className="field">
              <span className="field-label">Preferred refund method</span>
              <div className="method-grid">
                {[
                  ["checking", "Checking account", "Bank transfer"],
                  ["saving", "Savings account", "Bank transfer"],
                  ["zelle", "Zelle", "Payment service"],
                  ["coinbase", "Coinbase", "Payment service"],
                ].map(([value, title, sub]) => <button type="button" key={value} onClick={() => update("transferOption", value)} className={`method-option ${data.transferOption === value ? "selected" : ""}`}>
                  <span className="method-radio">{data.transferOption === value ? "●" : ""}</span>
                  <span><strong>{title}</strong><small>{sub}</small></span>
                </button>)}
              </div>
            </div>
          </div>}

          {step === 3 && <div className="form-stage status-stage" key="status">
            <div className={`status-symbol ${status === "approved" || status === "verified" ? "success" : ""}`}>{status === "approved" || status === "verified" ? "✓" : "↻"}</div>
            <p className="stage-kicker">REQUEST #{submissionId}</p>
            <h2>{status === "approved" || status === "verified" ? "Your request is approved." : status === "rejected" ? "Request needs attention." : "Your request is in review."}</h2>
            <p className="stage-copy">{status === "approved" || status === "verified" ? "The review is complete. Please use the contact details you provided if you need help with the next steps." : status === "rejected" ? "The review team has updated your request. Please contact the official support channel for more information." : "Your request has been received. Our team is reviewing the details and this page will refresh its status automatically."}</p>
            <div className="status-panel">
              <div><span>REFERENCE</span><strong>#{submissionId}</strong></div>
              <div><span>CURRENT STATUS</span><strong className="pending-label">{status.toUpperCase()}</strong></div>
              <div><span>STATUS CHECK</span><strong>Every 5 seconds</strong></div>
            </div>
            <p className="safety-copy">For your protection, this portal will never ask you to follow a bank-login link, share an OTP, or provide your password or full card/account number.</p>
          </div>}

          {error && <p className="form-error" role="alert">{error}</p>}
          {step < 3 && <div className="form-actions">
            {step > 0 && <button type="button" className="back-button" onClick={() => { setError(""); setStep(s => s - 1); }}>Back</button>}
            <button type="button" className="primary-button" disabled={busy} onClick={next}>
              {busy ? "Submitting…" : step === 2 ? "Submit request" : "Continue"} <span>↗</span>
            </button>
          </div>}
          <div className="card-foot"><span>YOUR INFORMATION IS HANDLED WITH CARE</span><span>STEP {Math.min(step + 1, 4)} OF 4</span></div>
        </section>
      </section>

      <footer className="site-footer"><span>© {new Date().getFullYear()} Refund Desk</span><span>Never share passwords, OTPs or full payment credentials.</span></footer>
    </main>
  );
}
